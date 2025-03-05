import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/user/user.schema';
import { UserOAuth, EAuthProvider } from 'src/user/user-oauth.schema';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// 서비스 간 공유 인터페이스
export interface OAuthUserInfo {
  email: string;
  nickname?: string;
  profileImage?: string;
  providerId: string;
  provider: EAuthProvider;
  profile: any;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserOAuth.name) private readonly userOAuthModel: Model<UserOAuth>,
    private readonly configService: ConfigService,
  ) {
    this.validateEnvironmentVariables();
  }

  // 환경 변수 검증
  private validateEnvironmentVariables(): void {
    const requiredEnvVars = [
      'KAKAO_CLIENT_ID',
      'KAKAO_CALLBACK_URL',
      'KAKAO_REDIRECT_URI',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_CALLBACK_URL',
      'GOOGLE_REDIRECT_URI',
      'NAVER_CLIENT_ID',
      'NAVER_CLIENT_SECRET',
      'NAVER_CALLBACK_URL',
      'NAVER_REDIRECT_URI',
    ];

    const missingEnvVars = requiredEnvVars.filter((envVar) => !this.configService.get<string>(envVar));

    if (missingEnvVars.length > 0) {
      this.logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
  }

  // 소셜 로그인 통합 처리
  async processOAuthLogin(oauthUserInfo: OAuthUserInfo, ip?: string): Promise<User> {
    try {
      // 1. 해당 공급자+공급자ID로 기존 OAuth 연결 확인
      let oauthConnection = await this.userOAuthModel.findOne({
        provider: oauthUserInfo.provider,
        providerId: oauthUserInfo.providerId,
      });

      let user;

      // 2A. 기존 OAuth 연결이 있는 경우
      if (oauthConnection) {
        // 연결된 사용자 조회
        user = await this.userModel.findById(oauthConnection.userId);

        // 사용자가 없거나 탈퇴한 경우 처리
        if (!user || user.deletedAt) {
          if (user?.deletedAt) {
            throw new UnauthorizedException('탈퇴한 회원입니다.');
          } else {
            // OAuth 연결은 있지만 사용자가 없는 경우 (데이터 불일치)
            this.logger.error(`OAuth connection exists but user not found: ${oauthConnection.userId}`);

            // OAuth 연결 삭제 후 새 사용자 생성
            await this.userOAuthModel.deleteOne({ _id: oauthConnection._id });
            oauthConnection = null;
          }
        } else {
          // OAuth 연결 정보 업데이트
          oauthConnection.profile = oauthUserInfo.profile;
          oauthConnection.lastUsedAt = new Date();
          await oauthConnection.save();

          this.logger.log(`User ${user._id} logged in via ${oauthUserInfo.provider}`);
        }
      }

      // 2B. 기존 OAuth 연결이 없는 경우
      if (!oauthConnection) {
        // 이메일로 기존 사용자 확인
        user = await this.userModel.findOne({ email: oauthUserInfo.email });

        // 기존 사용자가 있는 경우
        if (user) {
          // 탈퇴한 회원인 경우
          if (user.deletedAt) {
            throw new UnauthorizedException('탈퇴한 회원입니다.');
          }

          // 새 OAuth 연결 생성
          const newOAuthConnection = new this.userOAuthModel({
            userId: user._id,
            provider: oauthUserInfo.provider,
            providerId: oauthUserInfo.providerId,
            email: oauthUserInfo.email,
            profile: oauthUserInfo.profile,
            lastUsedAt: new Date(),
          });

          await newOAuthConnection.save();
          this.logger.log(`New OAuth connection created for user ${user._id} with ${oauthUserInfo.provider}`);
        }
        // 새 사용자 생성
        else {
          // 새 사용자 생성
          user = new this.userModel({
            email: oauthUserInfo.email,
            password: null, // OAuth 로그인은 비밀번호 없음
            nickname: oauthUserInfo.nickname || oauthUserInfo.email.split('@')[0],
            profileImage: oauthUserInfo.profileImage || undefined,
            emailVerified: true, // OAuth는 이메일 검증됨으로 간주
            lastLoginAt: new Date(),
            lastLoginIp: ip || null,
            isActive: true,
          });

          await user.save();

          // OAuth 연결 생성
          const newOAuthConnection = new this.userOAuthModel({
            userId: user._id,
            provider: oauthUserInfo.provider,
            providerId: oauthUserInfo.providerId,
            email: oauthUserInfo.email,
            profile: oauthUserInfo.profile,
            lastUsedAt: new Date(),
          });

          await newOAuthConnection.save();
          this.logger.log(`New user created via ${oauthUserInfo.provider}: ${user._id}`);
        }
      }

      // 사용자 로그인 정보 업데이트
      user.lastLoginAt = new Date();
      user.lastLoginIp = ip || user.lastLoginIp;
      await user.save();

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`OAuth sign-in error: ${error.message}`, error.stack);
      throw new UnauthorizedException('소셜 로그인에 실패했습니다.');
    }
  }

  // 구글 OAuth 처리
  async processGoogleLogin(code: string): Promise<OAuthUserInfo> {
    try {
      // 구글 액세스 토큰 획득
      const googleToken = await this.fetchGoogleToken(code);

      // 구글 사용자 정보 획득
      const googleUserInfo = await this.fetchGoogleUserInfo(googleToken);

      return googleUserInfo;
    } catch (error) {
      this.logger.error(`Google login processing error: ${error.message}`, error.stack);
      throw new UnauthorizedException('구글 로그인 처리 중 오류가 발생했습니다.');
    }
  }

  // 네이버 OAuth 처리
  async processNaverLogin(code: string, state: string): Promise<OAuthUserInfo> {
    try {
      // 네이버 액세스 토큰 획득
      const naverToken = await this.fetchNaverToken(code, state);

      // 네이버 사용자 정보 획득
      const naverUserInfo = await this.fetchNaverUserInfo(naverToken);

      return naverUserInfo;
    } catch (error) {
      this.logger.error(`Naver login processing error: ${error.message}`, error.stack);
      throw new UnauthorizedException('네이버 로그인 처리 중 오류가 발생했습니다.');
    }
  }

  // 카카오 OAuth 처리
  async processKakaoLogin(code: string): Promise<OAuthUserInfo> {
    try {
      // 카카오 액세스 토큰 획득
      const kakaoToken = await this.fetchKakaoToken(code);

      // 카카오 사용자 정보 획득
      const kakaoUserInfo = await this.fetchKakaoUserInfo(kakaoToken);

      return kakaoUserInfo;
    } catch (error) {
      this.logger.error(`Kakao login processing error: ${error.message}`, error.stack);
      throw new UnauthorizedException('카카오 로그인 처리 중 오류가 발생했습니다.');
    }
  }

  // 구글 토큰 획득
  async fetchGoogleToken(code: string): Promise<string> {
    try {
      const url = 'https://oauth2.googleapis.com/token';
      const data = {
        code,
        client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
        grant_type: 'authorization_code',
      };

      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.access_token;
    } catch (error) {
      this.logger.error(`Google token fetch error: ${error.message}`, error.stack);
      throw new UnauthorizedException('구글 인증 토큰 요청에 실패했습니다.');
    }
  }

  // 구글 사용자 정보 획득
  async fetchGoogleUserInfo(googleToken: string): Promise<OAuthUserInfo> {
    try {
      const url = 'https://www.googleapis.com/userinfo/v2/me';
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      });

      if (!data.email) {
        throw new UnauthorizedException('구글 계정에서 이메일 정보를 가져올 수 없습니다.');
      }

      return {
        email: data.email,
        nickname: data.name || data.email.split('@')[0],
        profileImage: data.picture || undefined,
        providerId: data.id || data.sub,
        provider: EAuthProvider.GOOGLE,
        profile: data,
      };
    } catch (error) {
      this.logger.error(`Google user info fetch error: ${error.message}`, error.stack);
      throw new UnauthorizedException('구글 사용자 정보 요청에 실패했습니다.');
    }
  }

  // 네이버 토큰 획득
  async fetchNaverToken(code: string, state: string): Promise<string> {
    try {
      const url = 'https://nid.naver.com/oauth2.0/token';
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', this.configService.get<string>('NAVER_CLIENT_ID'));
      params.append('client_secret', this.configService.get<string>('NAVER_CLIENT_SECRET'));
      params.append('code', code);
      params.append('state', state);

      const response = await axios.post(url, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data.access_token;
    } catch (error) {
      this.logger.error(`Naver token fetch error: ${error.message}`, error.stack);
      throw new UnauthorizedException('네이버 인증 토큰 요청에 실패했습니다.');
    }
  }

  // 네이버 사용자 정보 획득
  async fetchNaverUserInfo(naverToken: string): Promise<OAuthUserInfo> {
    try {
      const url = 'https://openapi.naver.com/v1/nid/me';
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${naverToken}`,
        },
      });

      // 네이버 API 응답 구조: { resultcode, message, response: { id, email, nickname, ... } }
      if (data.resultcode !== '00' || !data.response) {
        throw new UnauthorizedException('네이버 API 응답이 유효하지 않습니다.');
      }

      const { id, email, nickname, profile_image } = data.response;

      if (!email) {
        throw new UnauthorizedException('네이버 계정에서 이메일 정보를 가져올 수 없습니다.');
      }

      return {
        email,
        nickname: nickname || email.split('@')[0],
        profileImage: profile_image || undefined,
        providerId: id,
        provider: EAuthProvider.NAVER,
        profile: data.response,
      };
    } catch (error) {
      this.logger.error(`Naver user info fetch error: ${error.message}`, error.stack);
      throw new UnauthorizedException('네이버 사용자 정보 요청에 실패했습니다.');
    }
  }

  // 카카오 토큰 획득
  async fetchKakaoToken(code: string): Promise<string> {
    try {
      const url = 'https://kauth.kakao.com/oauth/token';
      const data = {
        grant_type: 'authorization_code',
        client_id: this.configService.get<string>('KAKAO_CLIENT_ID'),
        redirect_uri: this.configService.get<string>('KAKAO_CALLBACK_URL'),
        code: code,
      };
      const headers = {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      };

      const response = await axios.post(url, data, { headers: headers });
      return response.data.access_token;
    } catch (error) {
      this.logger.error(`Kakao token fetch error: ${error.message}`, error.stack);
      throw new UnauthorizedException('카카오 인증 토큰 요청에 실패했습니다.');
    }
  }

  // 카카오 사용자 정보 획득
  async fetchKakaoUserInfo(kakaoToken: string): Promise<OAuthUserInfo> {
    try {
      const url = 'https://kapi.kakao.com/v2/user/me';
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${kakaoToken}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      const email = data.kakao_account.email;
      const nickname = data.properties.nickname;

      if (!email) {
        throw new UnauthorizedException('카카오 계정에서 이메일 정보를 가져올 수 없습니다.');
      }

      return {
        email,
        nickname: nickname || email.split('@')[0],
        profileImage: data.properties.profile_image || undefined,
        providerId: data.id.toString(),
        provider: EAuthProvider.KAKAO,
        profile: data,
      };
    } catch (error) {
      this.logger.error(`Kakao user info fetch error: ${error.message}`, error.stack);
      throw new UnauthorizedException('카카오 사용자 정보 요청에 실패했습니다.');
    }
  }

  // OAuth 계정 연결 해제
  async disconnectOAuthProvider(userId: string, provider: EAuthProvider): Promise<void> {
    try {
      // 사용자 확인
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // OAuth 연결 조회
      const oauthConnection = await this.userOAuthModel.findOne({
        userId: new Types.ObjectId(userId),
        provider,
      });

      if (!oauthConnection) {
        throw new NotFoundException(`${provider} 연결 정보를 찾을 수 없습니다.`);
      }

      // 비밀번호가 없고 다른 OAuth 연결이 없는 경우 차단
      const otherConnections = await this.userOAuthModel.countDocuments({
        userId: new Types.ObjectId(userId),
        provider: { $ne: provider },
      });

      if (!user.password && otherConnections === 0) {
        throw new BadRequestException('다른 로그인 방법이 없어 연결을 해제할 수 없습니다. 비밀번호를 설정해주세요.');
      }

      // OAuth 연결 삭제
      await this.userOAuthModel.deleteOne({ _id: oauthConnection._id });
      this.logger.log(`OAuth connection removed: ${userId} - ${provider}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`OAuth disconnect error: ${error.message}`, error.stack);
      throw new UnauthorizedException('소셜 로그인 연결 해제에 실패했습니다.');
    }
  }

  // 사용자의 모든 OAuth 연결 조회
  async getUserOAuthConnections(userId: string): Promise<any[]> {
    try {
      const connections = await this.userOAuthModel
        .find({
          userId: new Types.ObjectId(userId),
        })
        .select('provider lastUsedAt -_id');

      return connections;
    } catch (error) {
      this.logger.error(`Get OAuth connections error: ${error.message}`, error.stack);
      throw new UnauthorizedException('소셜 로그인 연결 정보 조회에 실패했습니다.');
    }
  }

  // 회원 탈퇴 시 모든 OAuth 연결 삭제
  async removeAllOAuthConnections(userId: string): Promise<void> {
    try {
      await this.userOAuthModel.deleteMany({ userId: new Types.ObjectId(userId) });
      this.logger.log(`All OAuth connections removed for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Remove OAuth connections error: ${error.message}`, error.stack);
    }
  }
}
