import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '홈페이지에 접속하였습니다!';
  }
}
