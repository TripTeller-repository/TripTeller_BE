import { Module } from '@nestjs/common';
import { MyTripService } from './my-trip.service';
import { MyTripController } from './my-trip.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from 'src/feed/feed.schema';
import { FeedExtractor } from 'src/utils/feed-extractor';
import { TravelPlanService } from 'src/travel-plan/travel-plan.service';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { UserSchema } from 'src/user/user.schema';
import { ScrapSchema } from 'src/scrap/scrap.schema';
import { FeedModule } from 'src/feed/feed.module';
import { AuthService } from 'src/authentication/auth.service';
import { UserService } from 'src/user/user.service';
import { LoginSchema } from 'src/authentication/login.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feed', schema: FeedSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Scrap', schema: ScrapSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
    FeedModule,
  ],
  providers: [MyTripService, TravelPlanService, FeedExtractor, AuthService, UserService],
  controllers: [MyTripController],
})
export class MyTripModule {}
