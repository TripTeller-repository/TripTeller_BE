import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // 헤더에서 토큰 추출
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        // 토큰에서 회원 ID 추출
        const { userId, oauthProvider } = await this.authService.verifyToken(token);

        // 탈퇴한 회원인지 조회
        await this.authService.isWithDrawn(userId);

        // request 객체에 회원 id, provider 넣기
        req.user = { userId, oauthProvider };
      }

      next(); // 다음 미들웨어로 이동
    } catch (error) {
      const message =
        error instanceof jwt.TokenExpiredError
          ? 'Token has expired' // 토큰 유효기간이 만료됨
          : error instanceof jwt.JsonWebTokenError
            ? 'Invalid token' // 토큰이 유효하지 않음
            : 'Token verification error'; // 토큰 검증 중 오류 발생
      next(new UnauthorizedException(message));
    }
  }
}
