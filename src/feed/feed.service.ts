import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedDocument } from './feed.schema';

@Injectable()
export class FeedService implements OnModuleInit {
  private readonly logger = new Logger(FeedService.name);

  constructor(@InjectModel('Feed') private readonly feedModel: Model<FeedDocument>) {}

  // 모듈 초기화시 인덱스 생성
  async onModuleInit() {
    try {
      await this.feedModel.syncIndexes();
      this.logger.log('▶▶▶ feed indexes created successfully');
    } catch (error) {
      this.logger.error('Error creating indexes', error);
    }
  }
}
