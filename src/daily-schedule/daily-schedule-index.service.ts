import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailySchedule } from './daily-schedule.schema';

@Injectable()
export class DailyScheduleIndexService implements OnModuleInit {
  constructor(@InjectModel('DailySchedule') private readonly dailyScheduleModel: Model<DailySchedule>) {}

  async onModuleInit() {
    try {
      await this.createIndexes();
      console.log('DailySchedule indexes created successfully');
    } catch (error) {
      console.error('Error creating DailySchedule indexes', error);
    }
  }

  private async createIndexes() {
    await this.dailyScheduleModel.createIndexes();
  }
}
