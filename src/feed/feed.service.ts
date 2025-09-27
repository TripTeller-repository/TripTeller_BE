import { Injectable, OnModuleInit, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedDocument } from '@feed/feed.schema';
import { Logger } from 'winston';
import { TravelPlan } from '@travel-plan/travel-plan.schema';
import { FeedExtractor } from '@feed/feed-extractor';
// import { ExtractedFeed } from './dto/response/extracted-feed.dto';
import { FeedScrapService } from '@common/services/feed-scrap.service';

@Injectable()
export class FeedService implements OnModuleInit {
  constructor(
    private readonly feedExtractor: FeedExtractor,
    private readonly feedScrapService: FeedScrapService,
    @InjectModel('Feed') private readonly feedModel: Model<FeedDocument>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * 모듈 초기화 시 피드 모델의 인덱스를 동기화
   * @returns {Promise<void>} 동기화 결과
   */
  async onModuleInit() {
    try {
      await this.feedModel.syncIndexes();
      this.logger.info('▶▶▶ feed indexes created successfully');
    } catch (error) {
      this.logger.error('Error creating indexes', error);
    }
  }

  /**
   * Feed ID로 피드를 조회
   * @param {string} feedId - 조회할 피드의 I
   * @returns {Promise<FeedDocument>} 피드 문서
   * @throws {NotFoundException} 피드를 찾을 수 없는 경우
   */
  async findById(feedId: string): Promise<FeedDocument> {
    const feed = await this.feedModel.findById(feedId).exec();
    if (!feed) throw new NotFoundException('Feed not found');
    return feed;
  }

  /**
   * 여러 Feed ID로 피드를 조회
   * @param {string[]} feedIds - 조회할 피드 ID 목록
   * @returns {Promise<FeedDocument[]>} 피드 목록
   */
  async findByIds(feedIds: string[]): Promise<FeedDocument[]> {
    if (!feedIds || feedIds.length === 0) return [];

    const feeds = await this.feedModel
      .find({ _id: { $in: feedIds } })
      .populate({
        path: 'travelPlan',
        select: 'title region startDate endDate dailySchedules',
        populate: {
          path: 'dailySchedules',
          select: 'imageUrl isThumbnail',
        },
      })
      .lean()
      .exec();

    return feeds as any;
  }

  /**
   * Feed의 travelPlan을 조회
   * @param {string} feedId - 피드의 ID
   * @returns {Promise<TravelPlan | null>} 해당 피드의 여행 계획
   * @throws {NotFoundException} 피드를 찾을 수 없는 경우
   */
  async getTravelPlanForFeed(feedId: string): Promise<TravelPlan | null> {
    const feed = await this.findById(feedId);
    if (!feed.travelPlan) return null;
    return this.travelPlanModel.findById(feed.travelPlan).exec();
  }

  /**
   * 피드 작성자가 맞는지 확인
   * @param {string} feedId - 피드의 ID
   * @param {string} userId - 사용자의 ID
   * @returns {Promise<void>} 작성자 확인 결과
   * @throws {NotFoundException} 작성자 불일치 시 예외 발생
   */
  async checkFeedAuthor(feedId: string, userId: string): Promise<void> {
    const feed = await this.findById(feedId);
    if (feed.userId !== userId) {
      throw new NotFoundException('게시물 작성자만 접근할 수 있습니다.');
    }
  }

  /**
   * 페이지네이션 및 정렬을 적용하여 피드를 조회
   * @param {number} pageNumber - 페이지 번호 (기본값 1)
   * @param {number} pageSize - 페이지 크기 (기본값 9)
   * @param {any} criteria - 필터 조건
   * @param {any} sort - 정렬 기준
   * @returns {Promise<any>} 페이지네이션된 피드 목록과 메타데이터
   */
  async getPaginatedFeeds(pageNumber = 1, pageSize = 9, criteria: any = {}, sort: any = { createdAt: -1 }) {
    const skip = (pageNumber - 1) * pageSize;

    const pipeline = [
      { $match: criteria },
      {
        $facet: {
          metadata: [{ $count: 'totalCount' }],
          data: [{ $sort: sort }, { $skip: skip }, { $limit: pageSize }, { $project: { _id: 1 } }],
        },
      },
    ];

    const [result] = await this.feedModel.aggregate(pipeline).exec();
    const totalCount = result.metadata[0]?.totalCount ?? 0;

    return {
      success: true,
      feeds: {
        metadata: { totalCount, pageNumber, pageSize },
        data: result.data,
      },
    };
  }

  /**
   * 특정 기준에 맞는 피드를 조회
   * @param {any} criteria - 조회 조건
   * @returns {Promise<FeedDocument[]>} 조건에 맞는 피드 목록
   */
  async findFeedsByCriteria(criteria: any): Promise<FeedDocument[]> {
    return this.feedModel.find(criteria).exec();
  }

  /**
   * 여행 계획 ID로 여행 계획 정보를 조회
   * @param {string} travelPlanId - 여행 계획 ID
   * @returns {Promise<TravelPlan | null>} 해당 여행 계획
   * @throws {NotFoundException} 여행 계획을 찾을 수 없는 경우
   */
  async getTravelPlan(travelPlanId: string): Promise<TravelPlan | null> {
    const travelPlan = await this.travelPlanModel.findById(travelPlanId);
    if (!travelPlan) {
      throw new NotFoundException('여행 계획을 찾을 수 없습니다.');
    }
    return travelPlan;
  }

  /**
   * 피드의 좋아요 수를 1 증가
   * @param {string} feedId - 좋아요 수를 증가시킬 피드의 ID
   */
  async incrementLikeCount(feedId: string): Promise<void> {
    await this.feedModel.updateOne({ _id: feedId }, { $inc: { likeCount: 1 } });
  }

  /**
   * 피드의 좋아요 수를 1 감소
   * @param {string} feedId - 좋아요 수를 감소시킬 피드의 ID
   */
  async decrementLikeCount(feedId: string): Promise<void> {
    await this.feedModel.updateOne({ _id: feedId }, { $inc: { likeCount: -1 } });
  }

  // /**
  //  * 스크랩한 게시물 목록을 조회 (공통 서비스 활용)
  //  * @param {string} userId - 사용자의 ID
  //  * @returns {Promise<ExtractedFeed[]>} 사용자가 스크랩한 게시물 목록
  //  */
  // async fetchScraps(userId: string): Promise<ExtractedFeed[]> {
  //   // 공통 서비스에서 스크랩 목록 조회
  //   const scrapLists = await this.feedScrapService.findScrapsByUserId(userId);

  //   // 스크랩된 피드 ID 목록을 추출
  //   const feedIds = scrapLists.map((scrap) => scrap.feedId);

  //   // 여러 피드 데이터를 조회
  //   const myFeeds = await this.findByIds(feedIds);

  //   // FeedExtractor를 통해 피드를 추출
  //   return this.feedExtractor.extractFeeds(myFeeds, userId);
  // }
}
