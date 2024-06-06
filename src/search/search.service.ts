import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyPlan } from 'src/daily-plan/daily-plan.schema';
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
    @InjectModel('DailyPlan') private readonly dailyPlanModel: Model<DailyPlan>,
    private readonly feedExtractor: FeedExtractor,
  ) {}

  async fetchResult(title: string, content: string, author: string, region: string) {
    const searchResult = []; // 일반 검색 결과 (제목, 작성자, 내용)
    let filteredResult = []; // 일반 검색 후 지역별로 필터링된 검색결과
    let extractedRegionResult = []; // 일반 검색 없이 지역별로 필터링만 된 검색결과

    // 제목
    if (title) {
      const regexTitle = new RegExp(`.*${title}.*`, 'gi');

      const feeds = await this.feedModel
        .find({ 'travelPlan.title': { $regex: regexTitle } })
        .populate('travelPlan')
        .exec();

      searchResult.push(...feeds);
    }

    // 내용
    // travelLog의 postContent
    if (content) {
      const regexContent = new RegExp(`.*${content}.*`, 'gi');

      // travelLog의 _id값 구하기
      const travelLogs = await this.dailyScheduleModel.find({ postContent: regexContent }).exec();
      const travelLogIds = travelLogs.map((log) => log._id);

      // travelLog의 _id값을 DailyPlan 모델에 있는 dailySchedules 배열 안에서 찾기
      const dailyPlans = await this.dailyPlanModel.find({
        dailySchedules: { $in: travelLogIds },
      });
      const dailyPlansIds = dailyPlans.map((plan) => plan._id);

      // tarvelPlan 모델의 dailyPlans 필드(배열)에서 Dailylan모델의 _id값이 있는지 확인
      const travelPlans = await this.travelPlanModel.find({ dailyPlans: { $in: dailyPlansIds } }).exec();
      const travelPlanIds = travelPlans.map((plan) => plan._id);

      // feed 모델의 travelPlan 필드에서 _id가 travelPlanIds인지 확인
      const feeds = await this.feedModel
        .find({ 'travelPlan._id': { $in: travelPlanIds } })
        .populate('travelPlan')
        .exec();
      searchResult.push(...feeds);
    }

    // 작성자
    if (author) {
      const regexAuthor = new RegExp(`.*${author}.*`, 'gi');
      const user = await this.userModel.findOne({ nickname: regexAuthor });
      if (user) {
        const feeds = await this.feedModel.find({ userId: user._id }).exec();
        searchResult.push(...feeds);
      }
    }

    const extractedResult = await this.feedExtractor.extractFeeds(searchResult);

    // 지역
    // "제목, 내용, 작성자"로 검색한 결과가 있으면 필터링 역할
    // 검색한 결과가 없으면 전체 글 중 특정 지역에 대한 결과가 나옴.
    if (region) {
      if (extractedResult.length === 0) {
        const regionfeeds = await this.feedModel.find({ 'travelPlan.region': region }).populate('travelPlan').exec();
        extractedRegionResult = await this.feedExtractor.extractFeeds(regionfeeds);

        return extractedRegionResult;
      } else {
        filteredResult = extractedResult.filter((result) => result.region === region);

        return filteredResult;
      }
    }

    return extractedResult;
  }
}
