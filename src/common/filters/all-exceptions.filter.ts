import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { Request, Response } from 'express';
import { SlackService } from '@common/slack/slack.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

/**
 * 모든 예외를 잡아서 공통된 형식으로 응답하고, Winston 로거로 상세 로깅하는 필터
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly slackService: SlackService,
  ) {}

  /**
   * 예외를 포착하고 로깅 및 JSON 응답 처리
   *
   * @param exception - 발생한 예외 객체
   * @param host - 요청 컨텍스트를 제공하는 NestJS ArgumentsHost
   */
  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // 요청 본문 (문자열로 변환)
    const requestBody = typeof req.body === 'object' ? JSON.stringify(req.body, null, 2) : String(req.body);

    // IP 주소
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

    // 토큰에서 userId, sessionId 추출
    let userId = 'unknown';
    let sessionId = 'N/A';

    try {
      const authHeader = req.headers['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.decode(token) as jwt.JwtPayload;
        if (decoded) {
          userId = (decoded as any).userId ?? 'unknown';
          sessionId = (decoded as any).sessionId ?? 'N/A';
        }
      }
    } catch {
      this.logger.warn('토큰 디코딩 실패, Slack 로그에 사용자 정보 누락 가능');
    }

    // Winston 로그 출력
    this.logger.error({
      message: 'Unhandled Exception',
      error: exception?.message,
      stack: exception?.stack,
      request: {
        method: req.method,
        url: req.originalUrl,
        ip,
        userId,
        sessionId,
        userAgent: req.headers['user-agent'],
        requestBody,
      },
    });

    // 배포 환경일 경우 에러시 Slack 알림
    const env = this.configService.get<string>('NODE_ENV');
    if (env === 'production') {
      const safeErrorMessage =
        typeof exception?.message === 'string'
          ? exception.message
              .replace(/[^\x20-\x7Eㄱ-ㅎ가-힣\s.,:!?(){}\[\]<>_~'"“”‘’=-]/g, '?')
              .replace(/[\r\n]+/g, ' ')
              .slice(0, 300)
          : 'Unknown error';

      const slackMessage =
        '🚨 *Unhandled Exception*\n' +
        `*URL:* \`${req.method} ${req.originalUrl}\`\n` +
        `*Status:* ${status}\n` +
        `*User ID:* ${userId}\n` +
        `*IP:* ${ip}\n` +
        `*Session ID:* ${sessionId}\`\n` +
        `*Body:* \`\`\`${requestBody}\`\`\`\n` +
        `*Error:* \`${safeErrorMessage}\``;

      await this.slackService.sendError(slackMessage);
    }

    // 응답 분기처리
    if (isHttp) {
      const payload = exception.getResponse();
      // payload가 string이면 메시지로, 객체면 그대로 사용
      if (typeof payload === 'string') {
        res.status(status).json({ statusCode: status, message: payload });
      } else {
        const obj = payload as Record<string, any>;
        res.status(status).json({
          statusCode: status,
          ...obj,
          ...(obj.statusCode ? {} : { statusCode: status }),
        });
      }
    } else {
      res.status(status).json({
        statusCode: status,
        message: 'Internal Server Error',
      });
    }
  }
}
