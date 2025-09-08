import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App Test')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '서버 실행환경 테스트', description: '현재 서버의 실행환경을 출력한다.' })
  @ApiResponse({
    status: 200,
    description: '서버 실행환경이 정상적으로 출력됨',
    schema: {
      type: 'string',
      example: `<div style="font-family: 'Noto Sans', sans-serif; text-align: center; background-color: #f0f4f8; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4CAF50; font-size: 32px; margin-bottom: 20px;">🌎 TripTeller API Server</h2>
        <p style="font-size: 18px; color: #333; line-height: 1.6;">
          <span style="font-weight: bold; color: #4CAF50;">상태:</span> ✅ Running <br>
          <span style="font-weight: bold; color: #4CAF50;">환경:</span> local <br>
          <span style="font-weight: bold; color: #4CAF50;">시간:</span> 2025. 9. 8. 오전 11:15:48
        </p>
        <div style="font-size: 18px; margin-top: 20px;">
          <strong style="color: #4CAF50;">TripTeller 서버에 성공적으로 연결되었습니다!</strong>
        </div>
        <div style="margin-top: 40px; font-size: 16px; color: #777; opacity: 0.8;">
          <em>서버에 대한 자세한 정보는 <a href="https://github.com/TripTeller-repository/TripTeller_BE" target="_blank" style="color: #4CAF50;">여기</a>에서 확인할 수 있습니다.</em>
        </div>
      </div>`,
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 환경 변수 불러오는데 문제가 발생함',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        code: { type: 'string', example: 'INTERNAL_SERVER_ERROR' },
        message: { type: 'string', example: 'An error occurred while processing the request.' },
        timestamp: { type: 'string', example: '2025-09-08T02:14:46.182Z' },
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health-check')
  @ApiOperation({
    summary: 'Health Check API',
    description: '현재 서버의 상태가 정상인지 여부를 확인한다.',
  })
  @ApiResponse({
    status: 200,
    description: '서버 상태가 정상임',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        uptime: { type: 'number', example: 164.0684526 },
        timestamp: { type: 'string', example: '2025-09-08T02:15:19.630Z' },
      },
    },
  })
  getHealthCheck(): string {
    return this.appService.getHealthCheck();
  }

  @Get('error-test')
  @ApiOperation({
    summary: 'Exception filters API',
    description: 'Exception filters의 동작 여부를 확인한다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버에서 예외가 발생함',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        code: { type: 'string', example: 'TEST_ERROR' },
        message: { type: 'string', example: '이 오류는 테스트 목적으로 발생되었습니다.' },
        timestamp: { type: 'string', example: '2025-09-08T02:14:46.182Z' },
      },
    },
  })
  async test() {
    return this.appService.getTestError();
  }
}
