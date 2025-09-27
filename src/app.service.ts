import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly environment: string;

  constructor(private readonly configService: ConfigService) {
    this.environment = this.configService.get<string>('DATABASE_HOST') || 'Unknown Environment';
  }

  /**
   * 서버의 기본 상태 정보를 반환
   *
   * @returns {string} HTML 형식의 서버 정보 페이지 (상태, 환경, 시간)
   * @throws {InternalServerErrorException} 서버 상태 조회 중 오류 발생 시
   */
  getHello(): string {
    try {
      this.logger.log('Welcome TripTeller endpoint accessed');

      const serverInfo = {
        name: '🌎 TripTeller API Server (Docker)',
        status: '✅ Running',
        environment: this.environment,
        timestamp: new Date().toISOString(),
      };

      return `
      <div style="font-family: 'Noto Sans', sans-serif; text-align: center; background-color: #f0f4f8; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4CAF50; font-size: 32px; margin-bottom: 20px;">${serverInfo.name}</h2>
        <p style="font-size: 18px; color: #333; line-height: 1.6;">
          <span style="font-weight: bold; color: #4CAF50;">상태:</span> ${serverInfo.status} <br>
          <span style="font-weight: bold; color: #4CAF50;">환경:</span> ${serverInfo.environment} <br>
          <span style="font-weight: bold; color: #4CAF50;">시간:</span> ${new Date().toLocaleString('ko-KR')}
>>>>>>>>> Temporary merge branch 2
        </p>

        <div style="font-size: 18px; margin-top: 20px;">
          <strong style="color: #4CAF50;">TripTeller 서버에 성공적으로 연결되었습니다!</strong>
        </div>

        <div style="margin-top: 40px; font-size: 16px; color: #777; opacity: 0.8;">
          <em>서버에 대한 자세한 정보는 <a href="https://github.com/TripTeller-repository/TripTeller_BE" target="_blank" style="color: #4CAF50;">여기</a>에서 확인할 수 있습니다.</em>
        </div>
      </div>`;
    } catch (error) {
      this.logger.error(`Error in getHello: ${error.message}`, error.stack);
      throw new InternalServerErrorException('서버 상태 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 서버 상태를 점검하고 응답을 반환
   *
   * @returns {string} 서버의 상태, uptime 및 타임스탬프를 포함한 JSON 문자열
   */
  getHealthCheck(): string {
    this.logger.log('Health check performed');
    return JSON.stringify({
      status: 'healthy',
      deployment: 'Docker',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 테스트용 오류를 발생시킴
   *
   * @throws {InternalServerErrorException} 테스트 오류 메시지
   */
  getTestError(): never {
    this.logger.warn('Test error endpoint triggered');
    throw new InternalServerErrorException({
      code: 'TEST_ERROR',
      message: '이 오류는 테스트 목적으로 발생되었습니다. (Docker 배포)',
      timestamp: new Date().toISOString(),
    });
  }
}
