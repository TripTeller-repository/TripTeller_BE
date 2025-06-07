import { Module } from '@nestjs/common';
import { OurTripController } from './our-trip.controller';
import { OurTripService } from './our-trip.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from 'src/feed/feed.schema';
import { FeedExtractor } from 'src/utils/feed-extractor';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { ScrapSchema } from 'src/scrap/scrap.schema';
import { AuthService } from 'src/authentication/auth.service';
import { FeedModule } from 'src/feed/feed.module';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { LoginSchema } from 'src/authentication/login.schema';
import { UserSchema } from 'src/user/schemas/user.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feed', schema: FeedSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Scrap', schema: ScrapSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
    FeedModule,
    UserModule,
  ],
  providers: [OurTripService, FeedExtractor, AuthService],
  controllers: [OurTripController],
})
export class OurTripModule {}
