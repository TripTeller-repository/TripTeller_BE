import { Module } from '@nestjs/common';
import { OurTripController } from './our-trip.controller';
import { OurTripService } from './our-trip.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from 'src/feed/feed.schema';
import { FeedExtractor } from 'src/utils/feed-extractor';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { UserSchema } from 'src/user/user.schema';
import { ScrapSchema } from 'src/scrap/scrap.schema';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/authentication/auth.service';
import { FeedModule } from 'src/feed/feed.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feed', schema: FeedSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Scrap', schema: ScrapSchema },
    ]),
    FeedModule,
  ],
  providers: [OurTripService, FeedExtractor, UserService, AuthService],
  controllers: [OurTripController],
})
export class OurTripModule {}
