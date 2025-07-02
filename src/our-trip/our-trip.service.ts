import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Feed from '@feed/feed.schema';
import { TravelPlan } from '@travel-plan/travel-plan.schema';
import { FeedExtractor } from '@feed/feed-extractor';
import { FeedService } from '@feed/feed.service';

@Injectable()
export class OurTripService {
  constructor(
    private readonly feedExtractor: FeedExtractor,
    private readonly feedService: FeedService,
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
  ) {}

  /**
   * 모든 공개 게시물을 조회합니다. (페이지네이션)
   *
   * @param {number} pageNumber - 페이지 번호 (기본값: 1)
   * @param {string} [userId] - 사용자 ID (선택적, 로그인 상태에서 개인화된 피드를 제공하기 위함)
   * @returns {Promise<any>} 페이지네이션된 공개 게시물 목록
   */
  async fetchOurFeeds(pageNumber: number = 1, userId?: string) {
    const pageSize = 9;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const paginatedResult = await this.feedService.getPaginatedFeeds(pageNumber, pageSize, criteria);
    const extractedFeeds = await this.feedExtractor.extractFeeds(paginatedResult.feeds.data, userId || null);

    paginatedResult.feeds.data = extractedFeeds;

    return paginatedResult;
  }

  /**
   * 게시물 ID로 특정 공개 게시물을 조회
   *
   * @param {string} feedId - 게시물 ID
   * @returns {Promise<any>} 추출된 게시물 데이터
   */
  async fetchOurFeed(feedId: string) {
    const criteria = {
      isPublic: true,
      _id: feedId,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const feed = await this.feedService.findFeedsByCriteria(criteria);
    const extractedFeed = await this.feedExtractor.extractFeeds(feed);

    return extractedFeed;
  }

  /**
   * 공개 게시물을 최신순으로 정렬하여 조회 (페이지네이션)
   *
   * @param {number} pageNumber - 페이지 번호 (기본값: 1)
   * @param {string} [userId] - 사용자 ID (선택적, 로그인 상태에서 개인화된 피드를 제공하기 위함)
   * @returns {Promise<any>} 최신순으로 정렬된 페이지네이션된 게시물 목록
   */
  async sortOurFeedsByRecent(pageNumber: number = 1, userId?: string) {
    const pageSize = 9;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const sort = { createdAt: -1 };

    const paginatedResult = await this.feedService.getPaginatedFeeds(pageNumber, pageSize, criteria, sort);
    paginatedResult.feeds.data = await this.feedExtractor.extractFeeds(paginatedResult.feeds.data, userId || null);

    return paginatedResult;
  }

  /**
   * 공개 게시물을 인기순으로 정렬하여 조회 (페이지네이션)
   *
   * @param {number} pageNumber - 페이지 번호 (기본값: 1)
   * @param {string} [userId] - 사용자 ID (선택적, 로그인 상태에서 개인화된 피드를 제공하기 위함)
   * @returns {Promise<any>} 인기순으로 정렬된 페이지네이션된 게시물 목록
   */
  async sortOurFeedsByLikeCount(pageNumber: number = 1, userId?: string) {
    const pageSize = 9;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const sort = { likeCount: -1 };

    const paginatedResult = await this.feedService.getPaginatedFeeds(pageNumber, pageSize, criteria, sort);
    paginatedResult.feeds.data = await this.feedExtractor.extractFeeds(paginatedResult.feeds.data, userId || null);

    return paginatedResult;
  }

  /**
   * 공개 게시물을 특정 날짜 범위(startDate ~ endDate)에 해당하는 게시물만 조회
   *
   * @param {string} startDate - 조회 시작 날짜 (YYYY-MM-DD 형식)
   * @param {string} endDate - 조회 종료 날짜 (YYYY-MM-DD 형식)
   * @param {number} pageNumber - 페이지 번호
   * @param {string} [userId] - 사용자 ID
   * @throws {BadRequestException} startDate가 endDate보다 늦은 경우
   * @returns {Promise<any>} 날짜 범위 내에 필터링된 페이지네이션된 게시물 목록
   */
  async fetchFeedsByDate(startDate: string, endDate: string, pageNumber: number, userId?: string) {
    const pageSize = 9;
    const InputStartDate: Date = new Date(startDate);
    const InputEndDate: Date = new Date(endDate);

    if (InputStartDate > InputEndDate) {
      throw new BadRequestException('startDate는 endDate보다 이전이어야 합니다.');
    }
    try {
      const criteria = {
        isPublic: true,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      };

      const AllFeeds = await this.feedModel.find(criteria).exec();

      const filteredFeeds = AllFeeds.filter((feed) => {
        if (feed.isPublic === false) return false;

        if (!feed.travelPlan) return false;

        if (!feed.travelPlan.dailyPlans) return false;

        for (const dailyPlan of feed.travelPlan.dailyPlans) {
          if (dailyPlan.date < InputStartDate || dailyPlan.date > InputEndDate) return false;
        }
        return true;
      });

      if (!filteredFeeds || filteredFeeds.length === 0) {
        return { message: '게시물이 해당 날짜 사이에 존재하지 않습니다.' };
      }

      const paginationCriteria = { _id: { $in: filteredFeeds.map((feed) => feed._id) } };
      const paginatedResult = await this.feedService.getPaginatedFeeds(pageNumber, pageSize, paginationCriteria);
      paginatedResult.feeds.data = await this.feedExtractor.extractFeeds(paginatedResult.feeds.data, userId || null);

      return paginatedResult;
    } catch (error) {
      throw error;
    }
  }
}
