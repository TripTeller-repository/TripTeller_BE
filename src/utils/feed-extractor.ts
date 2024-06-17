import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailySchedule } from 'src/daily-schedule/daily-schedule.schema';
import Feed, { FeedDocument } from 'src/feed/feed.schema';
import Scrap from 'src/scrap/scrap.schema';
import { RegionName } from 'src/travel-plan/region-name.enum';
import { TravelPlan } from 'src/travel-plan/travel-plan.schema';
import { User } from 'src/user/user.schema';

export class FeedExtractor {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
    @InjectModel('Scrap') private readonly scrapModel: Model<Scrap>,
  ) {}

  // 로그인한 회원과 글 작성자가 일치하는지 판별하는 함수
  checkUser = async (feedId: string, userId: string) => {
    const feed = await this.feedModel.findOne({ _id: feedId }).exec();
    if (feed.userId !== userId) {
      throw new NotFoundException('로그인한 회원과 게시물 작성자가 일치하지 않습니다.');
    }
  };

  // 회원 ID로 작성자 검색하기
  getUserByUserId = async (userId: string) => {
    const user = await this.userModel.findOne({ _id: userId }).exec();
    return user;
  };

  // 회원 ID로 게시글 검색하기
  findFeedsByUserId = async (userId: string): Promise<FeedDocument[]> => {
    return await this.feedModel
      .find({
        userId,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      })
      .exec();
  };

  // 페이지네이션 설정하는 함수
  getFeedPaginated = async (pageNumber: number = 1, pageSize: number = 9, criteria: any = {}, sort: any = {}) => {
    const skip = (pageNumber - 1) * pageSize;

    try {
      // 기본 파이프라인 설정
      const pipeline: any[] = [{ $match: criteria }];

      // sort가 제공되었을 경우 정렬 단계 추가
      if (Object.keys(sort).length) {
        pipeline.push({ $sort: sort });
      }

      // 페이지네이션 설정
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

      const result = {
        success: true,
        feeds: {
          metadata: { totalCount, pageNumber, pageSize },
          data: feeds[0].data,
        },
      };

      return result;
    } catch (error) {
      throw new Error('페이지네이션 작업이 실패하였습니다.');
    }
  };

  // 게시물 정렬 기준 설정하는 함수
  findFeedsByCriteria = async (criteria: any) => {
    return this.feedModel.find(criteria).exec();
  };

  // 스크랩 여부 확인 함수 추가
  // 스크랩 되어 있으면 true, 안 되어 있으면 false
  isScrappedByUser = async (feedId: string, userId?: string) => {
    if (!userId) return false; // 로그인 상태가 아니면 false 반환
    const scrap = await this.scrapModel.findOne({ feedId, userId }).exec();
    return scrap ? true : false;
  };

  // 원하는 형태로 리턴값 추출
  extractFeeds = async (feeds: FeedDocument[], userId?: string) => {
    const extractFeed = async (feed: FeedDocument) => {
      const { likeCount, coverImage, isPublic } = feed;

      const travelPlanId = feed.travelPlan;
      const travelPlan = await this.travelPlanModel.findById(travelPlanId);

      // if (!travelPlan) return null;
      if (!travelPlan) {
        console.log(`Feed ${feed._id} has no associated travel plan.`);
        return null;
      }

      // 이 TravelPlan의 모든 DailySchedule을 가져옴
      const dailySchedules: DailySchedule[] = travelPlan['dailyPlans'] // => DailyPlan[]
        .map((dailyPlan) => dailyPlan.dailySchedules) // => DailySchedule[][]
        .flat(); // => DailySchedule[]

      let thumbnailUrl = null; // 썸네일 URL
      // DailySchedule 중 썸네일 이미지가 있고, isThumbnail이 true인 DailySchedule을 찾아 썸네일 URL을 추출
      const isThumbnailDailySchedule = dailySchedules.find((dailySchedule) => dailySchedule.isThumbnail);
      if (isThumbnailDailySchedule && isThumbnailDailySchedule.imageUrl) {
        thumbnailUrl = isThumbnailDailySchedule.imageUrl;
      }
      const startDate = travelPlan['startDate'];
      const endDate = travelPlan['endDate'];

      // isThumnbail이 true인 DailySchedule이 없을 경우
      // imgUrl이 있는 아무 DailySchedule을 찾아 썸네일 URL을 추출
      const dailySchedule = dailySchedules.find((dailySchedule) => dailySchedule.imageUrl);
      thumbnailUrl = dailySchedule?.imageUrl ?? null;

      // 해당 게시물 스크랩 여부 확인
      const isScrapped = await this.isScrappedByUser(feed._id.toString(), userId || null);

      return {
        feedId: feed._id, // 게시물 ID 값
        travelPlanId: feed.travelPlan['_id'], // travelPlan ID값
        userId: feed.userId, // 회원 ID 값
        createdAt: feed.createdAt, // 게시물 작성일
        isPublic, // 공개 여부
        likeCount, // 좋아요(스크랩) 개수
        title: travelPlan['title'], // 제목
        region: travelPlan['region'] as RegionName, // 지역
        startDate, // 시작일
        endDate, // 종료일
        thumbnailUrl, // TravelLog 이미지 중 썸네일 URL
        coverImage, // 게시물 커버 이미지 URL
        isScrapped, // 해당 게시물 스크랩 여부
      };
    };

    return (
      await Promise.all(
        feeds.map(async (feed) => {
          const _extractedFeed = await extractFeed(feed);

          // 필터링 된 게시물 확인
          if (_extractedFeed === null) {
            console.log(`Feed ${feed._id} was filtered out.`);
          }
          return _extractedFeed;
        }), // => ExtractedFeed[]
      )
    ).filter((feed) => feed !== null); // null인 경우는 제외
  };
}
