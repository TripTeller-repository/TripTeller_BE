import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { Request } from 'express';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Authorization 헤더에서 토큰 추출
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('액세스 토큰이 없습니다.');
    }

    try {
      // 토큰 검증
      const payload = await this.tokenService.verifyAccessToken(token);

      // 요청 객체에 사용자 정보 추가
      request['user'] = {
        userId: payload.userId,
        tokenId: payload.tokenId,
        ip: payload.ip,
        deviceInfo: payload.deviceInfo,
      };

      return true;
    } catch (error) {
      throw new Error('인증에 오류가 발생하였습니다.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Authorization 헤더에서 토큰 추출
    const token = this.extractTokenFromHeader(request);

    // 토큰이 없어도 요청 허용 (사용자 정보 설정 안함)
    if (!token) {
      return true;
    }

    try {
      // 토큰 검증
      const payload = await this.tokenService.verifyAccessToken(token);

      // 요청 객체에 사용자 정보 추가
      request['user'] = {
        userId: payload.userId,
        tokenId: payload.tokenId,
        ip: payload.ip,
        deviceInfo: payload.deviceInfo,
      };
    } catch (error) {
      // 토큰이 유효하지 않아도 실패하지 않고, 사용자 정보만 설정 안함
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
