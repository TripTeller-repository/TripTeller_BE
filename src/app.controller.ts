import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 서버 실행 환경 확인용 API
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // health check API
  @Get('healthCheck')
  getHealthCheck(): string {
    return this.appService.getHealthCheck();
  }

  // exception-filter 테스트용 API
  @Get('ErrorTest')
  async test() {
    return this.appService.getTestError();
  }
}
