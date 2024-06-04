import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from 'src/feed/feed.schema';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { UserSchema } from 'src/user/user.schema';
import { FeedExtractor } from 'src/utils/feed-extractor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feed', schema: FeedSchema },
      { name: 'User', schema: UserSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
    ]),
  ],
  providers: [SearchService, FeedExtractor],
  controllers: [SearchController],
})
export class SearchModule {}
