import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const token = request.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Access token이 없습니다.');
      }

      const isAccessTokenExpired = await this.authService.isAccessTokenExpired(token);

      if (isAccessTokenExpired) {
        throw new UnauthorizedException('Access token has expired');
      }

      return true;
    } catch (error) {
      throw new Error('인증에 오류가 발생하였습니다.');
    }
  }
}
