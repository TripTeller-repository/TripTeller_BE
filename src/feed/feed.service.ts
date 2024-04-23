import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FeedDocument } from './feed.schema';
import { CreateFeedDto } from './dto/createFeed.dto';
import { Model } from 'mongoose';
import { UpdateFeedDto } from './dto/updateFeed.dto';
import { FeedExtractor } from 'src/utils/feedExtractor';
import { createFileUnixName, createSignedUrl } from 'src/utils/file.util';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedExtractor: FeedExtractor,
    @InjectModel('Feed') private readonly feedModel: Model<FeedDocument>,
  ) {}

  ///////////////////////////////////
  /////// feed (비공개 게시물) ///////
  ///////////////////////////////////

  // 게시물의 커버 이미지 url만 불러오기
  async getMyFeedImgUrl(feedId: string, userId: string) {
    // 해당 게시물 찾기
    const feed = await this.feedModel.findById(feedId).exec();

    // 해당 회원 일치 여부 확인
    if (userId !== feed.userId) {
      throw new UnauthorizedException('해당 회원의 게시물이 아닙니다.');
    }

    // 해당 게시물이 존재하는지 확인
    if (!feed) {
      throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
    }

    // coverImage 필드 가져오기
    const coverImage = feed.coverImage;

    // 커버 이미지가 존재하는지 확인
    if (!feed) {
      throw new NotFoundException('해당 게시물의 커버 이미지가 존재하지 않습니다.');
    }

    return { coverImage };
  }

  // 게시물 작성
  async createFeed(createFeedDto: CreateFeedDto, userId: string) {
    createFeedDto.userId = userId;
    const createdFeed = await this.feedModel.create(createFeedDto);
    return createdFeed.save();
  }

  // 게시물 수정
  async updateFeed(feedId: string, userId: string, updateFeedDto: UpdateFeedDto) {
    const feed = await this.feedModel.findById({ _id: feedId }).exec();
    if (!feed) {
      throw new NotFoundException('해당 게시물을 찾을 수 없습니다.');
    }
    if (feed.userId !== userId) {
      throw new NotFoundException('게시물 작성자만 수정이 가능합니다.');
    }
    const updatedFeed = await this.feedModel.findByIdAndUpdate({ _id: feedId }, updateFeedDto, {
      runValidators: true,
      new: true,
    });
    if (!updatedFeed) {
      throw new NotFoundException('게시물 수정 중 오류가 발생하였습니다.');
    } else {
      return { message: '해당 게시물이 수정되었습니다.' };
    }
  }

  // 게시물 삭제
  async deleteFeed(feedId: string, userId: string) {
    const feed = await this.feedModel.findById(feedId).exec();
    if (!feed) {
      throw new NotFoundException('해당 게시물을 찾을 수 없습니다.');
    }
    if (feed.userId !== userId) {
      throw new NotFoundException('게시물 작성자만 삭제가 가능합니다.');
    }
    feed.deletedAt = new Date();
    feed.save();
    return { message: '해당 게시물이 삭제되었습니다.' };
  }

  // 본인이 작성한 모든 게시물 조회
  async getAllFeeds(userId: string) {
    const feeds = await this.feedExtractor.findFeedsByUserId(userId);
    return this.feedExtractor.extractFeeds(feeds);
  }

  // 본인이 작성한 모든 게시물 조회 (페이지네이션)
  async getAllFeedsPagination(userId: string, pageNumber: number = 1) {
    const pageSize = 9; // 한 페이지당 최대 게시물 수
    const skip = (pageNumber - 1) * pageSize;
    const criteria = {
      userId,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    try {
      const feeds = await this.feedModel.find(criteria).sort({ createdAt: -1 }).skip(skip).limit(pageSize).exec();
      return this.feedExtractor.extractFeeds(feeds);
    } catch (error) {
      throw error;
    }
  }

  // 본인이 작성한 특정 게시물을 게시물 ID로 조회
  async getMyFeedByFeedId(feedId: string, userId: string) {
    const feed = await this.feedModel.findById(feedId).exec();
    if (!feed) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    if (feed.userId !== userId) {
      throw new NotFoundException('게시물 작성자만 조회가 가능합니다.');
    }
    const feeds = await this.feedModel
      .find({
        _id: feedId,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      })
      .exec();
    return this.feedExtractor.extractFeeds(feeds);
  }

  // 본인이 작성한 모든 게시물 중 "공개" 게시물 조회
  async getMyPublicFeed(userId: string) {
    const myFeeds = await this.getAllFeeds(userId);
    const publicFeeds = myFeeds.filter((feed) => feed.isPublic === true);
    return publicFeeds;
  }

  // 본인이 작성한 모든 게시물 중 "비공개" 게시물 조회
  async getMyPrivateFeed(userId: string) {
    const myFeeds = await this.getAllFeeds(userId);
    const privateFeeds = myFeeds.filter((feed) => feed.isPublic === false);
    return privateFeeds;
  }

  // 본인이 쓴 게시물 정렬 : 최신순
  async sortPrivateByRecent(userId: string) {
    const feeds = await this.feedExtractor.findFeedsByUserId(userId);
    const sortedFeeds = feeds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return this.feedExtractor.extractFeeds(sortedFeeds);
  }

  // 본인이 쓴 게시물 정렬 : 인기순
  // feed 스키마의 likeCount 필드의 개수가 많은 것부터 오름차순 정렬
  async sortPrivateByLikeCount(userId: string) {
    const feeds = await this.feedExtractor.findFeedsByUserId(userId);
    const sortedFeeds = feeds.sort((a, b) => b.likeCount - a.likeCount);
    return this.feedExtractor.extractFeeds(sortedFeeds);
  }

  // 본인이 쓴 게시물 기간별 조회 (공개, 비공개 다)
  async getFeedsByDate(userId: string, startDate: string, endDate: string) {
    const InputStartDate: Date = new Date(startDate);
    const InputEndDate: Date = new Date(endDate);

    if (InputStartDate > InputEndDate) {
      throw new BadRequestException('startDate는 endDate보다 이전이어야 합니다.');
    }
    try {
      // travelPlan의 startDate가 InputStartDate보다 크고
      // travelPlan의 endDate가 InputEndDate보다 작음

      const _filteredFeeds = await this.feedModel.find({ userId }).exec();

      const filteredFeeds = _filteredFeeds.filter((feed) => {
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

  // AWS S3 프로필 이미지 Signed URL 불러오기
  async getCoverImageSignedUrl(fileName: string, userId: string) {
    const fileNameInBucket = createFileUnixName(fileName, userId);
    const filePathName = `cover-image/${fileNameInBucket}`;
    return await createSignedUrl(filePathName);
  }

  // 커버 이미지 변경하기
  async updateCoverImageById(feedId: string, userId: string, imageUrl: string) {
    const updatedFeed = await this.feedModel
      .findOneAndUpdate({ _id: feedId, userId }, { coverImage: imageUrl }, { runValidators: true, new: true })
      .exec();
    return updatedFeed;
  }
}
