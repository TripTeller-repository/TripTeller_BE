import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedExtractor } from 'src/utils/feed-extractor';
import Feed from 'src/feed/feed.schema';
import { TravelPlan } from 'src/travel-plan/travel-plan.schema';

@Injectable()
export class OurTripService {
  constructor(
    private readonly feedExtractor: FeedExtractor,
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
  ) {}

  // 모든 공개 게시물 조회 (페이지네이션)
  async fetchOurFeeds(pageNumber: number = 1, userId?: string) {
    const pageSize = 9;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const paginatedResult = await this.feedExtractor.getFeedPaginated(pageNumber, pageSize, criteria);
    const extractedFeeds = await this.feedExtractor.extractFeeds(paginatedResult.feeds.data, userId || null);
    // console.log('우리의 여행 게시글', extractedFeeds);
    paginatedResult.feeds.data = extractedFeeds;

    return paginatedResult;
  }

  // 게시물 ID로 특정 공개 게시물 조회하기
  async fetchOurFeed(feedId: string) {
    const criteria = {
      isPublic: true,
      _id: feedId,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const feed = await this.feedExtractor.findFeedsByCriteria(criteria);
    const extractedFeed = await this.feedExtractor.extractFeeds(feed);

    return extractedFeed;
  }

  // 공개 게시물 정렬 : 최신순 (페이지네이션)
  // feed 스키마의 createdAt 필드의 날짜를 내림차순 정렬
  async sortOurFeedsByRecent(pageNumber: number = 1, userId?: string) {
    const pageSize = 9;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const sort = { createdAt: -1 }; // 최신순으로 정렬

    // 최신순으로 정렬 후 페이지네이션
    const paginatedResult = await this.feedExtractor.getFeedPaginated(pageNumber, pageSize, criteria, sort);
    paginatedResult.feeds.data = await this.feedExtractor.extractFeeds(paginatedResult.feeds.data, userId || null);

    return paginatedResult;
  }

  // 공개 게시물 정렬 : 인기순 (페이지네이션)
  // feed 스키마의 likeCount 필드의 개수를 내림차순 정렬
  async sortOurFeedsByLikeCount(pageNumber: number = 1, userId?: string) {
    const pageSize = 9;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const sort = { likeCount: -1 }; // 인기순 정렬

    const paginatedResult = await this.feedExtractor.getFeedPaginated(pageNumber, pageSize, criteria, sort);
    paginatedResult.feeds.data = await this.feedExtractor.extractFeeds(paginatedResult.feeds.data, userId || null);

    return paginatedResult;
  }

  // 공개 게시물 기간별 조회
  async fetchFeedsByDate(startDate: string, endDate: string, pageNumber: number, userId?: string) {
    const pageSize = 9;
    const InputStartDate: Date = new Date(startDate);
    const InputEndDate: Date = new Date(endDate);

    if (InputStartDate > InputEndDate) {
      throw new BadRequestException('startDate는 endDate보다 이전이어야 합니다.');
    }
    try {
      // travelPlan의 startDate가 InputStartDate보다 크고
      // travelPlan의 endDate가 InputEndDate보다 작음

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

      // 필터링된 배열의 id목록과 일치하는 게시글을 가져오도록 함.
      const paginationCriteria = { _id: { $in: filteredFeeds.map((feed) => feed._id) } };
      const paginatedResult = await this.feedExtractor.getFeedPaginated(pageNumber, pageSize, paginationCriteria);
      paginatedResult.feeds.data = await this.feedExtractor.extractFeeds(paginatedResult.feeds.data, userId || null);

      return paginatedResult;
    } catch (error) {
      throw error;
    }
  }
}
