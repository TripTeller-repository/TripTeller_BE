import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailySchedule } from 'src/dailySchedule/dailySchedule.schema';
import Feed, { FeedDocument } from 'src/feed/feed.schema';
import { TravelPlan } from 'src/travelPlan/travelPlan.schema';
import { User } from 'src/user/user.schema';

export class FeedExtractor {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
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

  // 게시물 정렬 기준 설정하는 함수
  findFeedsByCriteria = async (criteria: any) => {
    return this.feedModel.find(criteria).exec();
  };

  // 원하는 형태로 리턴값 추출
  extractFeeds = async (feeds: FeedDocument[]) => {
    const extractFeed = async (feed: FeedDocument) => {
      const { likeCount, travelPlan, coverImage, isPublic } = feed;
      if (!travelPlan) return null;

      // 이 TravelPlan의 모든 DailySchedule을 가져옴
      const dailySchedules: DailySchedule[] = travelPlan.dailyPlans // => DailyPlan[]
        .map((dailyPlan) => dailyPlan.dailySchedules) // => DailySchedule[][]
        .flat(); // => DailySchedule[]

      let thumbnailUrl = null; // 썸네일 URL
      // DailySchedule 중 썸네일 이미지가 있고, isThumbnail이 true인 DailySchedule을 찾아 썸네일 URL을 추출
      const isThumbnailDailySchedule = dailySchedules.find((dailySchedule) => dailySchedule.isThumbnail);
      if (isThumbnailDailySchedule && isThumbnailDailySchedule.imageUrl) {
        thumbnailUrl = isThumbnailDailySchedule.imageUrl;
      }
      const startDate = travelPlan.startDate;
      const endDate = travelPlan.endDate;

      // isThumnbail이 true인 DailySchedule이 없을 경우
      if (!thumbnailUrl) {
        // imgUrl이 있는 아무 DailySchedule을 찾아 썸네일 URL을 추출
        const dailySchedule = dailySchedules.find((dailySchedule) => dailySchedule.imageUrl);
        thumbnailUrl = dailySchedule?.imageUrl ?? null;
      }

      return {
        feedId: feed._id, // 게시물 ID 값
        travelPlanId: feed.travelPlan['_id'], // travelPlan ID값
        userId: feed.userId, // 회원 ID 값
        createdAt: feed.createdAt, // 게시물 작성일
        isPublic, // 공개 여부
        likeCount, // 좋아요(스크랩) 개수
        title: travelPlan.title, // 제목
        startDate, // 시작일
        endDate, // 종료일
        thumbnailUrl, // TravelLog 이미지 중 썸네일 URL
        coverImage, // 게시물 커버 이미지 URL
      };
    };

    return (
      await Promise.all(
        feeds
          .filter((feed) => !feed.deletedAt) // deletedAt이 없는 경우 = 삭제되지 않은 경우
          .map(async (feed) => {
            // feed를 extractFeed로 만드는 함수
            const _extractedFeed = await extractFeed(feed);

            return _extractedFeed;
          }), // => ExtractedFeed[]
      )
    ).filter((feed) => feed !== null); // null인 경우는 제외
  };
}
