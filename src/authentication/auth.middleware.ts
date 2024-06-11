import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      const refreshToken = req.cookies?.refreshToken;

      // 액세스 토큰 만료 여부 확인
      if (accessToken) {
        const isAccessTokenExpired = await this.authService.isAccessTokenExpired(accessToken);

        if (isAccessTokenExpired) {
          throw new UnauthorizedException('Access token has expired');
        }
        
        // 토큰에서 회원 ID 추출
        const { userId, authProvider } = await this.authService.verifyToken(accessToken);

        // 탈퇴한 회원인지 조회
        await this.authService.isWithDrawn(userId);

        // request 객체에 회원 id, provider 넣기
        req.user = { userId, authProvider };
      }

      // 리프레시 토큰 만료 여부 확인
      if (refreshToken) {
        const isRefreshTokenExpired = await this.authService.isRefreshTokenExpired(refreshToken);

        if (isRefreshTokenExpired) {
          throw new UnauthorizedException('Refresh token has expired');
        }
      }
      
      next(); // 다음 미들웨어로 이동
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }
}
