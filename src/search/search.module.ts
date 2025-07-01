import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchStrategyFactory } from './search-strategy.factory';
import { FeedSchema } from '@feed/feed.schema';
import { UserSchema } from '@user/schemas/user.schema';
import { TravelPlanSchema } from '@travel-plan/travel-plan.schema';
import { DailyPlanSchema } from '@daily-plan/daily-plan.schema';
import { DailyScheduleSchema } from '@daily-schedule/daily-schedule.schema';
import { ScrapSchema } from '@scrap/scrap.schema';
import { SearchByTitleStrategy } from './strategies/search-by-title.strategy';
import { SearchByAuthorStrategy } from './strategies/search-by-author.strategy';
import { SearchByContentStrategy } from './strategies/search-by-content.strategy';
import { FeedModule } from '@feed/feed.module';
import { FeedExtractor } from '@feed/feed-extractor';
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
    FeedModule,
  ],
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchByTitleStrategy,
    SearchByAuthorStrategy,
    SearchByContentStrategy,
    FeedExtractor,
    {
      provide: SearchStrategyFactory,
      useFactory: (title: SearchByTitleStrategy, author: SearchByAuthorStrategy, content: SearchByContentStrategy) =>
        new SearchStrategyFactory([title, author, content]),
      inject: [SearchByTitleStrategy, SearchByAuthorStrategy, SearchByContentStrategy],
    },
  ],
})
export class SearchModule {}
