import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelPlan } from 'src/travelPlan/travelPlan.schema';
import Feed from './feed.schema';
import { FeedExtractor } from 'src/utils/feedExtractor';

@Injectable()
export class FeedsService {
  constructor(
    private readonly feedExtractor: FeedExtractor,
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
  ) {}

  ////////////////////////////////////
  /////// feeds (공개 게시물) ////////
  ////////////////////////////////////

  // 모든 공개 게시물 조회 (페이지네이션)
  async fetchOurFeeds(pageNumber: number = 1, userId: string) {
    const pageSize = 9;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const paginatedResult = await this.feedExtractor.getFeedPaginated(pageNumber, pageSize, criteria);
    const extractedFeeds = await this.feedExtractor.extractFeeds(paginatedResult.feeds.data, userId);
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
  // feed 스키마의 createdAt 필드의 개수가 많은 것부터 내림차순 정렬
  async sortOurFeedsByRecent(pageNumber: number = 1, userId: string) {
    const pageSize = 9;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const paginatedResult = await this.feedExtractor.getFeedPaginated(pageNumber, pageSize, criteria);
    const sortedFeeds = paginatedResult.feeds.data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    paginatedResult.feeds.data = await this.feedExtractor.extractFeeds(sortedFeeds, userId);

    return paginatedResult;
  }

  // 공개 게시물 정렬 : 인기순 (페이지네이션)
  // feed 스키마의 likeCount 필드의 개수가 많은 것부터 오름차순 정렬
  async sortOurFeedsByLikeCount(pageNumber: number = 1, userId: string) {
    const pageSize = 9;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const paginatedResult = await this.feedExtractor.getFeedPaginated(pageNumber, pageSize, criteria);
    const sortedFeeds = paginatedResult.feeds.data.sort((a, b) => b.likeCount - a.likeCount);
    paginatedResult.feeds.data = await this.feedExtractor.extractFeeds(sortedFeeds, userId);

    return paginatedResult;
  }

  // // 공개 게시물 기간별 조회 (페이지네이션)
  // async fetchFeedsByDate(startDate: string, endDate: string, pageNumber: number = 1, pageSize: number = 9) {
  //   const InputStartDate: Date = new Date(startDate);
  //   const InputEndDate: Date = new Date(endDate);
  //   console.log(InputStartDate, InputEndDate);
  //   if (InputStartDate > InputEndDate) {
  //     throw new BadRequestException('startDate는 endDate보다 이전이어야 합니다.');
  //   }
  //   try {
  //     // travelPlan의 startDate가 InputStartDate보다 크고
  //     // travelPlan의 endDate가 InputEndDate보다 작음

  //     const criteria = {
  //       isPublic: true,
  //       // 'travelPlan.dailyPlans.date': { $gte: InputStartDate, $lte: InputEndDate },
  //       $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  //     };

  //     const paginatedResult = await this.feedExtractor.getFeedPaginated(pageNumber, pageSize, criteria);

  //     const paginatedFeeds = paginatedResult.feeds.data;

  //     console.log('★★★★★★★', paginatedFeeds);

  //     const filteredFeeds = paginatedFeeds.filter((feed) => {
  //       console.log('필터링!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  //       console.log('▲', 'feed안 데일리플랜', feed.travelPlan.dailyPlans);
  //       console.log('날짜', feed.travelPlan.dailyPlans.date);
  //       if (feed.isPublic === false) return false;

  //       if (!feed.travelPlan) return false;

  //       if (feed.travelPlan.dailyPlans.lenth === 0) return false;

  //       for (const dailyPlan of feed.travelPlan.dailyPlans) {
  //         console.log('데일리플랜의 날짜!!!!!!!!!!!!!!!!!!!!', dailyPlan.date);
  //         if (dailyPlan.date < InputStartDate || dailyPlan.date > InputEndDate) return false;
  //       }
  //       return true;
  //     });

  //     if (!filteredFeeds || filteredFeeds.length === 0) {
  //       return { message: '게시물이 해당 날짜 사이에 존재하지 않습니다.' };
  //     }
  //     return filteredFeeds;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
