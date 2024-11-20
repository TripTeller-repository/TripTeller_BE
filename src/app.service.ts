import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    try {
      const text = '트립텔러 서버에 접속하였습니다!';
      const context = process.env.DATABASE_HOST;
      if (!context) {
        throw new InternalServerErrorException('DATABASE_HOST environment variable is not defined.');
      }

      return `${text}
      현재 실행환경 : ${context}`;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An error occurred while processing the request.');
    }
  }

  getHealthCheck(): string {
    return 'Health Checked!';
  }

  getTestError(): string {
    throw new Error('This is a test error');
  }
}
