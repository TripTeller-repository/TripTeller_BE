import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelPlan } from './travel-plan.schema';

@Injectable()
export class TravelPlanIndexService implements OnModuleInit {
  constructor(
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    try {
      await this.createIndexes();
      this.logger.log({ level: 'info', message: '▶▶▶ TravelPlan indexes created successfully' });
    } catch (error) {
      this.logger.error({ message: 'Error creating TravelPlan indexes', error: error.message, stack: error.stack });
    }
  }

  private async createIndexes() {
    await this.travelPlanModel.createIndexes();
  }
}
