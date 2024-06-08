import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelPlan } from './travel-plan.schema';

@Injectable()
export class TravelPlanIndexService implements OnModuleInit {
  constructor(@InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>) {}

  async onModuleInit() {
    try {
      await this.createIndexes();
      console.log('TravelPlan indexes created successfully');
    } catch (error) {
      console.error('Error creating TravelPlan indexes', error);
    }
  }

  private async createIndexes() {
    await this.travelPlanModel.createIndexes();
  }
}
