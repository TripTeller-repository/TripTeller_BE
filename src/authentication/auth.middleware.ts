import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // 헤더에서 토큰 추출
      const token = req.headers.authorization?.split(' ')[1];

      // 토큰 문자열이 없거나 null인지 확인
      if (!token || token === '') {
        throw new UnauthorizedException('토큰이 비어있습니다.');
      }

      // 토큰에서 회원 ID 추출
      const { userId, oauthProvider } = await this.authService.verifyToken(token);

      // 탈퇴한 회원인지 조회
      await this.authService.isWithDrawn(userId);

      // request 객체에 회원 id, provider 넣기
      // 유저 정보를 request 객체에 추가
      req.user = { userId, oauthProvider };

      next(); // 다음 미들웨어로 이동
    } catch (error) {
      next(new UnauthorizedException('토큰 검증에 실패하였습니다.'));
    }
  }
}
