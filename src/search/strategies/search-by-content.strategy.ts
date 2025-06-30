import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Feed from 'src/feed/feed.schema';
import { DailySchedule } from 'src/daily-schedule/daily-schedule.schema';
import { DailyPlan } from 'src/daily-plan/daily-plan.schema';
import { TravelPlan } from 'src/travel-plan/travel-plan.schema';
import { FeedSearchStrategy } from './feed-search.strategy';
import { SearchParams } from '../dto/search-params.dto';
import { FeedSearchUtil } from '../utils/feed-search.util';

/**
 * 내용 기반 피드 검색 전략
 * @description postContent(게시물 내용)을 통해 연관된 DailyPlan → TravelPlan → Feed를 추적하여 검색
 */
@Injectable()
export class SearchByContentStrategy implements FeedSearchStrategy {
  constructor(
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('DailySchedule') private readonly dailyScheduleModel: Model<DailySchedule>,
    @InjectModel('DailyPlan') private readonly dailyPlanModel: Model<DailyPlan>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
  ) {}

  isApplicable(params: SearchParams): boolean {
    return !!params.content;
  }

  /**
   * 일정 내 작성된 내용을 기반으로 피드를 검색
   * @param params 검색 파라미터 (content)
   * @returns 관련 피드 배열
   * @throws InternalServerErrorException 내부 오류 발생 시
   */
  async search(params: SearchParams): Promise<Feed[]> {
    try {
      const regex = FeedSearchUtil.createRegex(params.content);
      const travelLogs = await this.dailyScheduleModel.find({ postContent: regex }).select('_id').lean();
      const travelLogIds = travelLogs.map((log) => log._id);
      if (!travelLogIds.length) return [];

      const dailyPlans = await this.dailyPlanModel
        .find({ dailySchedules: { $in: travelLogIds } })
        .select('_id')
        .lean();
      const dailyPlanIds = dailyPlans.map((plan) => plan._id);
      if (!dailyPlanIds.length) return [];

      const travelPlans = await this.travelPlanModel
        .find({ dailyPlans: { $in: dailyPlanIds } })
        .select('_id')
        .lean();
      const travelPlanIds = travelPlans.map((plan) => plan._id);
      if (!travelPlanIds.length) return [];

      return this.feedModel
        .find({ 'travelPlan._id': { $in: travelPlanIds } })
        .populate('travelPlan')
        .exec();
    } catch (err) {
      throw new InternalServerErrorException('내용 검색 중 오류 발생');
    }
  }
}
