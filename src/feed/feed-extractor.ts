import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedDocument } from '@feed/feed.schema';
import { FeedScrapService } from '@common/services/feed-scrap.service';

export interface ExtractedFeed {
  feedId: string;
  travelPlanId: string | null;
  userId: string;
  createdAt: Date;
  isPublic: boolean;
  likeCount: number;
  title: string | null;
  region: string | null;
  startDate: Date | null;
  endDate: Date | null;
  thumbnailUrl: string | null;
  coverImage: string | null;
  isScrapped: boolean;
}

@Injectable()
export class FeedExtractor {
  private readonly pageSize = 9;

  constructor(
    @InjectModel('Feed') private readonly feedModel: Model<FeedDocument>,
    private readonly feedScrapService: FeedScrapService,
  ) {}

  /**
   * 공통 페이지네이션 + 조회 (개선: 중복 쿼리 제거)
   */
  private async aggregateFeeds(criteria: any, pageNumber = 1, sort: any = { createdAt: -1 }) {
    const skip = (pageNumber - 1) * this.pageSize;

    const pipeline = [
      { $match: criteria },
      { $sort: sort },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: this.pageSize },
            {
              $lookup: {
                from: 'TravelPlan',
                localField: 'travelPlan',
                foreignField: '_id',
                as: 'travelPlan',
                pipeline: [
                  {
                    $lookup: {
                      from: 'DailySchedule',
                      localField: 'dailySchedules',
                      foreignField: '_id',
                      as: 'dailySchedules',
                      pipeline: [{ $project: { imageUrl: 1, isThumbnail: 1 } }],
                    },
                  },
                  {
                    $project: {
                      title: 1,
                      region: 1,
                      startDate: 1,
                      endDate: 1,
                      dailySchedules: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                travelPlan: { $arrayElemAt: ['$travelPlan', 0] },
              },
            },
          ],
          meta: [{ $count: 'total' }],
        },
      },
    ];

    const [result] = await this.feedModel.aggregate(pipeline).exec();

    return {
      data: result.data ?? [],
      total: result.meta?.[0]?.total ?? 0,
    };
  }

  /**
   * 썸네일 추출 헬퍼 (개선: 타입 안전성 강화)
   */
  private pickThumbnail(schedules: any[]): string | null {
    if (!Array.isArray(schedules) || schedules.length === 0) return null;

    const hasUrl = (s: any): boolean => typeof s?.imageUrl === 'string' && s.imageUrl.trim().length > 0;

    const isThumb = (s: any): boolean => s?.isThumbnail === true || s?.isThumbnail === 'true' || s?.isThumbnail === 1;

    // 우선순위 1: 썸네일로 지정된 이미지
    const thumb = schedules.find((s) => isThumb(s) && hasUrl(s));
    if (thumb) return thumb.imageUrl.trim();

    // 우선순위 2: 첫 번째 이미지
    const first = schedules.find((s) => hasUrl(s));
    return first ? first.imageUrl.trim() : null;
  }

  /**
   * 공통 Feed → ExtractedFeed 변환 (개선: 배치 처리)
   */
  async extractFeeds(rawFeeds: any[], userId?: string): Promise<ExtractedFeed[]> {
    if (!rawFeeds || rawFeeds.length === 0) return [];

    // 스크랩 정보를 한번에 조회
    const scrappedIds = userId
      ? await this.feedScrapService.getScrappedFeedIds(
          rawFeeds.map((f) => f._id.toString()),
          userId,
        )
      : new Set<string>();

    return rawFeeds.map((f: any) => ({
      feedId: f._id.toString(),
      travelPlanId: f.travelPlan?._id?.toString() ?? null,
      userId: f.userId,
      createdAt: f.createdAt,
      isPublic: f.isPublic,
      likeCount: f.likeCount || 0,
      title: f.travelPlan?.title ?? null,
      region: f.travelPlan?.region ?? null,
      startDate: f.travelPlan?.startDate ?? null,
      endDate: f.travelPlan?.endDate ?? null,
      thumbnailUrl: this.pickThumbnail(f.travelPlan?.dailySchedules || []),
      coverImage: f.coverImage ?? null,
      isScrapped: scrappedIds.has(f._id.toString()),
    }));
  }

  /**
   * 공개 피드 조회 (개선: 집계 파이프라인 활용)
   */
  async fetchPublicFeeds(pageNumber: number, userId?: string, sort?: any) {
    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    const { data, total } = await this.aggregateFeeds(criteria, pageNumber, sort);

    const extracted = await this.extractFeeds(data, userId);
    return {
      metadata: { total, currentPage: pageNumber, pageSize: this.pageSize },
      data: extracted,
    };
  }

  /**
   * 내 피드 조회 (개선: 옵션 처리 개선)
   */
  async fetchMyFeeds(pageNumber: number, userId: string, opts?: { isPublic?: boolean; sort?: any }) {
    const criteria: any = {
      userId,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    if (opts?.isPublic !== undefined) {
      criteria.isPublic = opts.isPublic;
    }

    const { data, total } = await this.aggregateFeeds(criteria, pageNumber, opts?.sort);

    const extracted = await this.extractFeeds(data, userId);
    return {
      metadata: { total, currentPage: pageNumber, pageSize: this.pageSize },
      data: extracted,
    };
  }

  /**
   * 내가 스크랩한 피드 조회 (개선: 페이지네이션 지원)
   */
  async fetchScraps(userId: string, pageNumber = 1) {
    const scrapLists = await this.feedScrapService.findScrapsByUserId(userId);
    const feedIds = scrapLists.map((s) => s.feedId);

    if (feedIds.length === 0) {
      return {
        metadata: { total: 0, currentPage: pageNumber, pageSize: this.pageSize },
        data: [],
      };
    }

    const criteria = {
      _id: { $in: feedIds },
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    const { data, total } = await this.aggregateFeeds(criteria, pageNumber);
    const extracted = await this.extractFeeds(data, userId);

    return {
      metadata: { total, currentPage: pageNumber, pageSize: this.pageSize },
      data: extracted,
    };
  }
}
