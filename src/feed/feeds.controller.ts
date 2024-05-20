import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { Body } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Post } from '@nestjs/common';

// feed : 본인 게시물 (비공개 게시물) => MyTrip
// feeds : 모든 게시물 (공개 게시물) => OurTrip

@Controller('feeds')
export class FeedsController {
  constructor(
    private readonly feedsService: FeedsService,
    private readonly userService: UserService,
  ) {}

  // 모든 게시글 조회 (공개)
  @Get()
  getPublicFeeds() {
    return this.feedsService.getPublicFeedsPaginated();
  }

  // 모든 게시글 조회 페이지네이션 (공개)
  @Get('pagination')
  async getPublicFeedsPagination(@Query('pageNumber', ParseIntPipe) pageNumber: number) {
    return this.feedsService.getPublicFeedsPaginated(pageNumber);
  }

  // 게시물 ID로 특정 게시물 조회 (공개)
  @Get(':feedId')
  getOneFeed(@Param('feedId') feedId: string) {
    return this.feedsService.getOnePublicFeed(feedId);
  }

  // 모든 공개 게시글 정렬 : 최신순
  @Get('order/byRecent')
  getFeedsOrderedByRecent() {
    return this.feedsService.sortPublicByRecent();
  }

  // 모든 공개 게시글 정렬 : 인기순
  @Get('order/byLikeCount')
  getFeedsOrderedByLikeCount() {
    return this.feedsService.sortPublicByLikeCount();
  }

  // 회원정보 회원 ID로 전체 조회
  // 정보 : 이메일, 프로필 이미지 URL, 닉네임
  // OurTrip => 회원 ID 값으로 조회
  @Post('user/info')
  async getUserInfoOurTrip(@Body('userId') userId: string) {
    return this.userService.getUserInfo(userId);
  }
}
