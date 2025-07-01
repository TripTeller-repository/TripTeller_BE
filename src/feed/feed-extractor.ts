import { FeedScrapService } from '@common/services/feed-scrap.service';
import { DailySchedule } from '@daily-schedule/daily-schedule.schema';
import { ExtractedFeed } from '@feed/dto/response/extracted-feed.dto';
import { FeedDocument } from '@feed/feed.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegionName } from '@travel-plan/region-name.enum';
import { TravelPlan } from '@travel-plan/travel-plan.schema';
import { Model } from 'mongoose';

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
    const extractFeed = async (feed: FeedDocument): Promise<ExtractedFeed | null> => {
      try {
        const { likeCount, coverImage, isPublic } = feed;

        // FeedService를 통해 피드 조회
        const travelPlan = await this.travelPlanModel.findById(feed.travelPlan.toString());
        if (!travelPlan) return null;

        // thumbnail URL 추출
        const dailySchedules = travelPlan['dailyPlans']?.flatMap((dp) => dp.dailySchedules) || [];
        const thumbnailUrl = this.extractThumbnailUrl(dailySchedules);

        // Scrap 상태 확인
        const isScrapped = await this.feedScrapService.isScrapped(feed._id.toString(), userId);

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
