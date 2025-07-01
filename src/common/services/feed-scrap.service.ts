import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedDocument } from '@feed/feed.schema';
import Scrap from '@scrap/scrap.schema';
import { CreateScrapDto } from '@scrap/dto/create-scrap.dto';

@Injectable()
export class FeedScrapService {
  constructor(
    @InjectModel('Feed') private readonly feedModel: Model<FeedDocument>,
    @InjectModel('Scrap') private readonly scrapModel: Model<Scrap>,
  ) {}

  /**
   * 스크랩 생성 (기존 ScrapService.createScrap 로직)
   */
  async createScrap(createScrapDto: CreateScrapDto, userId: string) {
    const feed = await this.feedModel.findById(createScrapDto.feedId).exec();

    if (!feed) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    if (!feed.isPublic) {
      throw new Error('이 게시물은 공개되지 않았습니다.');
    }

    if (feed.userId === userId) {
      throw new Error('자신이 작성한 게시물은 스크랩할 수 없습니다.');
    }

    const existingScrap = await this.scrapModel.findOne({ userId, feedId: createScrapDto.feedId });
    if (existingScrap) {
      throw new Error('이미 스크랩한 게시물입니다.');
    }

    // 좋아요 수 증가
    await this.feedModel.updateOne({ _id: createScrapDto.feedId }, { $inc: { likeCount: 1 } });

    // 스크랩 생성
    const createdScrap = await this.scrapModel.create({ userId, feedId: createScrapDto.feedId });
    return createdScrap;
  }

  /**
   * 스크랩 취소 (기존 ScrapService.removeScrap 로직)
   */
  async removeScrap(feedId: string, userId: string) {
    const feed = await this.feedModel.findById(feedId).exec();
    if (!feed) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    const deletedScrap = await this.scrapModel.findOneAndDelete({ feedId, userId });
    if (!deletedScrap) {
      throw new NotFoundException('스크랩을 찾을 수 없습니다.');
    }

    // 좋아요 수 감소
    await this.feedModel.updateOne({ _id: feedId }, { $inc: { likeCount: -1 } });

    return { message: '스크랩이 취소되었습니다.' };
  }

  /**
   * 사용자의 스크랩 목록 조회 (기존 ScrapService.findScrapsByUserId 로직)
   */
  async findScrapsByUserId(userId: string) {
    return this.scrapModel.find({ userId }).exec();
  }

  /**
   * 스크랩 여부 확인 (FeedExtractor에서 사용)
   * @param {string} feedId - 피드 ID
   * @param {string} userId - 사용자 ID
   * @returns {Promise<boolean>} 스크랩 여부
   */
  async isScrapped(feedId: string, userId: string): Promise<boolean> {
    const scrap = await this.scrapModel.findOne({ feedId, userId }).exec();
    return !!scrap;
  }
}
