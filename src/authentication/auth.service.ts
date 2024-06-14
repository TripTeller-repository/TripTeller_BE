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
  // userId, authProvider을 기반으로 JWT 토큰을 생성
  async createTokens(userId: string, authProvider: string) {
    // JWT payload 생성
    const payload = { userId, authProvider };

    // Access Token 생성
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' }); // 실)5m, 테)1h

    // Refresh Token 생성 (쿠키)
    const refreshToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '4h' }); // 실)1h, 테)4h

    return { accessToken, refreshToken };
  }

  // 액세스 토큰 재발급
  async createAccessTokenAgain(userId: string, authProvider: string) {
    // JWT payload 생성
    const payload = { userId, authProvider };

    // Access Token 생성
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '10s' });

    return { accessToken };
  }

  ////// 로그인
  async signIn(signInDto: SignInDto) {
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

      // 비밀번호 생성
      const isPasswordValid = await this.verifyPassword(signInDto.password, user.password);

      // 비밀번호 확인
      if (!isPasswordValid) {
        throw new UnauthorizedException('잘못된 비밀번호입니다.');
      }

      // 해당 유저가 DB에 존재하고, user의 고유 ID가 있는 경우에는 토큰 발행
      if (user && user._id) {
        const userIdString = user._id.toString();

        return this.createTokens(userIdString, (user.authProvider = null));
      }
    } catch (error) {
      throw new UnauthorizedException('로그인에 실패하였습니다.');
    }
  }

  // 액세스 토큰 만료 여부 확인
  async isAccessTokenExpired(accessToken: string): Promise<boolean> {
    try {
      jwt.verify(accessToken, process.env.SECRET_KEY);
      return false;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return true;
      } else {
        throw new UnauthorizedException('Access token verification error');
      }
    }
  }

  // 리프레시 토큰 만료 여부 확인
  async isRefreshTokenExpired(refreshToken: string): Promise<boolean> {
    try {
      jwt.verify(refreshToken, process.env.SECRET_KEY);
      return false;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return true;
      } else {
        throw new UnauthorizedException('Refresh token verification error');
      }
    }
  }

  // 카카오에서 토큰 받아오기
  async fetchKakaoToken(code: string | null) {
    try {
      console.log('fetchKakaoToken 함수에 전달된 코드', code);
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

  // 소셜 로그인 성공 후 우리 서버로 로그인 처리
  async oauthSignIn(userInfo) {
    try {
      // 이메일로 회원 조회
      const existingUser = await this.userModel.findOne({ email: userInfo.email });

      let user;
      if (!existingUser) {
        // 가입되지 않은 경우 회원가입 진행
        const newUser: {
          email: string;
          authProvider: string;
          nickname: string;
        } = {
          email: userInfo.email,
          authProvider: userInfo.authProvider,
          nickname: userInfo.nickname,
        };

        user = await this.userModel.create(newUser);
        await user.save();
      } else {
        user = existingUser;
      }

      // 우리 서버 토큰 발행
      const tokens = await this.createTokens(user._id, userInfo.authProvider);
      return tokens;
    } catch (error) {
      console.error('OAuth sign-in failed:', error);
      throw new Error('OAuth sign-in failed.');
    }
  }

  // 토큰 검증
  async verifyToken(token: string): Promise<{ userId: string; authProvider: string }> {
    try {
      const { userId, authProvider } = jwt.verify(token, process.env.SECRET_KEY) as jwt.JwtPayload;

      return { userId, authProvider };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // 토큰 기한 만료
        throw new UnauthorizedException('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        // 토큰 형식 문제
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Token verification error');
      }
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

      return { message: '해당 회원의 탈퇴처리가 완료되었습니다.' };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('회원 탈퇴 중 오류가 발생하였습니다.');
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
