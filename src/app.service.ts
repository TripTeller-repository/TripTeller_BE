import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly environment: string;

  constructor(private readonly configService: ConfigService) {
    this.environment = this.configService.get<string>('DATABASE_HOST') || 'Unknown Environment';
  }

  getHello(): string {
    try {
      this.logger.log('Welcome endpoint accessed');

      const serverInfo = {
        name: '🌎 TripTeller API Server',
        status: '✅ Running',
        environment: this.environment,
        timestamp: new Date().toISOString(),
      };

      return `
      <div style="font-family: noto-san; white-space: pre-line;">
        <h2>${serverInfo.name}</h2>
        
        <p>
        상태: ${serverInfo.status}<br>
        환경: ${serverInfo.environment}<br>
        시간: ${new Date().toLocaleString('ko-KR')}
        </p>
        
        <p><strong>TripTeller 서버에 성공적으로 연결되었습니다!</strong></p>
      </div>`;
    } catch (error) {
      this.logger.error(`Error in getHello: ${error.message}`, error.stack);
      throw new InternalServerErrorException('서버 상태 조회 중 오류가 발생했습니다.');
    }
  }

  getHealthCheck(): string {
    this.logger.log('Health check performed');
    return JSON.stringify({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  getTestError(): never {
    this.logger.warn('Test error endpoint triggered');
    throw new InternalServerErrorException({
      code: 'TEST_ERROR',
      message: '이 오류는 테스트 목적으로 발생되었습니다.',
      timestamp: new Date().toISOString(),
    });
  }
}
