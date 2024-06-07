import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from 'src/feed/feed.schema';
import { FeedService } from './feed.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Feed', schema: FeedSchema }])],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
