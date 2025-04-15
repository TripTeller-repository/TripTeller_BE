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
      example: '홈페이지에 접속하였습니다! 현재 실행환경 : localhost',
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 환경 변수 불러오는데 문제가 발생함',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'An error occurred while processing the request.' },
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health Check API',
    description: '현재 서버의 상태가 정상인지 여부를 확인한다.',
  })
  @ApiResponse({
    status: 200,
    description: '서버 상태가 정상임',
    schema: {
      type: 'string',
      example: 'Health Checked!',
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
        message: { type: 'string', example: 'This is a test error' },
      },
    },
  })
  async test() {
    return this.appService.getTestError();
  }
}
