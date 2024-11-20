import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailySchedule } from './daily-schedule.schema';
import { FeedService } from 'src/feed/feed.service';

@Injectable()
export class DailyScheduleIndexService implements OnModuleInit {
  private readonly logger = new Logger(FeedService.name);

  constructor(@InjectModel('DailySchedule') private readonly dailyScheduleModel: Model<DailySchedule>) {}

  async onModuleInit() {
    try {
      await this.createIndexes();
      this.logger.log('▶▶▶ DailySchedule indexes created successfully');
    } catch (error) {
      this.logger.error('Error creating DailySchedule indexes', error);
    }
  }

  private async createIndexes() {
    await this.dailyScheduleModel.createIndexes();
  }
}
