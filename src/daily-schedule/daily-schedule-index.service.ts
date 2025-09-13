import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailySchedule } from './daily-schedule.schema';

@Injectable()
export class DailyScheduleIndexService implements OnModuleInit {
  constructor(
    @InjectModel('DailySchedule') private readonly dailyScheduleModel: Model<DailySchedule>,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  /**
   * 애플리케이션 초기화 시 실행
   * DailySchedule 모델에 정의된 인덱스를 생성
   */
  async onModuleInit() {
    try {
      await this.createIndexes();
      this.logger.log({ level: 'info', message: '▶▶▶ DailySchedule indexes created successfully' });
    } catch (error) {
      this.logger.error({ message: 'Error creating DailySchedule indexes', error: error.message, stack: error.stack });
    }
  }

  /**
   * Mongoose의 createIndexes() 메서드를 통해
   * DailySchedule 컬렉션에 인덱스를 생성
   *
   * @private
   * @returns {Promise<void>}
   */
  private async createIndexes() {
    await this.dailyScheduleModel.createIndexes();
  }
}
