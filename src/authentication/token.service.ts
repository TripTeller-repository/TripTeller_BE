import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

interface TokenPayload {
  userId: string;
  tokenId: string;
  ip?: string;
  deviceInfo?: any;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {}

  // 토큰 생성
  async createTokens(
    userId: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 유니크 토큰 ID 생성
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

    // 액세스 토큰 (10분)
    const accessToken = jwt.sign(payload, this.configService.get<string>('SECRET_KEY'), { expiresIn: '10m' });

    // 리프레시 토큰 (14일)
    const refreshToken = jwt.sign(payload, this.configService.get<string>('SECRET_KEY'), { expiresIn: '14d' });

    // Redis에 토큰 메타데이터 저장 (14일 만료)
    await this.saveTokenMetadata(userId, tokenId, ip, deviceInfo);

    return { accessToken, refreshToken };
  }

  // User-Agent 파싱
  private parseUserAgent(userAgent?: string): any {
    if (!userAgent) return {};

    const device = {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
    };

    try {
      // 여기에 User-Agent 파싱 로직 추가
      // 간단한 예시:
      if (userAgent.includes('Chrome')) device.browser = 'Chrome';
      if (userAgent.includes('Firefox')) device.browser = 'Firefox';
      if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) device.browser = 'Safari';

      if (userAgent.includes('Windows')) device.os = 'Windows';
      if (userAgent.includes('Mac OS')) device.os = 'MacOS';
      if (userAgent.includes('Linux')) device.os = 'Linux';
      if (userAgent.includes('Android')) device.os = 'Android';
      if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) device.os = 'iOS';

      if (userAgent.includes('Mobile')) device.device = 'Mobile';
      else if (userAgent.includes('Tablet')) device.device = 'Tablet';
      else device.device = 'Desktop';
    } catch (error) {
      this.logger.warn(`Error parsing User-Agent: ${error.message}`);
    }

    return device;
  }

  // 토큰 메타데이터 저장
  async saveTokenMetadata(userId: string, tokenId: string, ip?: string, deviceInfo?: any): Promise<void> {
    try {
      const key = `auth:token:${userId}:${tokenId}`;
      const metadata = {
        tokenId,
        userId,
        ip: ip || 'unknown',
        deviceInfo: deviceInfo || {},
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

      // Redis에서 토큰 유효성 확인
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

  // 리프레시 토큰 검증 및 새 토큰 발급
  async refreshTokens(
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.configService.get<string>('SECRET_KEY')) as TokenPayload;

      const { userId, tokenId } = decoded;

      // Redis에서 토큰 유효성 확인
      const key = `auth:token:${userId}:${tokenId}`;
      const tokenExists = await this.redis.exists(key);

      if (!tokenExists) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      // 기존 토큰 삭제
      await this.revokeToken(userId, tokenId);

      // 새 토큰 발급
      return await this.createTokens(userId, ip, userAgent);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('만료된 리프레시 토큰입니다.');
      }
      throw error;
    }
  }

  // 토큰 무효화
  async revokeToken(userId: string, tokenId: string): Promise<void> {
    try {
      // Redis에서 토큰 삭제
      const key = `auth:token:${userId}:${tokenId}`;
      await this.redis.del(key);

      // 사용자의 토큰 목록에서 제거
      await this.redis.srem(`auth:user:${userId}:tokens`, tokenId);
    } catch (error) {
      this.logger.error(`Error revoking token: ${error.message}`, error.stack);
    }
  }

  // 사용자의 모든 토큰 무효화
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

      this.logger.log(`All tokens revoked for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error revoking all user tokens: ${error.message}`, error.stack);
    }
  }
}
