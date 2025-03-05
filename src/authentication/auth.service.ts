import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignInDto } from './dto/sign-in.dto';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { OAuthService } from './oauth.service';
import { TokenService } from './token.service';
import { EAuthProvider } from 'src/user/user-oauth.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly tokenService: TokenService,
    private readonly oauthService: OAuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    // 서비스 시작 시 필수 환경 변수 검증
    this.validateEnvironmentVariables();
  }

  // 환경 변수 검증
  private validateEnvironmentVariables(): void {
    const requiredEnvVars = ['SECRET_KEY', 'COOKIE_DOMAIN'];

    const missingEnvVars = requiredEnvVars.filter((envVar) => !this.configService.get<string>(envVar));

    if (missingEnvVars.length > 0) {
      this.logger.error(`필수 환경 변수가 없습니다: ${missingEnvVars.join(', ')}`);
    }
  }

  // 회원 가입 (이메일, 비밀번호)
  async createUser(createUserDto: CreateUserDto) {
    // DB에 중복된 이메일이 있는지 확인
    const existingEmail = await this.userModel.findOne({ email: createUserDto.email });
    if (existingEmail) {
      throw new UnauthorizedException('이미 가입된 계정입니다.');
    }

    // 비밀번호 해시화하여 암호 저장
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // 닉네임 생성 또는 확인
    let nickname = createUserDto.nickname;
    if (nickname) {
      nickname = await this.userService.generateUniqueNickname(nickname);
    }

    // 아닌 경우 회원가입 진행
    const newUser = await this.userModel.create({
      ...(createUserDto as Partial<User>),
      nickname,
      password: hashedPassword,
      lastLoginAt: new Date(),
      isActive: true,
    });

    await newUser.save();
    return newUser;
  }

  // 인증 응답 처리 (토큰 발급 및 쿠키 설정)
  async handleAuthResponse(user: any, req: Request, res: Response) {
    // 토큰 생성
    const tokens = await this.tokenService.createTokens(user._id.toString(), req.ip, req.headers['user-agent']);

    // 리프레시 토큰을 HTTP-only 쿠키로 설정
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: this.configService.get<string>('COOKIE_DOMAIN'),
      maxAge: 1800000, // 30분 (밀리초)
      sameSite: 'strict',
    });

    // 사용자 정보와 액세스 토큰 반환
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
      },
    };
  }

  // 이메일 & 비밀번호 로그인
  async signIn(signInDto: SignInDto, req: Request, res: Response) {
    try {
      // 이메일로 특정 회원 조회
      const user = await this.userService.findUserByEmail(signInDto.email);

      // 회원이 존재하지 않을 경우
      if (!user || user.deletedAt) {
        throw new UnauthorizedException('등록되지 않거나 탈퇴한 회원입니다.');
      }

      // 비밀번호 생성
      const isPasswordValid = await this.verifyPassword(signInDto.password, user.password);

      // 비밀번호 확인
      if (!isPasswordValid) {
        throw new UnauthorizedException('잘못된 비밀번호입니다.');
      }

      // 마지막 로그인 정보 업데이트
      user.lastLoginAt = new Date();
      user.lastLoginIp = req.ip;
      await user.save();

      return this.handleAuthResponse(user, req, res);
    } catch (error) {
      this.logger.error(`로그인 오류: ${error.message}`, error.stack);
      throw new UnauthorizedException('로그인에 실패하였습니다.');
    }
  }

  // 소셜 로그인 처리
  async socialLogin(provider: EAuthProvider, code: string, req: Request, res: Response) {
    try {
      let oauthUserInfo;

      // 제공자에 따른 로그인 처리
      switch (provider) {
        case EAuthProvider.GOOGLE:
          oauthUserInfo = await this.oauthService.processGoogleLogin(code);
          break;
        case EAuthProvider.KAKAO:
          oauthUserInfo = await this.oauthService.processKakaoLogin(code);
          break;
        case EAuthProvider.NAVER:
          // 네이버의 경우 state 파라미터도 필요
          const state = req.query.state as string;
          oauthUserInfo = await this.oauthService.processNaverLogin(code, state);
          break;
        default:
          throw new UnauthorizedException('지원하지 않는 소셜 로그인입니다');
      }

      // OAuth 사용자 정보로 로그인 처리
      const user = await this.oauthService.processOAuthLogin(oauthUserInfo, req.ip);

      // 인증 응답 처리
      return this.handleAuthResponse(user, req, res);
    } catch (error) {
      this.logger.error(`소셜 로그인 오류: ${error.message}`, error.stack);
      throw new UnauthorizedException('소셜 로그인에 실패했습니다');
    }
  }

  // 토큰 갱신
  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedException('리프레시 토큰이 없습니다');
      }

      // 새 토큰 발급
      const tokens = await this.tokenService.refreshTokens(refreshToken, req.ip, req.headers['user-agent']);

      // 새 리프레시 토큰 쿠키 설정
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        domain: this.configService.get<string>('COOKIE_DOMAIN'),
        maxAge: 300000, // 5분 (밀리초)
        sameSite: 'strict',
      });

      // 새 액세스 토큰 반환
      return { accessToken: tokens.accessToken };
    } catch (error) {
      this.logger.error(`토큰 갱신 오류: ${error.message}`, error.stack);
      throw new UnauthorizedException('토큰 갱신에 실패했습니다');
    }
  }

  // 로그아웃
  async logout(userId: string, req: Request, res: Response) {
    try {
      // 인증 헤더에서 토큰 ID 가져오기
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (token) {
        try {
          const decoded = await this.tokenService.verifyAccessToken(token);
          if (decoded.tokenId) {
            // 해당 토큰 취소
            await this.tokenService.revokeToken(userId, decoded.tokenId);
          }
        } catch (error) {
          // 로그아웃 중 토큰 검증 오류는 무시
          this.logger.warn(`로그아웃 중 토큰 검증 오류: ${error.message}`);
        }
      }

      // 리프레시 토큰 쿠키 삭제
      res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        domain: this.configService.get<string>('COOKIE_DOMAIN'),
        maxAge: 0,
        sameSite: 'strict',
      });

      return { message: '로그아웃 되었습니다' };
    } catch (error) {
      this.logger.error(`로그아웃 오류: ${error.message}`, error.stack);
      throw new UnauthorizedException('로그아웃에 실패했습니다');
    }
  }

  // 모든 기기에서 로그아웃
  async logoutAll(userId: string, res: Response) {
    try {
      // 모든 사용자 토큰 취소
      await this.tokenService.revokeAllUserTokens(userId);

      // 리프레시 토큰 쿠키 삭제
      res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        domain: this.configService.get<string>('COOKIE_DOMAIN'),
        maxAge: 0,
        sameSite: 'strict',
      });

      return { message: '모든 기기에서 로그아웃 되었습니다' };
    } catch (error) {
      this.logger.error(`모든 기기 로그아웃 오류: ${error.message}`, error.stack);
      throw new UnauthorizedException('모든 기기에서 로그아웃에 실패했습니다');
    }
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

  // 비밀번호 해시화
  async hashPassword(password: string) {
    const saltRounds = 15;
    return await bcrypt.hash(password, saltRounds);
  }

  // 해시화된 비밀번호 검증
  async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
