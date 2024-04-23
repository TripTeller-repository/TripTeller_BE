import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoConfigService {
  constructor(private readonly configService: ConfigService) {}

  getMongooseUri(): string {
    return this.configService.get<string>('MONGODB_URL');
  }
}
