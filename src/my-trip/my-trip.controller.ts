import { Controller, Post, Delete, Get, Param, Body, Req, Put, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MyTripService } from './my-trip.service';
import { CreateFeedDto } from '../feed/dto/create-feed.dto';
import { UpdateFeedDto } from '../feed/dto/update-feed.dto';
import { PostCoverImageDto } from '../feed/dto/post-cover-Image.dto';
import { CustomAuthGuard } from 'src/authentication/auth.guard';
import { ApiOperation, ApiQuery, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('MyTrip')
@Controller('my-trip')
@UseGuards(CustomAuthGuard)
export class MyTripController {
  constructor(private readonly myTripService: MyTripService) {}

  // my-trip?pageNumber=1
  @Get()
  @ApiOperation({
    summary: '본인의 모든 게시물 조회',
    description: '본인이 작성한 모든 게시물을 페이지네이션을 통해 조회한다.',
    operationId: 'getAllFeeds',
  })
  @ApiQuery({
    name: 'pageNumber',
    description: '페이지 번호 (기본값: 1)',
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '본인의 모든 게시물이 정상적으로 조회되었습니다.',
    content: {
      'application/json': {
        example: {
          data: [
            {
              id: '60d72b2f9f1b2b7b8d5a5c5a',
              title: '경주 여행 나들이~',
              content: '수학여행으로만 갔던 경주! 이번에 가니...',
              createdAt: '2024-11-01T08:00:00Z',
              likeCount: 23,
              isPublic: true,
              coverImage: 'http://example.com/cover.jpg',
            },
          ],
          pagination: {
            totalPages: 3,
            currentPage: 1,
            pageSize: 9,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getAllFeeds(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return await this.myTripService.fetchAllMyFeedsPaginated(pageNumber, userId);
  }

  // my-trip/date?startDate=2023-01-01&endDate=2023-01-31&pageNumber=1
  @Get('/date')
  @ApiOperation({
    summary: '본인이 쓴 게시물 기간별 조회',
    description: '특정 기간 동안 본인이 작성한 게시물을 조회한다.',
    operationId: 'getFeedsByDate',
  })
  @ApiQuery({
    name: 'startDate',
    description: '조회할 시작 날짜 (yyyy-MM-dd 형식)',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: '조회할 종료 날짜 (yyyy-MM-dd 형식)',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '입력한 기간에 해당하는 게시물이 정상적으로 조회되었습니다.',
    content: {
      'application/json': {
        example: {
          data: [
            {
              id: '60d72b2f9f1b2b7b8d5a5c5a',
              title: '경주 여행 나들이~',
              content: '수학여행으로만 갔던 경주! 이번에 가니...',
              createdAt: '2024-01-15T08:00:00Z',
              likeCount: 10,
              isPublic: true,
              coverImage: 'http://example.com/cover.jpg',
            },
          ],
          pagination: {
            totalPages: 1,
            currentPage: 1,
            pageSize: 9,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 날짜 형식.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getFeedsByDate(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
  ) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyFeedsByDate(startDate, endDate, pageNumber, userId);
  }

  // my-trip/public?pageNumber=1
  @Get('public')
  @ApiOperation({
    summary: '본인의 공개 게시물 조회',
    description: '본인이 작성한 공개 게시물만 조회한다.',
    operationId: 'getMyPublicFeed',
  })
  @ApiQuery({
    name: 'pageNumber',
    description: '페이지 번호 (기본값: 1)',
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '본인의 공개 게시물이 정상적으로 조회되었습니다.',
    content: {
      'application/json': {
        example: {
          data: [
            {
              id: '60d72b2f9f1b2b7b8d5a5c5a',
              title: '경주 여행 나들이~',
              content: '수학여행으로만 갔던 경주! 이번에 가니...',
              createdAt: '2024-10-01T08:00:00Z',
              likeCount: 50,
              isPublic: true,
              coverImage: 'http://example.com/cover.jpg',
            },
          ],
          pagination: {
            totalPages: 2,
            currentPage: 1,
            pageSize: 9,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getMyPublicFeed(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyPublicFeeds(pageNumber, userId);
  }

  // my-trip/private?pageNumber=1
  @Get('private')
  @ApiOperation({
    summary: '본인의 비공개 게시물 조회',
    description: '본인이 작성한 비공개 게시물만 조회한다.',
    operationId: 'getMyPrivateFeed',
  })
  @ApiQuery({
    name: 'pageNumber',
    description: '페이지 번호 (기본값: 1)',
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '본인의 비공개 게시물이 정상적으로 조회되었습니다.',
    content: {
      'application/json': {
        example: {
          data: [
            {
              id: '60d72b2f9f1b2b7b8d5a5c5a',
              title: '경주 여행 나들이~',
              content: '수학여행으로만 갔던 경주! 이번에 가니...',
              createdAt: '2024-10-10T08:00:00Z',
              likeCount: 5,
              isPublic: false,
              coverImage: 'http://example.com/cover.jpg',
            },
          ],
          pagination: {
            totalPages: 1,
            currentPage: 1,
            pageSize: 9,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getMyPrivateFeed(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyPrivateFeeds(pageNumber, userId);
  }

  // my-trip/:feedId
  @Get(':feedId')
  @ApiOperation({
    summary: '본인의 특정 게시물을 게시물 ID로 조회',
    description: '본인의 게시물 ID를 통해 특정 게시물을 조회한다.',
    operationId: 'getOneFeed',
  })
  @ApiParam({
    name: 'feedId',
    description: '게시물 ID',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '특정 게시물이 정상적으로 조회되었습니다.',
    content: {
      'application/json': {
        example: {
          id: '60d72b2f9f1b2b7b8d5a5c5a',
          title: '경주 여행 나들이~',
          content: '수학여행으로만 갔던 경주! 이번에 가니...',
          createdAt: '2024-11-01T08:00:00Z',
          likeCount: 23,
          isPublic: true,
          coverImage: 'http://example.com/cover.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시물이 존재하지 않거나 접근할 수 없습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getOneFeed(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyFeedByFeedId(feedId, userId);
  }

  // my-trip/:feedId/cover-image
  @Get(':feedId/cover-image')
  @ApiOperation({
    summary: '특정 게시물의 커버 이미지 url 불러오기',
    description: '특정 게시물의 커버 이미지 URL을 가져온다.',
    operationId: 'getFeedCoverImage',
  })
  @ApiParam({
    name: 'feedId',
    description: '게시물 ID',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '커버 이미지 URL을 정상적으로 조회했습니다.',
    content: {
      'application/json': {
        example: {
          coverImage: 'http://example.com/cover.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시물이 존재하지 않거나 커버 이미지가 없습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getFeedCoverImage(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyFeedImgUrl(feedId, userId);
  }

  // my-trip/cover-image-signed-url/:fileName
  @Get('cover-image-signed-url/:fileName')
  @ApiParam({
    name: 'fileName',
    description: '파일 이름',
    required: true,
    type: String,
  })
  @ApiOperation({
    summary: 'AWS S3 프로필 이미지 Signed URL 불러오기',
    description: 'S3에서 프로필 이미지의 signed URL을 가져온다.',
    operationId: 'getCoverImageSignedUrl',
  })
  @ApiResponse({
    status: 200,
    description: 'S3 Signed URL이 정상적으로 반환되었습니다.',
    content: {
      'application/json': {
        example: {
          signedUrl: 'https://s3.amazonaws.com/your-bucket-name/file-name',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getCoverImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.myTripService.fetchCoverImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  // my-trip/order-by/recent
  @Get('order-by/recent')
  @ApiOperation({
    summary: '본인이 쓴 게시물 최신순 조회',
    description: '본인이 작성한 게시물을 최신순으로 조회한다.',
    operationId: 'getMyFeedOrderedByRecent',
  })
  @ApiResponse({
    status: 200,
    description: '입력한 페이지에 해당하는 게시물이 최신순으로 정상적으로 조회되었습니다.',
    content: {
      'application/json': {
        example: {
          data: [
            {
              id: '60d72b2f9f1b2b7b8d5a5c5a',
              title: '경주 여행 나들이~',
              content: '수학여행으로만 갔던 경주! 이번에 가니...',
              createdAt: '2024-01-15T08:00:00Z',
              likeCount: 10,
              isPublic: true,
              coverImage: 'http://example.com/cover.jpg',
            },
          ],
          pagination: {
            totalPages: 1,
            currentPage: 1,
            pageSize: 9,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 페이지 번호 형식.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getMyFeedOrderedByRecent(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return this.myTripService.sortMyFeedsByRecent(pageNumber, userId);
  }

  // my-trip/order-by/like-count
  @Get('order-by/like-count')
  @ApiOperation({
    summary: '게시물을 인기순으로 조회',
    description: '게시물이 인기순으로 정렬되어 조회된다.',
    operationId: 'getMyFeedsSortedByPopularity',
  })
  @ApiResponse({
    status: 200,
    description: '게시물이 좋아요 수에 따라 인기순으로 정렬되어 조회되었습니다.',
    content: {
      'application/json': {
        example: [
          {
            id: '60d72b2f9f1b2b7b8d5a5c5a',
            title: '경주 여행 나들이~',
            content: '수학여행으로만 갔던 경주! 이번에 가니...',
            createdAt: '2024-11-01T08:00:00Z',
            likeCount: 23,
            isPublic: true,
            coverImage: 'http://example.com/cover.jpg',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getMyFeedOrderedByLikeCount(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return this.myTripService.sortMyFeedsByLikeCount(pageNumber, userId);
  }

  @Post()
  @ApiOperation({
    summary: '게시물 작성',
    description: '새로운 게시물을 작성한다. (제목, 내용, 커버 이미지 등을 포함)',
    operationId: 'postOneFeed',
  })
  @ApiResponse({
    status: 201,
    description: '게시물이 성공적으로 작성되었습니다.',
    content: {
      'application/json': {
        example: {
          id: '60d72b2f9f1b2b7b8d5a5c5a',
          title: '경주 여행 나들이~',
          content: '수학여행으로만 갔던 경주! 이번에 가니...',
          createdAt: '2024-11-01T08:00:00Z',
          likeCount: 10,
          isPublic: true,
          coverImage: 'http://example.com/cover.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 입력입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async postOneFeed(@Req() req, @Body() createFeedDto: CreateFeedDto) {
    const { userId } = req.user;
    return await this.myTripService.createFeed(createFeedDto, userId);
  }

  @Post(':feedId/cover-image')
  @ApiOperation({
    summary: '커버 이미지 변경',
    description:
      '사용자가 게시물의 커버 이미지를 변경하는 기능을 제공한다. 요청된 feedId에 해당하는 게시물의 커버 이미지를 새 이미지 URL로 업데이트한다.',
    operationId: 'updateCoverImage',
  })
  @ApiParam({
    name: 'feedId',
    description: '게시물 ID',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '커버 이미지가 성공적으로 변경되었습니다.',
    content: {
      'application/json': {
        example: {
          message: '커버 이미지가 성공적으로 변경되었습니다.',
          updatedFeed: {
            id: '60d72b2f9f1b2b7b8d5a5c5a',
            title: '경주 여행 나들이~',
            content: '수학여행으로만 갔던 경주! 이번에 가니...',
            createdAt: '2024-11-01T08:00:00Z',
            likeCount: 23,
            isPublic: true,
            coverImage: 'http://example.com/new-cover.jpg',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 형식 또는 파라미터 오류.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 404,
    description: '게시물이 존재하지 않거나 사용자가 해당 게시물을 수정할 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async postProfileImage(@Req() req, @Param('feedId') feedId: string, @Body() postCoverImageDto: PostCoverImageDto) {
    try {
      // 해당 게시물의 커버 이미지 변경
      const { userId } = req.user;
      const { imageUrl } = postCoverImageDto;

      // 커버 이미지가 변경된 게시물 정보 업데이트
      const updatedFeed = await this.myTripService.updateCoverImageById(feedId, userId, imageUrl);

      if (updatedFeed) {
        return { message: '커버 이미지가 성공적으로 변경되었습니다.', updatedFeed };
      } else {
        return { message: '사용자를 찾을 수 없습니다.' };
      }
    } catch (error) {
      return { message: '프로필 이미지 변경 중 오류가 발생했습니다.' };
    }
  }

  @Put(':feedId')
  @ApiOperation({
    summary: '게시물 수정',
    description: '기존 게시물의 제목, 내용 또는 다른 정보를 수정한다.',
    operationId: 'putOneFeed',
  })
  @ApiParam({
    name: 'feedId',
    description: '게시물 ID',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '게시물이 성공적으로 수정되었습니다.',
    content: {
      'application/json': {
        example: {
          message: '게시물이 성공적으로 수정되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시물이 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async putOneFeed(@Req() req, @Param('feedId') feedId: string, @Body() updateFeedDto: UpdateFeedDto) {
    const { userId } = req.user;
    return await this.myTripService.updateFeed(feedId, userId, updateFeedDto);
  }

  @Delete(':feedId')
  @ApiOperation({
    summary: '게시물 삭제',
    description: '특정 게시물을 삭제한다.',
    operationId: 'deleteOneFeed',
  })
  @ApiParam({
    name: 'feedId',
    description: '게시물 ID',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '게시물이 성공적으로 삭제되었습니다.',
    content: {
      'application/json': {
        example: {
          message: '게시물이 성공적으로 삭제되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시물이 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async deleteOneFeed(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.myTripService.removeFeed(feedId, userId);
  }
}
