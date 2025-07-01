import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from '@feed/feed.schema';
import { FeedService } from '@feed/feed.service';
import { UserModule } from '@user/user.module';
import { FeedExtractor } from './feed-extractor';
import { ScrapModule } from '@scrap/scrap.module';
import { CommonModule } from '@common/modules/common.module';
import { TravelPlanSchema } from '@travel-plan/travel-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feed', schema: FeedSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
    ]),
    UserModule,
    ScrapModule,
    CommonModule,
  ],
  providers: [FeedService, FeedExtractor],
  exports: [FeedService, FeedExtractor],
})
export class FeedModule {}
