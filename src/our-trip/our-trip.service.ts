import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
   * 모든 공개 게시물을 조회 (페이지네이션)
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

    // 1) id 페이지만 받아옴
    const pageIds = await this.feedService.getPaginatedFeeds(pageNumber, pageSize, criteria);

    // 2) ids → 문서 조회 (populate 포함)
    const ids = (pageIds.feeds.data ?? []).map((d) => String((d as any)._id));
    const docs = await this.feedService.findByIds(ids);

    // 3) extractor로 슬림 변환
    const data = await this.feedExtractor.extractFeeds(docs, userId ?? undefined);

    // 4) 새 페이지 객체로 조립해서 반환 (원본 .data에 대입하지 않음)
    return {
      success: true,
      feeds: {
        metadata: pageIds.feeds.metadata,
        data,
      },
    };
  }

  // 특정 여행 일정 조회
  async fetchTravelPlan(feedId: string, travelPlanId: string) {
    await this.fetchOurFeed(feedId);
    const plan = await (await this.travelPlanModel.findById({ _id: travelPlanId })).populate('dailyPlans');

    if (!plan) {
      throw new NotFoundException('해당 여행 일정을 조회할 수 없습니다.');
    }

    return plan;
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

    const pageIds = await this.feedService.getPaginatedFeeds(pageNumber, pageSize, criteria, sort);
    const ids = (pageIds.feeds.data ?? []).map((d) => String((d as any)._id));
    const docs = await this.feedService.findByIds(ids);
    const data = await this.feedExtractor.extractFeeds(docs, userId ?? undefined);

    return { success: true, feeds: { metadata: pageIds.feeds.metadata, data } };
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

    const pageIds = await this.feedService.getPaginatedFeeds(pageNumber, pageSize, criteria, sort);
    const ids = (pageIds.feeds.data ?? []).map((d) => String((d as any)._id));
    const docs = await this.feedService.findByIds(ids);
    const data = await this.feedExtractor.extractFeeds(docs, userId ?? undefined);

    return { success: true, feeds: { metadata: pageIds.feeds.metadata, data } };
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
    const InputStartDate = new Date(startDate);
    const InputEndDate = new Date(endDate);
    if (InputStartDate > InputEndDate) {
      throw new BadRequestException('startDate는 endDate보다 이전이어야 합니다.');
    }

    const criteria = {
      isPublic: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    // 1) 일단 후보 feed id만 뽑기
    const all = await this.feedModel.find(criteria).select('_id').lean();
    const ids = all.map((d) => String(d._id));

    if (ids.length === 0) {
      return { success: true, feeds: { metadata: { totalCount: 0, pageNumber, pageSize }, data: [] } };
    }

    // 2) 실제 문서 로드 + populate
    const docs = await this.feedService.findByIds(ids);

    // 3) 날짜 필터 (populate된 상태에서 안전)
    const filtered = docs.filter((feed) => {
      const tp: any = (feed as any).travelPlan;
      if (!tp?.dailyPlans) return false;
      // 하루라도 범위 안에 들면 통과 (모두 들어와야 한다면 every로 바꿔)
      return tp.dailyPlans.some((dp: any) => {
        if (dp?.date && !isNaN(new Date(dp.date).getTime())) {
          const d = new Date(dp.date);
          return d >= InputStartDate && d <= InputEndDate;
        }
        return false;
      });
    });

    if (filtered.length === 0) {
      return { message: '게시물이 해당 날짜 사이에 존재하지 않습니다.' };
    }

    // 4) 페이지네이션: id 기반 페이지 구하고 → findByIds → extractFeeds
    const pageIds = await this.feedService.getPaginatedFeeds(pageNumber, pageSize, {
      _id: { $in: filtered.map((f) => f._id) },
    });
    const pageIdList = (pageIds.feeds.data ?? []).map((d) => String((d as any)._id));
    const pageDocs = await this.feedService.findByIds(pageIdList);
    const data = await this.feedExtractor.extractFeeds(pageDocs, userId ?? undefined);

    return { success: true, feeds: { metadata: pageIds.feeds.metadata, data } };
  }
}
