import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Feed from '@feed/feed.schema';
import { User } from '@user/schemas/user.schema';
import { FeedSearchStrategy } from './feed-search.strategy';
import { SearchParams } from '../dto/search-params.dto';
import { FeedSearchUtil } from '../utils/feed-search.util';

/**
 * 작성자(닉네임) 기반 피드 검색
 * @description 닉네임으로 사용자를 찾고 해당 사용자의 피드를 반환
 */
@Injectable()
export class SearchByAuthorStrategy implements FeedSearchStrategy {
  constructor(
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  isApplicable(params: SearchParams): boolean {
    return !!params.author;
  }

  /**
   * 작성자 닉네임 기반 검색 수행
   * @param params 검색 파라미터
   * @returns 해당 사용자의 피드 배열
   * @throws NotFoundException - 사용자가 존재하지 않는 경우
   * @throws InternalServerErrorException - DB 조회 실패 등
   */
  async search(params: SearchParams): Promise<Feed[]> {
    try {
      const regex = FeedSearchUtil.createRegex(params.author);
      const user = await this.userModel.findOne({ nickname: regex });
      if (!user) {
        throw new NotFoundException('해당 닉네임을 가진 사용자를 찾을 수 없습니다');
      }
      return this.feedModel.find({ userId: user._id }).populate('travelPlan').exec();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('작성자 검색 중 오류 발생');
    }
  }
}
