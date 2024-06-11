import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from 'src/feed/feed.schema';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { UserSchema } from 'src/user/user.schema';
import { FeedExtractor } from 'src/utils/feed-extractor';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { DailyScheduleSchema } from 'src/daily-schedule/daily-schedule.schema';
import { ScrapSchema } from 'src/scrap/scrap.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feed', schema: FeedSchema },
      { name: 'User', schema: UserSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'Scrap', schema: ScrapSchema },
    ]),
  ],
  providers: [SearchService, FeedExtractor],
  controllers: [SearchController],
})
export class SearchModule {}
