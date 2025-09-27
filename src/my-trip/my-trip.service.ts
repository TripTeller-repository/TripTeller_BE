import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FeedDocument } from '../feed/feed.schema';
import { CreateFeedDto } from '../feed/dto/request/create-feed.dto';
import { Model } from 'mongoose';
import { UpdateFeedDto } from '../feed/dto/request/update-feed.dto';
import { FileUtilService } from '@common/files/file-util.service';
import { FeedExtractor } from '@feed/feed-extractor';
import { FeedService } from '@feed/feed.service';

@Injectable()
export class MyTripService {
  constructor(
    private readonly feedService: FeedService,
    private readonly feedExtractor: FeedExtractor,
    private readonly fileUtilService: FileUtilService,
    @InjectModel('Feed') private readonly feedModel: Model<FeedDocument>,
  ) {}

  /**
   * 사용자가 작성한 게시물의 커버 이미지 URL을 반환
   *
   * @param {string} feedId - 게시물 ID
   * @param {string} userId - 요청한 사용자 ID
   * @throws {UnauthorizedException} 게시물 작성자와 사용자 불일치 시
   * @throws {NotFoundException} 게시물 또는 커버 이미지가 존재하지 않을 시
   * @returns {{ coverImage: string }} 커버 이미지 URL
   */
  async fetchMyFeedImgUrl(feedId: string, userId: string) {
    // 해당 게시물 찾기
    const feed = await this.feedModel.findById(feedId).exec();

    // 해당 게시물이 존재하는지 확인
    if (!feed) {
      throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
    }

    // 해당 회원 일치 여부 확인
    if (userId !== feed.userId) {
      throw new UnauthorizedException('해당 회원의 게시물이 아닙니다.');
    }

    // 커버 이미지가 존재하는지 확인
    if (!feed.coverImage) {
      throw new NotFoundException('해당 게시물의 커버 이미지가 존재하지 않습니다.');
    }

    return { coverImage: feed.coverImage };
  }

  /**
   * 새로운 게시물을 생성
   *
   * @param {CreateFeedDto} createFeedDto - 게시물 생성 DTO
   * @param {string} userId - 작성자 ID
   * @returns {Promise<FeedDocument>} 생성된 게시물
   */
  async createFeed(createFeedDto: CreateFeedDto, userId: string) {
    const feedData = { ...createFeedDto, userId };
    return this.feedModel.create(feedData);
  }

  /**
   * 게시물을 수정
   *
   * @param {string} feedId - 수정할 게시물 ID
   * @param {string} userId - 요청한 사용자 ID
   * @param {UpdateFeedDto} updateFeedDto - 수정 데이터
   * @throws {NotFoundException} 게시물 미존재 혹은 권한 없음
   * @returns {{ message: string }} 수정 완료 메시지
   */
  async updateFeed(feedId: string, userId: string, updateFeedDto: UpdateFeedDto) {
    await this.feedService.checkFeedAuthor(feedId, userId);

    const updatedFeed = await this.feedModel
      .findByIdAndUpdate(feedId, updateFeedDto, { runValidators: true, new: true })
      .exec();

    if (!updatedFeed) {
      throw new NotFoundException('게시물 수정 중 오류가 발생하였습니다.');
    }

    return { message: '해당 게시물이 수정되었습니다.' };
  }

  /**
   * 게시물 삭제(soft delete)
   *
   * @param {string} feedId - 게시물 ID
   * @param {string} userId - 요청한 사용자 ID
   * @throws {NotFoundException} 게시물 미존재 혹은 권한 없음
   * @returns {{ message: string }} 삭제 완료 메시지
   */
  async removeFeed(feedId: string, userId: string) {
    await this.feedService.checkFeedAuthor(feedId, userId);

    await this.feedModel.updateOne({ _id: feedId }, { deletedAt: new Date() }).exec();

    return { message: '해당 게시물이 삭제되었습니다.' };
  }

  /**
   * 본인이 작성한 게시물 전체를 페이지네이션으로 조회
   *
   * @param {number} pageNumber - 페이지 번호
   * @param {string} userId - 사용자 ID
   * @returns {Promise<any>} 페이지네이션된 게시물 데이터
   */
  async fetchAllMyFeedsPaginated(pageNumber: number = 1, userId: string) {
    return this.feedExtractor.fetchMyFeeds(pageNumber, userId);
  }

  /**
   * 특정 ID의 본인 게시물을 조회
   *
   * @param {string} feedId - 게시물 ID
   * @param {string} userId - 사용자 ID
   * @returns {Promise<any>} 해당 게시물 정보
   */
  async fetchMyFeedByFeedId(feedId: string, userId: string) {
    await this.feedService.checkFeedAuthor(feedId, userId);

    const feed = await this.feedService.findByIds([feedId]);
    return this.feedExtractor.extractFeeds(feed, userId);
  }

  async fetchMyFeedsByVisibility(pageNumber: number = 1, userId: string, isPublic: boolean) {
    return this.feedExtractor.fetchMyFeeds(pageNumber, userId, { isPublic });
  }

  /**
   * 본인이 작성한 모든 게시물 중 "공개" 게시물만 조회
   *
   * @param {number} pageNumber - 페이지 번호 (기본값: 1)
   * @param {string} userId - 사용자 ID
   * @returns {Promise<any>} 페이지네이션된 공개 게시물 목록
   */
  async fetchMyPublicFeeds(pageNumber: number = 1, userId: string) {
    return this.fetchMyFeedsByVisibility(pageNumber, userId, true);
  }

  /**
   * 본인이 작성한 모든 게시물 중 "비공개" 게시물만 조회
   *
   * @param {number} pageNumber - 페이지 번호 (기본값: 1)
   * @param {string} userId - 사용자 ID
   * @returns {Promise<any>} 페이지네이션된 비공개 게시물 목록
   */
  async fetchMyPrivateFeeds(pageNumber: number = 1, userId: string) {
    return this.fetchMyFeedsByVisibility(pageNumber, userId, false);
  }

  async sortMyFeeds(pageNumber: number = 1, userId: string, sortField: string, sortOrder: -1 | 1 = -1) {
    const sort = { [sortField]: sortOrder };
    return this.feedExtractor.fetchMyFeeds(pageNumber, userId, { sort });
  }

  /**
   * 본인이 작성한 게시물을 최신순으로 정렬하여 조회
   *
   * @param {number} pageNumber - 페이지 번호 (기본값: 1)
   * @param {string} userId - 사용자 ID
   * @returns {Promise<any>} 최신순 정렬된 게시물 목록
   */
  async sortMyFeedsByRecent(pageNumber: number = 1, userId: string) {
    return this.sortMyFeeds(pageNumber, userId, 'createdAt', -1);
  }

  /**
   * 본인이 작성한 게시물을 좋아요 수(likeCount) 기준으로 정렬하여 조회
   *
   * @param {number} pageNumber - 페이지 번호 (기본값: 1)
   * @param {string} userId - 사용자 ID
   * @returns {Promise<any>} 인기순 정렬된 게시물 목록
   */
  async sortMyFeedsByLikeCount(pageNumber: number = 1, userId: string) {
    return this.sortMyFeeds(pageNumber, userId, 'likeCount', -1);
  }

  /**
   * 본인이 작성한 게시물 중 특정 날짜 범위(startDate ~ endDate)에 해당하는 게시물을 조회
   *
   * @param {string} startDate - 조회 시작 날짜 (YYYY-MM-DD 형식)
   * @param {string} endDate - 조회 종료 날짜 (YYYY-MM-DD 형식)
   * @param {number} pageNumber - 페이지 번호
   * @param {string} userId - 사용자 ID
   * @throws {BadRequestException} startDate가 endDate보다 늦은 경우
   * @returns {Promise<any>} 필터링된 게시물 목록 또는 메시지
   */
  async fetchMyFeedsByDate(startDate: string, endDate: string, pageNumber: number, userId: string) {
    const pageSize = 9;
    const InputStartDate = new Date(startDate);
    const InputEndDate = new Date(endDate);
    if (InputStartDate > InputEndDate) {
      throw new BadRequestException('startDate는 endDate보다 이전이어야 합니다.');
    }

    // 후보 id 가져오기
    const baseCriteria = { userId, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };
    const all = await this.feedModel.find(baseCriteria).select('_id').lean();
    const allIds = all.map((d) => String(d._id));
    if (allIds.length === 0) {
      return { success: true, feeds: { metadata: { totalCount: 0, pageNumber, pageSize }, data: [] } };
    }

    // populate 후 날짜 필터 (start/end는 travelPlan의 virtual이므로 lean 금지)
    const docs = await this.feedService.findByIds(allIds);
    const filteredIds = docs
      .filter((feed) => {
        const tp: any = (feed as any).travelPlan;
        if (!tp?.dailyPlans?.length) return false;
        // 하루라도 범위 안에 있으면 통과
        return tp.dailyPlans.some((dp: any) => {
          if (!dp?.date) return false;
          const d = new Date(dp.date);
          return !isNaN(d.getTime()) && d >= InputStartDate && d <= InputEndDate;
        });
      })
      .map((f) => String(f._id));

    if (filteredIds.length === 0) {
      return { message: '게시물이 해당 날짜 사이에 존재하지 않습니다.' };
    }

    // 페이지네이션: id 기반 → 다시 findByIds → extract
    const pageIds = await this.feedService.getPaginatedFeeds(pageNumber, pageSize, { _id: { $in: filteredIds } });
    const pageIdList = (pageIds.feeds.data ?? []).map((d) => String((d as any)._id));
    const pageDocs = await this.feedService.findByIds(pageIdList);
    const data = await this.feedExtractor.extractFeeds(pageDocs, userId || undefined);

    return { success: true, feeds: { metadata: pageIds.feeds.metadata, data } };
  }

  /**
   * AWS S3에 업로드할 커버 이미지용 Signed URL을 생성
   *
   * @param {string} fileName - 원본 파일명
   * @param {string} userId - 사용자 ID (파일명 유니크 처리용)
   * @returns {Promise<string>} AWS S3 Signed URL
   */
  async fetchCoverImageSignedUrl(fileName: string, userId: string) {
    const fileNameInBucket = this.fileUtilService.createFileUnixName(fileName, userId);
    const filePathName = `cover-image/${fileNameInBucket}`;
    return await this.fileUtilService.createSignedUrl(filePathName);
  }

  /**
   * 게시물의 커버 이미지를 업데이트
   *
   * @param {string} feedId - 대상 피드 ID
   * @param {string} userId - 사용자 ID
   * @param {string} imageUrl - 새 커버 이미지 URL
   * @returns {Promise<FeedDocument | null>} 업데이트된 게시물 문서
   */
  async updateCoverImageById(feedId: string, userId: string, imageUrl: string) {
    const updatedFeed = await this.feedModel
      .findOneAndUpdate({ _id: feedId, userId }, { coverImage: imageUrl }, { runValidators: true, new: true })
      .exec();
    return updatedFeed;
  }
}
