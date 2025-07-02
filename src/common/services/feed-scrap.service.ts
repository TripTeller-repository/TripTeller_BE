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
   * 피드를 스크랩
   *
   * @param {CreateScrapDto} createScrapDto - 스크랩 생성 요청 DTO
   * @param {string} userId - 스크랩을 요청한 사용자 ID
   * @throws {NotFoundException} 피드가 존재하지 않을 경우
   * @throws {Error} 비공개 피드거나 본인 피드일 경우 또는 이미 스크랩한 경우
   * @returns {Promise<Scrap>} 생성된 스크랩 문서
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
   * 피드의 스크랩을 취소
   *
   * @param {string} feedId - 스크랩을 취소할 피드 ID
   * @param {string} userId - 요청한 사용자 ID
   * @throws {NotFoundException} 피드 또는 스크랩이 존재하지 않을 경우
   * @returns {Promise<{ message: string }>} 성공 메시지
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
   * 사용자의 모든 스크랩을 조회
   *
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Scrap[]>} 사용자 스크랩 목록
   */
  async findScrapsByUserId(userId: string) {
    return this.scrapModel.find({ userId }).exec();
  }

  /**
   * 사용자가 특정 피드를 스크랩했는지 여부를 확인
   *
   * @param {string} feedId - 피드 ID
   * @param {string} userId - 사용자 ID
   * @returns {Promise<boolean>} 스크랩 여부
   */
  async isScrapped(feedId: string, userId: string): Promise<boolean> {
    const scrap = await this.scrapModel.findOne({ feedId, userId }).exec();
    return !!scrap;
  }
}
