import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlanSchema } from './travel-plan.schema';
import { TravelPlanController } from './travel-plan.controller';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { DailyPlanService } from 'src/daily-plan/daily-plan.service';
import { TravelPlanIndexService } from './travel-plan-index.service';
import { AuthService } from 'src/authentication/auth.service';
import { UserSchema } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [DailyPlanService, TravelPlanIndexService, AuthService, UserService],
  controllers: [TravelPlanController],
})
export class TravelPlanModule {}
