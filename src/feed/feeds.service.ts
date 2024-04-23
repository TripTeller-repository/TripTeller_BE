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

  // 모든 공개 게시물 조회
  async getPublicFeeds() {
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const feeds = await this.feedExtractor.findFeedsByCriteria(criteria);
    return this.feedExtractor.extractFeeds(feeds);
  }

  // 모든 공개 게시물 페이지네이션
  async getPublicFeedsPagination(pageNumber: number = 1) {
    const pageSize = 9; // 한 페이지당 최대 게시물 수
    const skip = (pageNumber - 1) * pageSize;
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    try {
      const feeds = await this.feedModel.find(criteria).sort({ createdAt: -1 }).skip(skip).limit(pageSize).exec();
      return this.feedExtractor.extractFeeds(feeds);
    } catch (error) {
      throw error;
    }
  }

  // 게시물 ID로 특정 공개 게시물 조회하기
  async getOnePublicFeed(feedId: string) {
    const criteria = {
      isPublic: true,
      _id: feedId,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const feeds = await this.feedExtractor.findFeedsByCriteria(criteria);
    return feeds;
  }

  // 공개 게시물 정렬 : 최신순
  // feed 스키마의 createdAt 필드의 개수가 많은 것부터 내림차순 정렬
  async sortPublicByRecent() {
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const selectedFeeds = await this.feedExtractor.findFeedsByCriteria(criteria);
    const sortedFeeds = selectedFeeds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return this.feedExtractor.extractFeeds(sortedFeeds);
  }

  // 공개 게시물 정렬 : 인기순
  // feed 스키마의 likeCount 필드의 개수가 많은 것부터 오름차순 정렬
  async sortPublicByLikeCount() {
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const selectedFeeds = await this.feedExtractor.findFeedsByCriteria(criteria);
    const sortedFeeds = selectedFeeds.sort((a, b) => b.likeCount - a.likeCount);

    return this.feedExtractor.extractFeeds(sortedFeeds);
  }

  // 공개 게시물 기간별 조회 (공개)
  async getAllFeedsByDate(startDate: string, endDate: string) {
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
      return filteredFeeds;
    } catch (error) {
      throw error;
    }
  }
}
