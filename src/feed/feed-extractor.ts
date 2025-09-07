import { FeedScrapService } from '@common/services/feed-scrap.service';
import { DailySchedule } from '@daily-schedule/daily-schedule.schema';
import { ExtractedFeed } from '@feed/dto/response/extracted-feed.dto';
import { FeedDocument } from '@feed/feed.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegionName } from '@travel-plan/region-name.enum';
import { TravelPlan } from '@travel-plan/travel-plan.schema';
import { Model, ObjectId } from 'mongoose';

@Injectable()
export class FeedExtractor {
  constructor(
    private readonly feedScrapService: FeedScrapService,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
  ) {}

  private extractThumbnailUrl(dailySchedules: DailySchedule[]): string | null {
    // 배열인지 확인용 로그
    // console.log('[thumb] schedules:', Array.isArray(dailySchedules) ? dailySchedules.length : 'not array');

    if (!Array.isArray(dailySchedules) || dailySchedules.length === 0) return null;

    // 문자열이거나 공백인 url 제거, truthy/boolean 다양성 방어
    const hasUrl = (s: any) => typeof s?.imageUrl === 'string' && s.imageUrl.trim().length > 0;
    const isThumb = (s: any) => s?.isThumbnail === true || s?.isThumbnail === 'true' || s?.isThumbnail === 1;

    // 1) 썸네일 지정 먼저
    const thumb = dailySchedules.find((s: any) => isThumb(s) && hasUrl(s));
    if (thumb) {
      // console.log('[thumb] picked by isThumbnail:', thumb.imageUrl);
      return thumb.imageUrl.trim();
    }

    // 2) 썸네일 없으면 첫 이미지
    const firstWithImage = dailySchedules.find((s: any) => hasUrl(s));
    if (firstWithImage) {
      // console.log('[thumb] picked first image:', firstWithImage.imageUrl);
      return firstWithImage.imageUrl.trim();
    }

    // console.log('[thumb] no image found');
    return null;
  }

  /**
   * 피드를 가공하여 원하는 형태로 추출
   * @param {FeedDocument[]} feeds - 추출할 피드 목록
   * @param {string} [userId] - 사용자의 ID (스크랩 여부 확인을 위해 사용)
   * @returns {Promise<ExtractedFeed[]>} 가공된 피드 목록
   */
  async extractFeeds(feeds: FeedDocument[], userId?: string): Promise<ExtractedFeed[]> {
    let scrappedFeedIds: Set<string> = new Set();
    if (userId) {
      const feedIds = feeds.map((feed) => feed._id.toString());
      scrappedFeedIds = await this.feedScrapService.getScrappedFeedIds(feedIds, userId);
    }

    const extractFeed = async (feed: FeedDocument): Promise<ExtractedFeed | null> => {
      try {
        const { likeCount, coverImage, isPublic } = feed;

        // FeedService를 통해 피드 조회
        if (!feed.travelPlan) {
          // console.log('=======[ feed.travelPlan is null ]=======');
          return null;
        }

        // === 교체 시작 ===
        let travelPlan: TravelPlan | null = null;

        // feed.travelPlan이 뭐로 오든, _id만 뽑아냄
        const tpAny = feed.travelPlan as any;
        const tpId =
          typeof tpAny === 'string'
            ? tpAny
            : tpAny?._id
              ? String(tpAny._id) // 얕은 객체(plain/lean) 케이스
              : (tpAny as ObjectId)?.toString?.(); // ObjectId 케이스

        if (!tpId) return null; // 안전장치

        travelPlan = await this.travelPlanModel.findById(tpId).populate([
          {
            path: 'dailyPlans',
            model: 'DailyPlan',
            select: 'date dateType dailySchedules',
            populate: {
              path: 'dailySchedules',
              model: 'DailySchedule',
              select: 'imageUrl isThumbnail',
            },
          },
          {
            path: 'dailySchedules',
            model: 'DailySchedule',
            select: 'imageUrl isThumbnail',
          },
        ]);

        if (!travelPlan) {
          // console.log('======= travelPlan을 찾을 수 없음');
          return null;
        }

        console.log(`========= travelPlan`, travelPlan);
        console.log(`========= travelPlan.dailyPlans `, travelPlan.dailyPlans);
        console.log(`========= travelPlan['dailyPlans']`, travelPlan['dailyPlans']);

        const allDailySchedules: DailySchedule[] = [];

        // 1. TravelPlan의 직접 dailySchedules
        if (Array.isArray(travelPlan.dailySchedules) && travelPlan.dailySchedules.length > 0) {
          // DailySchedule 문서만 push (혹시 모를 ObjectId 섞임 방지)
          allDailySchedules.push(
            ...travelPlan.dailySchedules.filter((s: any) => s && typeof s === 'object' && 'imageUrl' in s),
          );
        }

        // 2. DailyPlan들의 dailySchedules
        if (Array.isArray(travelPlan.dailyPlans) && travelPlan.dailyPlans.length > 0) {
          for (const dp of travelPlan.dailyPlans as any[]) {
            const arr = Array.isArray(dp?.dailySchedules) ? dp.dailySchedules : [];
            allDailySchedules.push(...arr.filter((s: any) => s && typeof s === 'object' && 'imageUrl' in s));
          }
        }
        console.log('=============allDailySchedules', allDailySchedules);
        let thumbnailUrl = this.extractThumbnailUrl(allDailySchedules);

        // 썸네일을 찾지 못한 경우
        if (!thumbnailUrl) {
          thumbnailUrl = null;
        }

        // Scrap 상태 확인
        const isScrapped = scrappedFeedIds.has(feed._id.toString());

        return {
          feedId: feed._id.toString(),
          travelPlanId: travelPlan['_id'].toString(),
          // travelPlan,
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
        return null;
      }
    };

    const results = await Promise.all(feeds.map(extractFeed));
    return results.filter((f): f is ExtractedFeed => f !== null);
  }
}
