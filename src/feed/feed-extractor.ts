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
    if (!dailySchedules?.length) return null;
    const thumbnail = dailySchedules.find((s) => s.isThumbnail && s.imageUrl);
    return thumbnail?.imageUrl ?? dailySchedules.find((s) => s.imageUrl)?.imageUrl ?? null;
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

        // travelPlan 조회
        let travelPlan: TravelPlan | null = null;

        // populate된 객체인지 확인
        if (typeof feed.travelPlan === 'object') {
          travelPlan = feed.travelPlan;
          // console.log('======= 이미 populate된 travelPlan 사용');
        } else {
          // objectId인 경우 직접 조회
          travelPlan = await this.travelPlanModel.findById((feed.travelPlan as ObjectId).toString());
          // console.log('======= DB에서 travelPlan 조회');
        }
        if (!travelPlan) {
          // console.log('======= travelPlan을 찾을 수 없음');
          return null;
        }

        // thumbnail URL 추출
        const dailySchedules = travelPlan['dailyPlans']?.flatMap((dp) => dp.dailySchedules) || [];
        const thumbnailUrl = this.extractThumbnailUrl(dailySchedules);

        // Scrap 상태 확인
        const isScrapped = scrappedFeedIds.has(feed._id.toString());

        return {
          feedId: feed._id.toString(),
          travelPlanId: travelPlan['_id'].toString(),
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
        return null;
      }
    };

    const results = await Promise.all(feeds.map(extractFeed));
    return results.filter((f): f is ExtractedFeed => f !== null);
  }
}
