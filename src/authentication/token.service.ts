import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from 'src/types/user.interface';

interface TokenPayload extends Pick<IUser, 'userId' | 'tokenId' | 'ip' | 'deviceInfo'> {}

@Injectable()
export class TokenService {
  private readonly redis: Redis | null;
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  // 액세스 토큰과 리프레시 토큰 생성
  async createTokens(
    userId: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 고유한 토큰 ID 생성
    const tokenId = uuidv4();

    // 디바이스 정보 파싱
    const deviceInfo = this.parseUserAgent(userAgent);

    // JWT payload 생성
    const payload: TokenPayload = {
      userId,
      tokenId,
      ip,
      deviceInfo,
    };

    // 액세스 토큰 (5분)
    const accessToken = jwt.sign(payload, this.configService.get<string>('SECRET_KEY'), { expiresIn: '5m' });

    // 리프레시 토큰 (30분)
    const refreshToken = jwt.sign(payload, this.configService.get<string>('SECRET_KEY'), { expiresIn: '30m' });

    // Redis에 토큰 메타데이터 저장
    // (액세스 토큰 만료기한과 동일하게 5분)
    await this.saveTokenMetadata(userId, tokenId, ip, deviceInfo);

    return { accessToken, refreshToken };
  }

  // User-Agent 파싱
  private parseUserAgent(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    let device = 'unknown';

    try {
      // 간단한 디바이스 타입 감지
      if (userAgent.includes('Mobile')) device = 'mobile';
      else if (userAgent.includes('Tablet')) device = 'tablet';
      else device = 'desktop';

      // OS 정보 추가
      if (userAgent.includes('Windows')) device += '-windows';
      else if (userAgent.includes('Mac OS')) device += '-macos';
      else if (userAgent.includes('Linux')) device += '-linux';
      else if (userAgent.includes('Android')) device += '-android';
      else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad'))
        device += '-ios';
    } catch (error) {
      this.logger.warn(`User agent parsing error: ${error.message}`);
    }

    return device;
  }

  // Redis에 토큰 메타데이터 저장
  async saveTokenMetadata(userId: string, tokenId: string, ip?: string, deviceInfo?: string): Promise<void> {
    try {
      const key = `auth:token:${userId}:${tokenId}`;
      const metadata = {
        tokenId,
        userId,
        ip: ip || 'unknown',
        deviceInfo: deviceInfo || 'unknown',
        createdAt: new Date().toISOString(),
      };

      await this.redis.set(key, JSON.stringify(metadata), 'EX', 60 * 60 * 24 * 14); // 14일 만료

      // 사용자의 모든 토큰 ID 목록에 추가
      await this.redis.sadd(`auth:user:${userId}:tokens`, tokenId);
    } catch (error) {
      this.logger.error(`Error saving token metadata: ${error.message}`, error.stack);
    }
  }

  // 액세스 토큰 검증
  async verifyAccessToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.configService.get<string>('SECRET_KEY')) as TokenPayload;

      // Redis에서 토큰 존재하는지 확인
      const key = `auth:token:${decoded.userId}:${decoded.tokenId}`;
      const tokenExists = await this.redis.exists(key);

      if (!tokenExists) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('만료된 토큰입니다.');
      }
      throw error;
    }
  }

  // 리프레시 토큰을 사용하여 토큰 갱신
  async refreshTokens(
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.configService.get<string>('SECRET_KEY')) as TokenPayload;
      const { userId, tokenId } = decoded;

      // Redis에 토큰이 존재하는지 확인
      const key = `auth:token:${userId}:${tokenId}`;
      const tokenExists = await this.redis.exists(key);

      if (!tokenExists) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
      }

      // 저장된 IP와 디바이스 정보를 현재 요청과 비교하여 보안 검증
      const tokenDataStr = await this.redis.get(key);
      if (tokenDataStr) {
        const tokenData = JSON.parse(tokenDataStr);

        // IP가 다르면 토큰 취소
        if (ip && tokenData.ip !== 'unknown' && tokenData.ip !== ip) {
          await this.revokeToken(userId, tokenId);
          throw new UnauthorizedException('Security check failed: IP mismatch');
        }

        const currentDevice = this.parseUserAgent(userAgent);
        if (
          currentDevice !== 'unknown' &&
          tokenData.deviceInfo !== 'unknown' &&
          tokenData.deviceInfo !== currentDevice
        ) {
          await this.revokeToken(userId, tokenId);
          throw new UnauthorizedException('Security check failed: Device mismatch');
        }
      }

      // 기존 토큰 취소
      await this.revokeToken(userId, tokenId);

      // 새 토큰 생성
      return await this.createTokens(userId, ip, userAgent);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('리프레시 토큰이 만료되었습니다');
      }
      throw error;
    }
  }

  // 토큰 취소
  async revokeToken(userId: string, tokenId: string): Promise<void> {
    try {
      // Redis에서 토큰 삭제
      const key = `auth:token:${userId}:${tokenId}`;
      await this.redis.del(key);

      // 사용자의 토큰 목록에서 제거
      await this.redis.srem(`auth:user:${userId}:tokens`, tokenId);
    } catch (error) {
      this.logger.error(`토큰 취소 오류: ${error.message}`, error.stack);
    }
  }

  // 모든 사용자 토큰 취소 (모든 기기에서 로그아웃 또는 비밀번호 변경 시)
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      // 사용자의 모든 토큰 ID 가져오기
      const tokenIds = await this.redis.smembers(`auth:user:${userId}:tokens`);

      // 각 토큰 삭제
      const pipeline = this.redis.pipeline();
      for (const tokenId of tokenIds) {
        pipeline.del(`auth:token:${userId}:${tokenId}`);
      }

      // 사용자의 토큰 목록 삭제
      pipeline.del(`auth:user:${userId}:tokens`);

      await pipeline.exec();
      this.logger.log(`사용자의 모든 토큰이 취소되었습니다: ${userId}`);
    } catch (error) {
      this.logger.error(`모든 사용자 토큰 취소 오류: ${error.message}`, error.stack);
    }
  }
}
