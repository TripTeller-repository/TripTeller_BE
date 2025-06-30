import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchStrategyFactory } from './search-strategy.factory';
import { FeedExtractor } from 'src/utils/feed-extractor';
import { FeedSchema } from 'src/feed/feed.schema';
import { UserSchema } from 'src/user/schemas/user.schema';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { DailyScheduleSchema } from 'src/daily-schedule/daily-schedule.schema';
import { ScrapSchema } from 'src/scrap/scrap.schema';
import { SearchByTitleStrategy } from './strategies/search-by-title.strategy';
import { SearchByAuthorStrategy } from './strategies/search-by-author.strategy';
import { SearchByContentStrategy } from './strategies/search-by-content.strategy';
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
  controllers: [SearchController],
  providers: [
    SearchService,
    FeedExtractor,
    SearchByTitleStrategy,
    SearchByAuthorStrategy,
    SearchByContentStrategy,
    {
      provide: SearchStrategyFactory,
      useFactory: (title: SearchByTitleStrategy, author: SearchByAuthorStrategy, content: SearchByContentStrategy) =>
        new SearchStrategyFactory([title, author, content]),
      inject: [SearchByTitleStrategy, SearchByAuthorStrategy, SearchByContentStrategy],
    },
  ],
})
export class SearchModule {}
