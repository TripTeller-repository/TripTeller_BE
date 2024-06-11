import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status: number;

    // HTTP 요청을 처리하는 동안 발생하는 예외
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      // 그렇지 않으면 서버 내부 오류로 처리
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    this.logger.error({
      message: 'An error occurred',
      error: exception.message,
      stack: exception.stack,
      request: {
        method: request.method,
        url: request.originalUrl,
        userAgent: request.headers['user-agent'],
        requestBody: request.body,
      },
    });

    response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
    });
  }
}
