import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      // 헤더에서 토큰 확인
      let token = request.headers.authorization?.split(' ')[1];

      // 헤더에 토큰 없으면 쿠키에서 확인
      if (!token) {
        token = request.cookies?.accessToken;
      }

      // 그래도 토큰이 없으면 오류
      if (!token) {
        throw new UnauthorizedException('Access token이 없습니다.');
      }

      // 토큰 검증
      const decoded = await this.authService.verifyToken(token);

      // 요청 객체에 사용자 정보 설정
      request.user = {
        userId: decoded.userId,
        authProvider: decoded.authProvider,
        sessionId: decoded.sessionId,
        deviceId: decoded.deviceId,
        browser: decoded.browser,
        os: decoded.os,
        ip: decoded.ip,
        loginAt: decoded.loginAt,
        suspicious: decoded.suspicious,
      };

      return true;
    } catch (error) {
      if (error.message === 'Token has expired') {
        throw new UnauthorizedException('액세스 토큰이 만료되었습니다.');
      }
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
