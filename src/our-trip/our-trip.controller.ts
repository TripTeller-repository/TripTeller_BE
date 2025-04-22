import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Post } from '@nestjs/common';
import { OurTripService } from './our-trip.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('OurTrip')
@Controller('our-trip')
export class OurTripController {
  constructor(
    private readonly ourTripService: OurTripService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: '모든 게시글 조회 (공개)', description: '공개된 모든 게시물을 조회한다.' })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, description: '페이지 번호' })
  @ApiResponse({
    status: 200,
    description: '모든 공개 게시물 목록을 반환합니다.',
    schema: {
      example: {
        feeds: [
          {
            id: 'feedId',
            title: '경주 여행 나들이~',
            content: '수학여행으로만 갔던 경주! 이번에 가니...',
            createdAt: '2024-11-01T08:00:00Z',
            likeCount: 23,
            isPublic: true,
            coverImage: 'http://example.com/cover.jpg',
          },
        ],
        pagination: { totalPages: 10, currentPage: 1, pageSize: 9 },
      },
    },
  })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getPublicFeeds(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req: Request) {
    try {
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

  @Get('date')
  @ApiOperation({
    summary: '모든 공개 게시물 기간별 조회',
    description: '특정 기간 동안의 공개 게시물을 조회한다.',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: '종료 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, description: '페이지 번호' })
  @ApiResponse({
    status: 200,
    description: '특정 기간 내의 공개 게시물을 반환합니다.',
    schema: {
      example: {
        feeds: [
          {
            id: 'feedId',
            title: '경주 여행 나들이~',
            content: '수학여행으로만 갔던 경주! 이번에 가니...',
            createdAt: '2024-11-01T08:00:00Z',
            likeCount: 23,
            isPublic: true,
            coverImage: 'http://example.com/cover.jpg',
          },
        ],
        pagination: { totalPages: 10, currentPage: 1, pageSize: 9 },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 날짜 형식 또는 논리적 오류' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getFeedsByDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pageNumber', ParseIntPipe) pageNumber: number = 1,
    @Req() req: Request,
  ) {
    try {
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

  @Get('order-by/recent')
  @ApiOperation({
    summary: '모든 공개 게시글 정렬 : 최신순',
    description: '공개 게시물들을 최신순으로 정렬하여 보여준다.',
  })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, description: '페이지 번호' })
  @ApiResponse({
    status: 200,
    description: '최신순으로 정렬된 공개 게시물 목록을 반환합니다.',
    schema: {
      example: {
        feeds: [
          {
            id: 'feedId',
            title: '경주 여행 나들이~',
            content: '수학여행으로만 갔던 경주! 이번에 가니...',
            createdAt: '2024-11-01T08:00:00Z',
            likeCount: 23,
            isPublic: true,
            coverImage: 'http://example.com/cover.jpg',
          },
        ],
        pagination: { totalPages: 10, currentPage: 1, pageSize: 9 },
      },
    },
  })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getOurFeedsOrderedByRecent(@Query('pageNumber', ParseIntPipe) pageNumber: number = 1, @Req() req: Request) {
    try {
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

  // our-trip/order-by/like-count?pageNumber=1
  @Get('order-by/like-count')
  @ApiOperation({
    summary: '모든 공개 게시글 정렬 : 인기순',
    description: '공개 게시물들을 인기순으로 정렬하여 보여준다.',
  })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, description: '페이지 번호' })
  @ApiResponse({
    status: 200,
    description: '인기순으로 정렬된 공개 게시물 목록을 반환합니다.',
    schema: {
      example: {
        feeds: [
          {
            id: 'feedId',
            title: '경주 여행 나들이~',
            content: '수학여행으로만 갔던 경주! 이번에 가니...',
            createdAt: '2024-11-01T08:00:00Z',
            likeCount: 23,
            isPublic: true,
            coverImage: 'http://example.com/cover.jpg',
          },
        ],
        pagination: { totalPages: 10, currentPage: 1, pageSize: 9 },
      },
    },
  })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getOurFeedsOrderedByLikeCount(@Query('pageNumber', ParseIntPipe) pageNumber: number = 1, @Req() req: Request) {
    try {
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

  @Get(':feedId')
  @ApiOperation({
    summary: '게시물 ID로 특정 게시물 조회 (공개)',
    description: '게시물 ID를 이용해 특정 공개 게시물을 조회한다.',
  })
  @ApiParam({
    name: 'feedId',
    description: '조회할 게시물의 ID',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '특정 게시물을 반환합니다.',
    schema: {
      example: {
        id: 'feedId',
        title: '경주 여행 나들이~',
        content: '수학여행으로만 갔던 경주! 이번에 가니...',
        createdAt: '2024-11-01T08:00:00Z',
        likeCount: 23,
        isPublic: true,
        coverImage: 'http://example.com/cover.jpg',
      },
    },
  })
  @ApiResponse({ status: 404, description: '게시물이 존재하지 않음' })
  getOnePublicFeed(@Param('feedId') feedId: string) {
    return this.ourTripService.fetchOurFeed(feedId);
  }

  @Post('user-info')
  @ApiOperation({
    summary: '회원 프로필 정보(이메일, 프로필 이미지 URL, 닉네임)를 회원 ID로 조회',
    description: '회원 ID를 통해 해당 회원의 이메일, 프로필 이미지 URL, 닉네임을 조회한다.',
  })
  @ApiBody({
    description: '회원 ID',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'objectid' },
      },
      example: {
        userId: '507f191e810c19729de860ea',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '회원 정보를 반환합니다.',
    schema: {
      example: {
        userId: 'userId',
        email: 'example@example.com',
        profileImage: 'http://example.com/profile.jpg',
        nickname: 'User123',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '회원 정보를 찾을 수 없음' })
  async getUserInfoOurTrip(@Body('userId') userId: string) {
    return this.userService.findUserInfoById(userId);
  }
}
