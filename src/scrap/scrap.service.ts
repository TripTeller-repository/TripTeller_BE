import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Feed from 'src/feed/feed.schema';
import Scrap from './scrap.schema';
import { FeedExtractor } from '../utils/feed-extractor';

@Injectable()
export class ScrapService {
  constructor(
    private readonly feedExtractor: FeedExtractor,
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('Scrap') private readonly scrapModel: Model<Scrap>,
  ) {}
  ////// 스크랩 등록 //////
  async createScrap(createScrapDto, userId: string) {
    // 해당 게시물 찾기
    const feed = await this.feedModel.findById(createScrapDto.feedId);

    if (!feed) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    // 해당 게시물이 공개된 게시물인지 확인
    if (!feed.isPublic) {
      throw new Error('이 게시물은 공개되지 않았습니다.');
    }
    console.log('증가했는지확인 - 이전', feed.likeCount);
    // 해당 게시물의 좋아요 숫자를 1 증가 (update query)
    await this.feedModel.updateOne({ _id: feed._id }, { $inc: { likeCount: 1 } });
    console.log('증가했는지확인 - 이후', feed.likeCount);
    // 게시물 작성자가 본인인지 확인
    if (feed.userId === userId) {
      throw new Error('자신이 작성한 게시물은 스크랩할 수 없습니다.');
    }

    // 이미 스크랩한 게시물인지 확인
    const existingScrap = await this.scrapModel.findOne({ userId, feedId: createScrapDto.feedId });
    if (existingScrap) {
      throw new Error('이미 스크랩한 게시물입니다.');
    }

    const createdScrap = await this.scrapModel.create({ userId, feedId: createScrapDto.feedId });
    return createdScrap;
  }

  ////// 스크랩 취소 //////
  // 스크랩 목록에서 해당 게시물을 삭제함.
  async removeScrap(feedId: string, userId: string) {
    // 해당 게시물을 조회
    const feed = await this.feedModel.findOne({ _id: feedId });
    if (!feed) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    // 해당 게시물의 좋아요 숫자를 1 감소
    feed.likeCount -= 1;
    await feed.save();

    // 스크랩 취소
    const deletedScrap = await this.scrapModel.findOneAndDelete({ feedId, userId });
    if (!deletedScrap) {
      throw new NotFoundException('스크랩을 찾을 수 없습니다.');
    }
    return { message: '스크랩이 취소되었습니다.' };
  }

  ////// 스크랩한 게시물 목록 조회 //////
  // 본인이 스크랩한 글 불러오는 함수
  // 토큰 id로 회원을 조회하여 그 회원이 스크랩한 게시물 ID를 보내줌.
  async fetchScraps(userId: string) {
    const scrapLists = await this.scrapModel.find({ userId }).exec();
    const myScraps = [];

    for (const feed of scrapLists) {
      if (!feed || !feed.feedId) {
        throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
      }
      const myFeed = await this.feedModel.find({ _id: feed.feedId }).exec();
      myScraps.push(myFeed);
    }

    return this.feedExtractor.extractFeeds(myScraps.flat());
  }
}
