import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelPlan } from './travel-plan.schema';
import { FeedService } from 'src/feed/feed.service';

@Injectable()
export class TravelPlanIndexService implements OnModuleInit {
  private readonly logger = new Logger(FeedService.name);

  constructor(@InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>) {}

  async onModuleInit() {
    try {
      await this.createIndexes();
      this.logger.log('▶▶▶ TravelPlan indexes created successfully');
    } catch (error) {
      this.logger.error('Error creating TravelPlan indexes', error);
    }
  }

  private async createIndexes() {
    await this.travelPlanModel.createIndexes();
  }
}
