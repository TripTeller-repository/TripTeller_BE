import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignInDto } from './dto/sign-in.dto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDevice } from './user-device.interface';
import { Login } from './login.schema';

// 소셜 로그인 사용자 정보 제공자
export enum EAuthProvider {
  GOOGLE = 'Google',
  NAVER = 'Naver',
  KAKAO = 'Kakao',
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Login') private readonly loginModel: Model<Login>,
    private readonly userService: UserService,
  ) {}

  // 회원 가입
  async createUser(createUserDto: CreateUserDto) {
    // DB에 중복된 이메일이 있는지 확인
    const existingEmail = await this.userModel.findOne({ email: createUserDto.email });
    if (existingEmail) {
      throw new UnauthorizedException('이미 가입된 계정입니다.');
    }

    // 비밀번호 해시화하여 암호 저장
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const newUser = {
      ...createUserDto,
      password: hashedPassword,
    };

    // 아닌 경우 회원가입 진행
    const user = await this.userModel.create(newUser);
    await user.save();
    return user;
  }

  // 토큰 생성
  // userId, authProvider 및 디바이스 정보를 기반으로 JWT 토큰을 생성
  async createTokens(userId: string, authProvider: string, deviceInfo: UserDevice, ip: string) {
    const loginAt = new Date();

    // 로그인 세션 저장
    const loginSession = await this.loginModel.create({
      userId,
      deviceInfo,
      ipAddress: ip,
      lastLoginAt: loginAt,
    });
    await loginSession.save();

    // JWT payload 생성 (디바이스 및 IP 정보 포함)
    const payload = {
      userId,
      authProvider,
      // deviceId: deviceInfo.deviceId,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ip,
      loginAt: loginAt.toISOString(),
      sessionId: loginSession._id.toString(),
    };

    // Access Token 생성 (10분)
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '10m' });

    // Refresh Token 생성 (1시간)
    const refreshToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });

    return { accessToken, refreshToken };
  }

  // 액세스 토큰 재발급
  async refreshAccessToken(refreshToken: string, deviceInfo: UserDevice, ip: string) {
    try {
      // Refresh 토큰 검증
      const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY) as jwt.JwtPayload;
      const { userId, authProvider, sessionId } = decoded;

      // 로그인 세션 확인
      const session = await this.loginModel.findById(sessionId);
      if (!session) {
        throw new UnauthorizedException('유효하지 않은 세션입니다.');
      }

      // 의심스러운 로그인 감지 (IP나 디바이스 정보가 다를 경우)
      const isSuspicious = this.detectSuspiciousLogin(session, deviceInfo, ip);

      // 로그인 세션 업데이트
      session.lastLoginAt = new Date();
      session.ipAddress = ip;
      session.deviceInfo = deviceInfo;
      await session.save();

      // 새 페이로드 생성
      const payload = {
        userId,
        authProvider,
        // deviceId: deviceInfo.deviceId,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip,
        loginAt: new Date().toISOString(),
        sessionId: session._id.toString(),
        suspicious: isSuspicious,
      };

      // 새 액세스 토큰 생성 (10분)
      const accessToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '10m' });

      return { accessToken, suspicious: isSuspicious };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Refresh token has expired');
      } else {
        throw new UnauthorizedException('Invalid refresh token');
      }
    }
  }

  // 로그인
  async signIn(signInDto: SignInDto, deviceInfo: UserDevice, ip: string) {
    try {
      // 이메일로 특정 회원 조회
      const user = await this.userService.findUserByEmail(signInDto.email);

      // 회원이 존재하지 않을 경우
      if (!user || user.deletedAt) {
        throw new UnauthorizedException('등록되지 않은 회원입니다.');
      }

      // 탈퇴한 회원인지 확인
      if (user.deletedAt !== null) {
        throw new UnauthorizedException('탈퇴한 회원입니다.');
      }

      // 비밀번호 확인
      const isPasswordValid = await this.verifyPassword(signInDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('잘못된 비밀번호입니다.');
      }

      // 최근 로그인 세션 확인
      const lastSession = await this.loginModel.findOne({ userId: user._id }).sort({ lastLoginAt: -1 });

      // 의심스러운 로그인 감지
      let suspicious = false;
      if (lastSession) {
        suspicious = this.detectSuspiciousLogin(lastSession, deviceInfo, ip);
      }

      // 토큰 발행
      const userIdString = user._id.toString();
      const { accessToken, refreshToken } = await this.createTokens(
        userIdString,
        user.authProvider || null,
        deviceInfo,
        ip,
      );

      // 로그인 성공 시 액세스 토큰과 리프레시 토큰 반환
      return { accessToken, refreshToken, suspicious };
    } catch (error) {
      throw new UnauthorizedException('로그인에 실패하였습니다.');
    }
  }

  // 의심스러운 로그인 감지
  private detectSuspiciousLogin(session: Login, deviceInfo: UserDevice, ip: string): boolean {
    // IP 주소가 다를 경우
    if (session.ipAddress !== ip) {
      return true;
    }

    // 브라우저나 OS가 변경된 경우
    if (session.deviceInfo.browser !== deviceInfo.browser || session.deviceInfo.os !== deviceInfo.os) {
      return true;
    }

    return false;
  }

  // 토큰 검증
  async verifyToken(token: string): Promise<jwt.JwtPayload> {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY) as jwt.JwtPayload;

      // 세션 ID가 있는 경우 세션 유효성 확인
      if (decoded.sessionId) {
        const session = await this.loginModel.findById(decoded.sessionId);
        if (!session) {
          throw new UnauthorizedException('Invalid session');
        }
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Token verification error');
      }
    }
  }

  // 카카오에서 토큰 받아오기
  async fetchKakaoToken(code: string | null) {
    try {
      const url = 'https://kauth.kakao.com/oauth/token';
      const data = {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_CALLBACK_URL,
        code: code,
      };
      const headers = {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      };
      const response = await axios.post(url, data, { headers: headers });

      const accessToken = response.data.access_token;

      return accessToken;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('카카오 토큰 요청 실패');
    }
  }

  // 받은 토큰 다시 넘겨주고 회원 정보 받아오기
  async fetchKakaoUserInfo(kakaoToken: string | null) {
    try {
      const url = 'https://kapi.kakao.com/v2/user/me';
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${kakaoToken}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      const nickname = data.properties.nickname;
      const email = data.kakao_account.email;

      if (!nickname || !email) {
        throw new UnauthorizedException('닉네임 혹은 이메일이 없습니다.');
      }

      const userInfo = { email, nickname, authProvider: EAuthProvider.KAKAO };
      return userInfo;
    } catch (error) {
      throw new UnauthorizedException('카카오 유저 정보 요청 실패');
    }
  }

  // 소셜 로그인 처리
  async oauthSignIn(userInfo, deviceInfo: UserDevice, ip: string) {
    try {
      // 이메일로 회원 조회
      const existingUser = await this.userModel.findOne({ email: userInfo.email });

      let user;
      if (!existingUser) {
        // 가입되지 않은 경우 회원가입 진행
        const newUser = {
          email: userInfo.email,
          authProvider: userInfo.authProvider,
          nickname: userInfo.nickname,
        };

        user = await this.userModel.create(newUser);
        await user.save();
      } else {
        user = existingUser;
      }

      // 토큰 발행
      const { accessToken, refreshToken } = await this.createTokens(
        user._id.toString(),
        userInfo.authProvider,
        deviceInfo,
        ip,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('OAuth sign-in failed:', error);
      throw new Error('OAuth sign-in failed.');
    }
  }

  // 비밀번호 해시화
  async hashPassword(password: string) {
    const saltRounds = 15;
    return await bcrypt.hash(password, saltRounds);
  }

  // 해시화된 비밀번호 검증
  async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // 회원 탈퇴
  async withdraw(userId: string) {
    try {
      // 회원 ID로 회원 조회
      const user = await this.userService.findUserById(userId);

      if (!user) {
        throw new NotFoundException('해당 ID를 가진 회원이 없습니다.');
      }

      // DB에 있는 회원 id에서 deletedAt의 값을 현재 시각(date)로 만들기
      await this.userService.deleteUserById(userId, new Date());

      // 모든 로그인 세션 삭제
      await this.loginModel.deleteMany({ userId });

      return { message: '해당 회원의 탈퇴처리가 완료되었습니다.' };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('회원 탈퇴 중 오류가 발생하였습니다.');
    }
  }

  // 로그아웃
  async logout(userId: string, sessionId: string) {
    // 특정 세션 삭제
    await this.loginModel.findByIdAndDelete(sessionId);
    return { message: '로그아웃 되었습니다.' };
  }

  // 로그인 이력 조회
  async getLoginHistory(userId: string) {
    try {
      // 해당 사용자의 로그인 이력 조회 (최근 10개)
      const loginHistory = await this.loginModel.find({ userId }).sort({ lastLoginAt: -1 }).limit(10);

      return loginHistory;
    } catch (error) {
      console.error('Failed to get login history:', error);
      throw new Error('로그인 이력 조회에 실패했습니다.');
    }
  }

  // 탈퇴한 회원인지 확인
  async isWithDrawn(userId: string) {
    const user = await this.userModel.findById({ _id: userId });
    if (!user || user.deletedAt !== null) {
      throw new UnauthorizedException('이미 탈퇴한 회원입니다.');
    }
  }
}
