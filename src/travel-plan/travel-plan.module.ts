import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelPlanSchema } from './travel-plan.schema';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { TravelPlanIndexService } from './travel-plan-index.service';
import { AuthService } from 'src/authentication/auth.service';
import { TravelPlanController } from './travel-plan.controller';
import { TravelPlanService } from './travel-plan.service';
import { FeedExtractor } from 'src/utils/feed-extractor';
import { FeedSchema } from 'src/feed/feed.schema';
import { ScrapSchema } from 'src/scrap/scrap.schema';
import { LoginSchema } from 'src/authentication/login.schema';
import { UserSchema } from 'src/user/schemas/user.schema';
import { UserModule } from 'src/user/user.module';

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
  ],
  providers: [TravelPlanService, TravelPlanIndexService, AuthService, FeedExtractor],
  controllers: [TravelPlanController],
})
export class TravelPlanModule {}
