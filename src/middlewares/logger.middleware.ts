import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { Logger } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const request = req as any;
    this.logger.info({
      message: 'Request',
      method: request.method,
      url: request.originalUrl,
      userAgent: request.headers['user-agent'],
      requestBody: request.body,
    });
    next();
  }
}
