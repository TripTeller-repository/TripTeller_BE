import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15분
  private readonly maxAttempts = 5; // 최대 5회 시도

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(request);
    const now = Date.now();

    const record = this.store[key];

    if (!record || now > record.resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return true;
    }

    if (record.count >= this.maxAttempts) {
      throw new HttpException('너무 많은 시도가 있었습니다. 15분 후 다시 시도해주세요.', HttpStatus.TOO_MANY_REQUESTS);
    }

    record.count++;
    return true;
  }

  private generateKey(request: any): string {
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.userId || 'anonymous';
    return `${ip}:${userId}`;
  }
}
