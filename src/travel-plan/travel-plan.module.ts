import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlanSchema } from './travel-plan.schema';
import { DailyPlanSchema } from '@daily-plan/daily-plan.schema';
import { TravelPlanIndexService } from './travel-plan-index.service';
import { AuthService } from '@auth/auth.service';
import { TravelPlanController } from './travel-plan.controller';
import { TravelPlanService } from './travel-plan.service';
import { FeedSchema } from '@feed/feed.schema';
import { ScrapSchema } from '@scrap/scrap.schema';
import { LoginSchema } from '@auth/login.schema';
import { UserSchema } from '@user/schemas/user.schema';
import { UserModule } from '@user/user.module';
import { FeedModule } from '@feed/feed.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Feed', schema: FeedSchema },
      { name: 'Scrap', schema: ScrapSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
    UserModule,
    FeedModule,
  ],
  providers: [TravelPlanService, TravelPlanIndexService, AuthService],
  controllers: [TravelPlanController],
  exports: [MongooseModule],
})
export class TravelPlanModule {}
