import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Post } from '@nestjs/common';
import { AuthService } from 'src/authentication/auth.service';
import { OurTripService } from './our-trip.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('our-trip')
export class OurTripController {
  constructor(
    private readonly ourTripService: OurTripService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  // 모든 게시글 조회 (공개)(페이지네이션)
  // our-trip?pageNumber=1
  @Get()
  @ApiOperation({ summary: '모든 게시글 조회 (공개)' })
  async getPublicFeeds(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req: Request) {
    try {
      // 로그인한 상태인 경우 회원의 userId를 추출
      const userId = req['user']?.userId;

      return this.ourTripService.fetchOurFeeds(pageNumber, userId || null);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch public feeds',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 모든 공개 게시물 기간별 조회
  // our-trip/date?startDate=2023-01-01&endDate=2023-01-31&pageNumber=1
  @Get('date')
  @ApiOperation({ summary: '모든 공개 게시물 기간별 조회' })
  async getFeedsByDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pageNumber', ParseIntPipe) pageNumber: number = 1,
    @Req() req: Request,
  ) {
    try {
      // 로그인한 상태인 경우 회원의 userId를 추출
      const userId = req['user']?.userId;

      return this.ourTripService.fetchFeedsByDate(startDate, endDate, pageNumber, userId || null);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch public feeds',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 모든 공개 게시글 정렬 : 최신순 (페이지네이션)
  // our-trip/order-by/recent?pageNumber=1
  @Get('order-by/recent')
  @ApiOperation({ summary: '모든 공개 게시글 정렬 : 최신순' })
  async getOurFeedsOrderedByRecent(@Query('pageNumber', ParseIntPipe) pageNumber: number = 1, @Req() req: Request) {
    try {
      // 로그인한 상태인 경우 회원의 userId를 추출
      const userId = req['user']?.userId;

      return this.ourTripService.sortOurFeedsByRecent(pageNumber, userId || null);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch public feeds',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // // 모든 공개 게시글 정렬 : 인기순 (페이지네이션)
  // // our-trip/order-by/like-count?pageNumber=1
  @Get('order-by/like-count')
  @ApiOperation({ summary: '모든 공개 게시글 정렬 : 인기순' })
  async getOurFeedsOrderedByLikeCount(@Query('pageNumber', ParseIntPipe) pageNumber: number = 1, @Req() req: Request) {
    try {
      // 로그인한 상태인 경우 회원의 userId를 추출
      const userId = req['user']?.userId;

      return this.ourTripService.sortOurFeedsByLikeCount(pageNumber, userId || null);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch public feeds',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 게시물 ID로 특정 게시물 조회 (공개)
  // our-trip/:feedId
  @Get(':feedId')
  @ApiOperation({ summary: '게시물 ID로 특정 게시물 조회 (공개)' })
  getOnePublicFeed(@Param('feedId') feedId: string) {
    return this.ourTripService.fetchOurFeed(feedId);
  }

  // 회원 프로필 정보를 회원 ID로 조회
  // 정보 : 이메일, 프로필 이미지 URL, 닉네임
  @Post('user-info')
  @ApiOperation({ summary: '회원 프로필 정보(이메일, 프로필 이미지 URL, 닉네임)를 회원 ID로 조회' })
  async getUserInfoOurTrip(@Body('userId') userId: string) {
    return this.userService.findUserInfoById(userId);
  }
}
