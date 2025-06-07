import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailySchedule } from 'src/daily-schedule/daily-schedule.schema';
import Feed, { FeedDocument } from 'src/feed/feed.schema';
import Scrap from 'src/scrap/scrap.schema';
import { RegionName } from 'src/travel-plan/region-name.enum';
import { TravelPlan } from 'src/travel-plan/travel-plan.schema';
import { User } from 'src/user/schemas/user.schema';

/**
 * 피드 추출 결과
 */
export interface ExtractedFeed {
  feedId: string;
  travelPlanId: string;
  travelPlan: any;
  userId: string;
  createdAt: Date;
  isPublic: boolean;
  likeCount: number;
  title: string;
  region: RegionName;
  startDate: Date;
  endDate: Date;
  thumbnailUrl: string | null;
  coverImage: string;
  isScrapped: boolean;
}

/**
 * 페이지네이션 결과
 */
export interface PaginationResult {
  success: boolean;
  feeds: {
    metadata: {
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    };
    data: any[];
  };
}

@Injectable()
export class FeedExtractor {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
    @InjectModel('Scrap') private readonly scrapModel: Model<Scrap>,
  ) {}

  /**
   * 로그인한 회원과 글 작성자가 일치하는지 판별하는 함수
   */
  checkUser = async (feedId: string, userId: string): Promise<void> => {
    const feed = await this.feedModel.findOne({ _id: feedId }).exec();

    if (!feed) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    if (feed.userId !== userId) {
      throw new NotFoundException('로그인한 회원과 게시물 작성자가 일치하지 않습니다.');
    }
  };

  /**
   * 회원 ID로 작성자 검색하기
   */
  getUserByUserId = async (userId: string): Promise<User> => {
    const user = await this.userModel.findOne({ _id: userId }).exec();
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  };

  /**
   * 회원 ID로 게시글 검색하기
   */
  findFeedsByUserId = async (userId: string): Promise<FeedDocument[]> => {
    return await this.feedModel
      .find({
        userId,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      })
      .exec();
  };

  /**
   * 페이지네이션 설정하는 함수
   */
  getFeedPaginated = async (
    pageNumber: number = 1,
    pageSize: number = 9,
    criteria: any = {},
    sort: any = {},
  ): Promise<PaginationResult> => {
    const skip = (pageNumber - 1) * pageSize;

    try {
      const pipeline: any[] = [{ $match: criteria }];

      if (Object.keys(sort).length) {
        pipeline.push({ $sort: sort });
      }

      pipeline.push({
        $facet: {
          metadata: [
            {
              $match: {
                $and: [
                  { travelPlan: { $ne: null } },
                  { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
                ],
              },
            },
            { $count: 'totalCount' },
          ],
          data: [{ $skip: skip }, { $limit: pageSize }],
        },
      });

      const feeds = await this.feedModel.aggregate(pipeline);
      const totalCount = feeds[0].metadata.length > 0 ? feeds[0].metadata[0].totalCount : 0;

      return {
        success: true,
        feeds: {
          metadata: { totalCount, pageNumber, pageSize },
          data: feeds[0].data,
        },
      };
    } catch (error) {
      throw new Error('페이지네이션 작업이 실패하였습니다.');
    }
  };

  /**
   * 게시물 정렬 기준 설정하는 함수
   */
  findFeedsByCriteria = async (criteria: any): Promise<FeedDocument[]> => {
    return this.feedModel.find(criteria).exec();
  };

  /**
   * 스크랩 여부 확인 함수
   */
  isScrappedByUser = async (feedId: string, userId?: string): Promise<boolean> => {
    if (!userId) return false;
    const scrap = await this.scrapModel.findOne({ feedId, userId }).exec();
    return !!scrap;
  };

  /**
   * 썸네일 URL 추출
   */
  private extractThumbnailUrl(dailySchedules: DailySchedule[]): string | null {
    if (!dailySchedules || dailySchedules.length === 0) return null;

    // 1. isThumbnail이 true이고 imageUrl이 있는 것을 우선 탐색
    const thumbnailSchedule = dailySchedules.find((schedule) => schedule.isThumbnail && schedule.imageUrl);

    if (thumbnailSchedule) {
      return thumbnailSchedule.imageUrl;
    }

    // 2. imageUrl이 있는 첫 번째 것 사용
    const scheduleWithImage = dailySchedules.find((schedule) => schedule.imageUrl);

    return scheduleWithImage?.imageUrl || null;
  }

  /**
   * 원하는 형태로 리턴값 추출
   */
  extractFeeds = async (feeds: FeedDocument[], userId?: string): Promise<ExtractedFeed[]> => {
    const extractFeed = async (feed: FeedDocument): Promise<ExtractedFeed | null> => {
      try {
        const { likeCount, coverImage, isPublic } = feed;
        const travelPlanId = feed.travelPlan;

        const travelPlan = await this.travelPlanModel.findById(travelPlanId);

        if (!travelPlan) {
          console.log(`Feed ${feed._id} has no associated travel plan.`);
          return null;
        }

        // 모든 일일 일정 수집
        const dailySchedules: DailySchedule[] =
          travelPlan['dailyPlans']?.map((dailyPlan) => dailyPlan.dailySchedules)?.flat() || [];

        // 썸네일 URL 추출
        const thumbnailUrl = this.extractThumbnailUrl(dailySchedules);

        // 스크랩 여부 확인
        const isScrapped = await this.isScrappedByUser(feed._id.toString(), userId);

        return {
          feedId: feed._id.toString(),
          travelPlanId: feed.travelPlan['_id']?.toString(),
          travelPlan: feed.travelPlan,
          userId: feed.userId,
          createdAt: feed.createdAt,
          isPublic,
          likeCount,
          title: travelPlan['title'],
          region: travelPlan['region'] as RegionName,
          startDate: travelPlan['startDate'],
          endDate: travelPlan['endDate'],
          thumbnailUrl,
          coverImage,
          isScrapped,
        };
      } catch (error) {
        console.error(`Error extracting feed data for feed ${feed._id}:`, error);
        return null;
      }
    };

    const extractedFeeds = await Promise.all(
      feeds.map(async (feed) => {
        const extractedFeed = await extractFeed(feed);

        if (extractedFeed === null) {
          console.log(`Feed ${feed._id} was filtered out.`);
        }

        return extractedFeed;
      }),
    );

    return extractedFeeds.filter((feed): feed is ExtractedFeed => feed !== null);
  };
}
