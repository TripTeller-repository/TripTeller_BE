import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedDocument } from './feed.schema';

@Injectable()
export class FeedService implements OnModuleInit {
  constructor(@InjectModel('Feed') private readonly feedModel: Model<FeedDocument>) {}

  // 모듈 초기화시 인덱스 생성
  async onModuleInit() {
    try {
      await this.feedModel.syncIndexes();
      console.log('feed indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes', error);
    }
  }
}
