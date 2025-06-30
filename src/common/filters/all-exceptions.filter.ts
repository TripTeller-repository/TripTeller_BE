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

    if (exception instanceof HttpException) {
      status = exception.getStatus();
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
