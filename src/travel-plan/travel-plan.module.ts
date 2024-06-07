import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlanSchema } from './travel-plan.schema';
import { TravelPlanController } from './travel-plan.controller';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { DailyPlanService } from 'src/daily-plan/daily-plan.service';
import { TravelPlanIndexService } from './travel-plan-index.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
    ]),
  ],
  providers: [DailyPlanService, TravelPlanIndexService],
  controllers: [TravelPlanController],
})
export class TravelPlanModule {}
