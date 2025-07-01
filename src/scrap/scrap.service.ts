import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Scrap from './scrap.schema';
import { CreateScrapDto } from './dto/create-scrap.dto';
import { FeedScrapService } from '@common/services/feed-scrap.service';

@Injectable()
export class ScrapService {
  constructor(
    @InjectModel('Scrap') private readonly scrapModel: Model<Scrap>,
    private readonly feedScrapService: FeedScrapService,
  ) {}

  /**
   * 사용자가 게시물을 스크랩하는 기능
   * @param {CreateScrapDto} createScrapDto - 스크랩할 피드 정보
   * @param {string} userId - 사용자의 ID
   * @returns {Promise<Scrap>} 생성된 스크랩 객체
   * @throws {NotFoundException} 게시물이 존재하지 않는 경우
   * @throws {Error} 이미 스크랩된 게시물이거나 게시물이 공개되지 않은 경우
   */
  async createScrap(createScrapDto: CreateScrapDto, userId: string) {
    return this.feedScrapService.createScrap(createScrapDto, userId);
  }

  /**
   * 사용자가 해당 피드를 스크랩했는지 확인
   * @param {string} feedId - 확인할 피드의 ID
   * @param {string} userId - 사용자의 ID
   * @returns {Promise<boolean>} 스크랩 여부 (true/false)
   */
  async isScrapped(feedId: string, userId: string): Promise<boolean> {
    const scrap = await this.scrapModel.findOne({ feedId, userId }).exec();
    return !!scrap;
  }

  /**
   * 사용자가 스크랩한 게시물 목록을 조회
   * @param {string} userId - 사용자의 ID
   * @returns {Promise<Scrap[]>} 사용자가 스크랩한 게시물 목록
   */
  async findScrapsByUserId(userId: string) {
    return this.scrapModel.find({ userId }).exec();
  }

  /**
   * 스크랩 취소
   * @param {string} feedId - 취소할 게시물의 ID
   * @param {string} userId - 사용자의 ID
   * @returns {Promise<{message: string}>} 취소된 스크랩에 대한 메시지
   */
  async removeScrap(feedId: string, userId: string) {
    return this.feedScrapService.removeScrap(feedId, userId);
  }
}
