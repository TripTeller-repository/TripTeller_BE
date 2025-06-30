import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedSearchUtil } from './utils/feed-search.util';
import { SearchStrategyFactory } from './search-strategy.factory';
import { SearchParams } from './dto/search-params.dto';
import Feed from 'src/feed/feed.schema';
import { FeedExtractor } from 'src/utils/feed-extractor';

@Injectable()
export class SearchService {
  constructor(
    private readonly strategyFactory: SearchStrategyFactory,
    private readonly feedExtractor: FeedExtractor,
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
  ) {}

  /**
   * 검색 결과를 가져오는 메인 메서드
   * @param title 검색할 제목
   * @param content 검색할 내용
   * @param author 검색할 작성자
   * @param region 검색할 지역
   * @returns 공개된 검색 결과 배열
   */
  async fetchResult(title?: string, content?: string, author?: string, region?: string) {
    const params: SearchParams = { title, content, author, region };

    try {
      const strategies = this.strategyFactory.getApplicableStrategies(params);
      const resultArrays = await Promise.all(strategies.map((s) => s.search(params)));
      const merged = FeedSearchUtil.removeDuplicates(resultArrays.flat());

      const extracted = await this.feedExtractor.extractFeeds(merged);

      if (region) {
        if (extracted.length === 0) {
          const regionFeeds = await this.feedModel.find({ 'travelPlan.region': region }).populate('travelPlan').exec();
          const extractedRegionFeeds = await this.feedExtractor.extractFeeds(regionFeeds);
          return FeedSearchUtil.filterPublicOnly(extractedRegionFeeds);
        } else {
          return FeedSearchUtil.filterPublicOnly(extracted.filter((f) => f.region === region));
        }
      }

      return FeedSearchUtil.filterPublicOnly(extracted);
    } catch (err) {
      throw new InternalServerErrorException('검색 처리 중 오류가 발생했습니다');
    }
  }
}
