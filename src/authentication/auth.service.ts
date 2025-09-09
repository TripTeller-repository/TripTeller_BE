import { GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@user/services/user.service';
import { SignInDto } from './dto/sign-in.dto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDevice } from './interfaces/user-device.interface';
import { Login } from './login.schema';
import { User } from '@user/schemas/user.schema';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { TwoFactor } from './schemas/two-factor.schema';
import { DeviceInfoUtil } from '../common/utils/device-info.util';
import { performance } from 'node:perf_hooks';

// 소셜 로그인 사용자 정보 제공자
export enum EAuthProvider {
  GOOGLE = 'Google',
  NAVER = 'Naver',
  KAKAO = 'Kakao',
}

/**
 * AuthService는 사용자 인증과 관련된 기능을 담당
 * - 로그인 처리
 * - 소셜 로그인 (Kakao) 연동
 * - JWT 토큰 발급
 *
 * 주요 역할:
 * 1. 사용자의 로그인 인증 (이메일/비밀번호)
 * 2. 소셜 로그인(구글, 카카오 등) 연동 및 사용자 정보 저장
 * 3. 인증된 사용자에 대해 JWT 토큰 발급
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Login') private readonly loginModel: Model<Login>,
    @InjectModel('TwoFactor') private readonly twoFactorModel: Model<TwoFactor>,
    private readonly userService: UserService,
  ) {}

  /**
   * 회원 가입
   * @param createUserDto - 사용자 회원가입 정보
   * @returns 생성된 사용자
   * @throws {UnauthorizedException} 이미 가입된 이메일일 경우
   */
  async createUser(createUserDto: CreateUserDto) {
    const existingEmail = await this.userModel.findOne({ email: createUserDto.email });
    if (existingEmail) {
      throw new UnauthorizedException('이미 가입된 계정입니다.');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);
    const newUser = {
      ...createUserDto,
      password: hashedPassword,
    };

    const user = await this.userModel.create(newUser);
    await user.save();
    return user;
  }

  /**
   * JWT 토큰 생성 (access, refresh)
   * @description userId, authProvider 및 디바이스 정보를 기반으로 JWT 토큰을 생성
   * @param userId - 사용자 ID
   * @param authProvider - 인증 제공자
   * @param deviceInfo - 디바이스 정보
   * @param ip - 클라이언트 IP
   * @returns accessToken, refreshToken
   */
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

  /**
   * 액세스 토큰 재발급
   * @param refreshToken - 기존 리프레시 토큰
   * @param deviceInfo - 디바이스 정보
   * @param ip - 클라이언트 IP
   * @returns 새 accessToken과 의심 로그인 여부
   * @throws {UnauthorizedException} 토큰 만료 또는 검증 실패 시
   */
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

  /**
   * 이메일과 비밀번호 기반 로그인
   * 로그인 정보 검증 및 상태 확인 (토큰 발급 없이)
   * @param signInDto - 로그인 요청 정보
   * @param deviceInfo - 디바이스 정보
   * @param ip - 클라이언트 IP
   * @returns accessToken, refreshToken, suspicious
   * @throws {UnauthorizedException} 로그인 실패 시
   */
  async validateSignIn(signInDto: SignInDto, deviceInfo: UserDevice, ip: string) {
    try {
      // 이메일로 특정 회원 조회
      const t0 = performance.now();
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
      const t1 = performance.now();
      const isPasswordValid = await this.verifyPassword(signInDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('잘못된 비밀번호입니다.');
      }

      // 최근 로그인 세션 확인
      const t2 = performance.now();
      const lastSession = await this.loginModel.findOne({ userId: user._id.toString() }).sort({ lastLoginAt: -1 });

      // 의심스러운 로그인 감지
      let suspicious = false;
      if (lastSession) {
        suspicious = this.detectSuspiciousLogin(lastSession, deviceInfo, ip);
      }

      // 2FA 활성화 여부 확인
      const t3 = performance.now();
      const userHas2FA = await this.is2FAEnabled(user._id.toString());

      const t4 = performance.now();

      // tempToken 생성
      const tempPayload = {
        userId: user._id.toString(),
        type: 'temp',
        isSuspicious: suspicious,
        userHas2FA: userHas2FA,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip,
        authProvider: user.authProvider || null,
      };

      const tempToken = jwt.sign(tempPayload, process.env.SECRET_KEY, { expiresIn: '10m' });

      console.log(
        `[perf][sign-in] user ${Math.round(t1 - t0)}ms | bcrypt ${Math.round(t2 - t1)}ms | login ${Math.round(t3 - t2)}ms | 2fa ${Math.round(t4 - t3)}ms`,
      );
      return {
        requiresTwoFactor: userHas2FA,
        isSuspiciousLogin: suspicious,
        suspiciousFactors: suspicious ? ['기기 또는 위치 변경 감지'] : [],
        tempToken: tempToken,
        userHas2FA: userHas2FA,
      };
    } catch (error) {
      throw new UnauthorizedException('로그인에 실패하였습니다.');
    }
  }

  /**
   * tempToken으로 실제 로그인 진행 (기존 createTokens 활용)
   * @param token - 임시 JWT 토큰 (tempToken)
   * @returns accessToken, refreshToken
   * @throws {UnauthorizedException} 유효하지 않은 토큰일 경우
   */
  async proceedLogin(tempToken: string) {
    try {
      const decoded = jwt.verify(tempToken, process.env.SECRET_KEY) as any;

      if (decoded.type !== 'temp') {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      const deviceInfo: UserDevice = {
        browser: decoded.browser,
        os: decoded.os,
        device: decoded.device || 'Desktop',
        userAgent: decoded.userAgent || '',
        deviceId: decoded.deviceId,
      };

      const { accessToken, refreshToken } = await this.createTokens(
        decoded.userId,
        decoded.authProvider,
        deviceInfo,
        decoded.ip,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('인증 시간이 만료되었습니다.');
      }
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  /**
   * JWT 토큰 검증
   * @param token - JWT 토큰
   * @returns 디코딩된 payload
   * @throws {UnauthorizedException} 유효하지 않은 토큰일 경우
   */
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

  /**
   * 카카오 토큰 요청 (인가 코드로)
   * @param code - 카카오 인가 코드
   * @returns accessToken
   * @throws {UnauthorizedException} 요청 실패 시
   */
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

  /**
   * 카카오 사용자 정보 요청
   * @param kakaoToken - 액세스 토큰
   * @returns 사용자 정보 (이메일, 닉네임, 제공자)
   * @throws {UnauthorizedException} 요청 실패 시
   */
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

  /**
   * OAuth 기반 로그인 처리 (카카오 등)
   * @param userInfo - 소셜 사용자 정보
   * @param deviceInfo - 디바이스 정보
   * @param ip - 클라이언트 IP
   * @returns accessToken, refreshToken
   * @throws {Error} OAuth 로그인 실패 시
   */
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

  /**
   * 비밀번호 해시화
   * @param password - 원문 비밀번호
   * @returns 해시된 비밀번호
   */
  async hashPassword(password: string) {
    const saltRounds = 15;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * 비밀번호 검증 (비교)
   * @param password - 입력 비밀번호
   * @param hashedPassword - 저장된 해시 비밀번호
   * @returns 일치 여부
   */
  async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * 회원 탈퇴 처리
   * @param userId - 사용자 ID
   * @returns 성공 메시지
   * @throws {UnauthorizedException} 탈퇴 실패 시
   */
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

  /**
   * 로그아웃 처리
   * @param userId - 사용자 ID
   * @param sessionId - 세션 ID
   * @returns 성공 메시지
   */
  async logout(userId: string, sessionId: string) {
    // 특정 세션 삭제
    await this.loginModel.findByIdAndDelete(sessionId);
    return { message: '로그아웃 되었습니다.' };
  }

  /**
   * 로그인 이력 조회 (최근 10건)
   * @param userId - 사용자 ID
   * @returns 로그인 세션 배열
   * @throws {Error} 조회 실패 시
   */
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

  /**
   * 탈퇴 회원 여부 확인
   * @param userId - 사용자 ID
   * @throws {UnauthorizedException} 탈퇴한 사용자일 경우
   */
  async isWithDrawn(userId: string) {
    const user = await this.userModel.findById({ _id: userId });
    if (!user || user.deletedAt !== null) {
      throw new UnauthorizedException('이미 탈퇴한 회원입니다.');
    }
  }

  /**
   * 2FA 설정 시작 - QR 코드 생성
   */
  async setup2FA(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      const existingTwoFactor = await this.twoFactorModel.findOne({ userId });
      if (existingTwoFactor && existingTwoFactor.enabled) {
        throw new UnauthorizedException('이미 2단계 인증이 활성화되어 있습니다.');
      }

      const secret = speakeasy.generateSecret({
        name: `TripTeller (${user.email})`,
        issuer: 'TripTeller',
        length: 32,
      });

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      await this.twoFactorModel.findOneAndUpdate(
        { userId },
        {
          userId,
          tempSecret: secret.base32,
          tempSecretExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10분 후 만료
          enabled: false,
        },
        { upsert: true, new: true },
      );

      if (existingTwoFactor.tempSecretExpiresAt && existingTwoFactor.tempSecretExpiresAt < new Date()) {
        await this.twoFactorModel.updateOne({ userId }, { $unset: { tempSecret: 1, tempSecretExpiresAt: 1 } });
        throw new GoneException('2FA 설정 시간이 만료되었습니다. 다시 QR을 발급받아 시작하세요.');
      }

      return {
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
    } catch (error) {
      console.error('2FA setup failed:', error);
      throw new UnauthorizedException('2FA 설정에 실패했습니다.');
    }
  }

  /**
   * 2FA 설정 완료 - 토큰 검증 후 활성화
   */
  async verify2FASetup(userId: string, token: string) {
    try {
      const twoFactor = await this.twoFactorModel.findOne({ userId });
      if (!twoFactor || !twoFactor.tempSecret) {
        throw new UnauthorizedException('2FA 설정 세션이 만료되었습니다.');
      }

      const verified = speakeasy.totp.verify({
        secret: twoFactor.tempSecret,
        encoding: 'base32',
        token,
        step: 30,
        window: 2,
      });

      if (!verified) {
        throw new UnauthorizedException('인증 코드가 올바르지 않습니다.');
      }

      const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 8).toUpperCase());

      await this.twoFactorModel.findOneAndUpdate(
        { userId },
        {
          secret: twoFactor.tempSecret,
          enabled: true,
          backupCodes: backupCodes,
          tempSecret: null,
          setupCompletedAt: new Date(),
          disabledAt: null,
        },
      );

      return { backupCodes };
    } catch (error) {
      console.error('2FA verification failed:', error);
      throw new UnauthorizedException('2FA 인증에 실패했습니다.');
    }
  }

  /**
   * 2FA 토큰 검증
   */
  async verify2FAToken(userId: string, token: string): Promise<boolean> {
    try {
      const twoFactor = await this.twoFactorModel.findOne({ userId, enabled: true });
      if (!twoFactor || !twoFactor.secret) {
        return false;
      }

      // 디버깅용 콘솔
      const inputRaw = (token ?? '').trim();
      const inputNorm = inputRaw.replace(/[\s-]/g, '').toUpperCase();

      // 현재/이전/다음 슬롯 코드 계산
      const now = Math.floor(Date.now() / 1000);
      const cur = speakeasy.totp({ secret: twoFactor.secret, encoding: 'base32', time: now, step: 30, digits: 6 });
      const prev = speakeasy.totp({
        secret: twoFactor.secret,
        encoding: 'base32',
        time: now - 30,
        step: 30,
        digits: 6,
      });
      const next = speakeasy.totp({
        secret: twoFactor.secret,
        encoding: 'base32',
        time: now + 30,
        step: 30,
        digits: 6,
      });

      console.log('[2FA DEBUG][verify2FAToken] inputs', {
        inputRaw,
        inputNorm,
        cur,
        prev,
        next,
        window: 2,
        step: 30,
        digits: 6,
        algorithm: 'sha1',
        serverNowISO: new Date(now * 1000).toISOString(),
      });

      const verified = speakeasy.totp.verify({
        secret: twoFactor.secret,
        encoding: 'base32',
        token: token,
        window: 2,
      });

      if (verified) {
        await this.twoFactorModel.findOneAndUpdate({ userId }, { lastAuthenticatedAt: new Date() });
        return true;
      }

      // 백업 코드 확인
      const backupCodeIndex = twoFactor.backupCodes.indexOf(token.toUpperCase());
      console.log(
        '[2FA DEBUG][verify2FAToken] backupMatchIdx',
        backupCodeIndex,
        'remaining',
        twoFactor.backupCodes.length,
      );

      if (backupCodeIndex !== -1) {
        const updatedBackupCodes = [...twoFactor.backupCodes];
        updatedBackupCodes.splice(backupCodeIndex, 1);

        await this.twoFactorModel.findOneAndUpdate(
          { userId },
          {
            backupCodes: updatedBackupCodes,
            lastAuthenticatedAt: new Date(),
          },
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('2FA token verification failed:', error);
      return false;
    }
  }

  /**
   * 사용자의 2FA 활성화 여부 확인
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    try {
      const twoFactor = await this.twoFactorModel.findOne({ userId, enabled: true });
      return !!twoFactor;
    } catch (error) {
      return false;
    }
  }

  /**
   * 2FA 상태 조회
   */
  async get2FAStatus(userId: string) {
    try {
      const twoFactor = await this.twoFactorModel.findOne({ userId });

      return {
        enabled: twoFactor?.enabled || false,
        backupCodesCount: twoFactor?.backupCodes?.length || 0,
        setupCompletedAt: twoFactor?.setupCompletedAt || null,
        lastAuthenticatedAt: twoFactor?.lastAuthenticatedAt || null,
      };
    } catch (error) {
      return {
        enabled: false,
        backupCodesCount: 0,
        setupCompletedAt: null,
        lastAuthenticatedAt: null,
      };
    }
  }

  /**
   * 2FA 비활성화
   */
  async disable2FA(userId: string, token: string) {
    try {
      const isValid = await this.verify2FAToken(userId, token);
      if (!isValid) {
        throw new UnauthorizedException('올바른 인증 코드를 입력해주세요.');
      }

      await this.twoFactorModel.findOneAndUpdate(
        { userId },
        {
          enabled: false,
          disabledAt: new Date(),
          tempSecret: null,
        },
      );

      return { message: '2단계 인증이 비활성화되었습니다.' };
    } catch (error) {
      console.error('2FA disable failed:', error);
      throw new UnauthorizedException('2FA 비활성화에 실패했습니다.');
    }
  }

  /**
   * 새 백업 코드 생성
   */
  async generateNewBackupCodes(userId: string, token: string) {
    try {
      const isValid = await this.verify2FAToken(userId, token);
      if (!isValid) {
        throw new UnauthorizedException('올바른 인증 코드를 입력해주세요.');
      }

      const newBackupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 8).toUpperCase());

      await this.twoFactorModel.findOneAndUpdate({ userId }, { backupCodes: newBackupCodes });

      return {
        backupCodes: newBackupCodes,
        message: '새로운 백업 코드가 생성되었습니다.',
      };
    } catch (error) {
      throw new UnauthorizedException('백업 코드 생성에 실패했습니다.');
    }
  }

  /**
   * 2FA 인증 완료 처리
   */
  async verify2FALogin(tempToken: string, totpCode?: string, skipTwoFactor?: boolean, backupCode?: string) {
    try {
      const decoded = jwt.verify(tempToken, process.env.SECRET_KEY) as any;
      if (decoded.type !== 'temp') {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      // 디버깅용 콘솔
      console.log('[2FA DEBUG][SVC.verify2FALogin] decoded', {
        type: decoded?.type,
        userId: decoded?.userId,
        isSuspicious: decoded?.isSuspicious,
        userHas2FA: decoded?.userHas2FA,
      });

      const user = await this.userModel.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      // 의심스러운 로그인이지만 2FA 건너뛰기 선택한 경우
      if (decoded.isSuspicious && skipTwoFactor && !decoded.userHas2FA) {
        const tokens = await this.proceedLogin(tempToken);
        return {
          ...tokens,
          user: {
            id: user._id,
            email: user.email,
            nickname: user.nickname,
          },
        };
      }

      // 2FA 코드 검증
      const code = (totpCode ?? backupCode ?? '').trim();

      // 디버깅용 콘솔
      console.log('[2FA DEBUG][SVC.verify2FALogin] input source', {
        usedTotp: !!totpCode,
        usedBackup: !!backupCode,
        codeLength: code.length,
      });

      if (!code) throw new UnauthorizedException('인증 코드를 입력해주세요.');

      const verified = await this.verify2FAToken(decoded.userId, code);
      if (!verified) {
        throw new UnauthorizedException('인증 코드가 올바르지 않습니다.');
      }

      const tokens = await this.proceedLogin(tempToken);
      return {
        ...tokens,
        user: { id: user._id, email: user.email, nickname: user.nickname },
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('인증 시간이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new UnauthorizedException('2FA 인증에 실패했습니다.');
    }
  }

  /**
   * 세션 무효화 (로그아웃)
   * @param options - userId, deviceId, refreshToken 중 하나 이상 필요
   * @returns 성공 메시지
   */
  async revokeSession(options: { userId?: string; deviceId?: string; refreshToken?: string }) {
    try {
      const { userId, deviceId, refreshToken } = options;

      // refreshToken이 있으면 해당 세션 찾기
      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY) as any;
          if (decoded.sessionId) {
            await this.loginModel.findByIdAndDelete(decoded.sessionId);
            return { message: '로그아웃되었습니다.' };
          }
        } catch (error) {
          // refreshToken이 만료되었어도 다른 조건으로 세션 삭제 시도
        }
      }

      // deviceId로 세션 찾기
      if (userId && deviceId) {
        await this.loginModel.deleteOne({
          userId,
          'deviceInfo.deviceId': deviceId,
        });
        return { message: '로그아웃되었습니다.' };
      }

      // userId만 있으면 가장 최근 세션 삭제
      if (userId) {
        const latestSession = await this.loginModel.findOne({ userId }).sort({ lastLoginAt: -1 });

        if (latestSession) {
          await this.loginModel.findByIdAndDelete(latestSession._id);
        }
        return { message: '로그아웃되었습니다.' };
      }

      return { message: '로그아웃되었습니다.' };
    } catch (error) {
      console.error('Session revocation failed:', error);
      return { message: '로그아웃되었습니다.' }; // 사용자에게는 항상 성공으로 응답
    }
  }

  /**
   * 의심스러운 로그인 감지 로직 (유틸 사용)
   * @param session - 마지막 로그인 세션 정보
   * @param deviceInfo - 현재 디바이스 정보
   * @param ip - 현재 IP 주소
   * @returns 의심스러우면 true
   */
  private detectSuspiciousLogin(session: Login, deviceInfo: UserDevice, ip: string): boolean {
    const suspiciousFactors = [];

    if (session.ipAddress !== ip) {
      suspiciousFactors.push('ip_change');
    }

    if (!DeviceInfoUtil.isSameDevice(session.deviceInfo, deviceInfo)) {
      suspiciousFactors.push('device_change');
    }

    const daysSinceLastLogin = (Date.now() - session.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastLogin > 30) {
      suspiciousFactors.push('long_absence');
    }

    return suspiciousFactors.length >= 2;
  }
}
