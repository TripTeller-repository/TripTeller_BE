import { Module } from '@nestjs/common';
import { ScrapController } from './scrap.controller';
import { ScrapService } from './scrap.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapSchema } from './scrap.schema';
import { FeedExtractor } from 'src/utils/feed-extractor';
import { FeedSchema } from 'src/feed/feed.schema';
import { UserSchema } from 'src/user/user.schema';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Scrap', schema: ScrapSchema },
      { name: 'Feed', schema: FeedSchema },
      { name: 'User', schema: UserSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
    ]),
  ],
  providers: [ScrapService, FeedExtractor],
  controllers: [ScrapController],
})
export class ScrapModule {}
