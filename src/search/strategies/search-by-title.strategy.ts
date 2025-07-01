import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Feed from '@feed/feed.schema';
import { FeedSearchStrategy } from './feed-search.strategy';
import { SearchParams } from '../dto/search-params.dto';
import { FeedSearchUtil } from '../utils/feed-search.util';

/**
 * 제목 기반 피드 검색 전략
 * @description TravelPlan.title(제목) 필드를 기준으로 피드를 검색
 */
@Injectable()
export class SearchByTitleStrategy implements FeedSearchStrategy {
  constructor(@InjectModel('Feed') private readonly feedModel: Model<Feed>) {}

  isApplicable(params: SearchParams): boolean {
    return !!params.title;
  }

  /**
   * 제목 기준으로 피드를 검색
   * @param params 검색 파라미터 (title)
   * @returns 해당 제목을 포함한 피드 배열
   * @throws InternalServerErrorException 내부 오류 발생 시
   */
  async search(params: SearchParams): Promise<Feed[]> {
    try {
      const regex = FeedSearchUtil.createRegex(params.title);
      return this.feedModel
        .find({ 'travelPlan.title': { $regex: regex } })
        .populate('travelPlan')
        .exec();
    } catch (err) {
      throw new InternalServerErrorException('제목 검색 중 오류 발생');
    }
  }
}
