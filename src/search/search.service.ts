import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailySchedule } from 'src/daily-schedule/daily-schedule.schema';
import Feed from 'src/feed/feed.schema';
import { TravelPlan } from 'src/travel-plan/travel-plan.schema';
import { User } from 'src/user/user.schema';
import { FeedExtractor } from 'src/utils/feed-extractor';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('DailySchedule') private readonly dailyScheduleModel: Model<DailySchedule>,
    private readonly feedExtractor: FeedExtractor,
  ) {}

  async fetchResult(title: string, content: string, author: string, region: string) {
    const searchResult = [];

    // 제목
    if (title) {
      const feeds = await this.feedModel.find().populate('travelPlan', 'title').exec();
      searchResult.push(...feeds);
    }

    // 내용
    // trvelLog의 내용
    if (content) {
      const feeds = await this.dailyScheduleModel
        .find({
          postContent: { $regex: `.*${content}.*`, $options: 'i' },
        })
        .exec();
    }

    // 작성자
    if (author) {
      const user = await this.userModel.findOne({ nickname: { $regex: `.*${author}.*`, $options: 'i' } });
      if (user) {
        const feeds = await this.feedModel.find({ userId: user._id }).exec();
        searchResult.push(...feeds);
      }
    }

    // 지역 (필터링)
    if (region) {
      searchResult.filter((result) => result.travelPlan.region === region);
    }

    const extractedResult = searchResult.map((result) => this.feedExtractor.extractFeeds(result));

    return extractedResult;
  }
}
