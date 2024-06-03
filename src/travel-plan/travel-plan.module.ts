import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlanSchema } from './travel-plan.schema';
import { TravelPlanController } from './travel-plan.controller';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { DailyPlanService } from 'src/daily-plan/daily-plan.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
    ]),
  ],
  providers: [DailyPlanService],
  controllers: [TravelPlanController],
})
export class TravelPlanModule {}
