import { Controller, Post, Delete, Get, Param, Body, Req, Put, Query, ParseIntPipe } from '@nestjs/common';
import { MyTripService } from './my-trip.service';
import { CreateFeedDto } from '../feed/dto/create-feed.dto';
import { UpdateFeedDto } from '../feed/dto/update-feed.dto';
import { TravelPlanService } from '../travel-plan/travel-plan.service';
import { CreateTravelPlanDto } from '../travel-plan/dto/create-travel-plan.dto';
import { PutTravelPlanDto } from '../travel-plan/dto/put-travel-plan.dto';
import { PostCoverImageDto } from '../feed/dto/post-cover-Image.dto';

@Controller('my-trip')
export class MyTripController {
  constructor(
    private readonly myTripService: MyTripService,
    private readonly travelPlanService: TravelPlanService,
  ) {}

  // 본인의 모든 게시물 조회
  // my-trip?pageNumber=1
  @Get()
  async getAllFeeds(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return await this.myTripService.fetchAllMyFeedsPaginated(pageNumber, userId);
  }

  // 본인이 쓴 게시물 기간별 조회
  // my-trip/date?startDate=2023-01-01&endDate=2023-01-31&pageNumber=1
  @Get('/date')
  async getFeedsByDate(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
  ) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyFeedsByDate(startDate, endDate, pageNumber, userId);
  }

  // 본인의 공개 게시물 조회
  // my-trip/public?pageNumber=1
  @Get('public')
  async getMyPublicFeed(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyPublicFeeds(pageNumber, userId);
  }

  // 본인의 비공개 게시물 조회
  // my-trip/private?pageNumber=1
  @Get('private')
  async getMyPrivateFeed(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyPrivateFeeds(pageNumber, userId);
  }

  // 본인의 특정 게시물을 게시물 ID로 조회
  // my-trip/:feedId
  @Get(':feedId')
  async getFeed(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyFeedByFeedId(feedId, userId);
  }

  // 특정 게시물의 커버 이미지 url 불러오기
  // my-trip/:feedId/cover-image
  @Get(':feedId/cover-image')
  async getFeedCoverImage(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.myTripService.getMyFeedImgUrl(feedId, userId);
  }

  // AWS S3 프로필 이미지 Signed URL 불러오기
  // my-trip/cover-image-signed-url/:fileName
  @Get('cover-image-signed-url/:fileName')
  async getCoverImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.myTripService.getCoverImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  // 본인의 모든 게시글 정렬 : 최신순
  // my-trip/order-by/recent
  @Get('order-by/recent')
  getMyFeedOrderedByRecent(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return this.myTripService.sortMyFeedsByRecent(pageNumber, userId);
  }

  // 본인의 모든 게시글 정렬 : 인기순
  // my-trip/order-by/like-count
  @Get('order-by/like-count')
  getMyFeedOrderedByLikeCount(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return this.myTripService.sortMyFeedsByLikeCount(pageNumber, userId);
  }

  // 게시물 등록
  @Post()
  async createFeed(@Req() req, @Body() createFeedDto: CreateFeedDto) {
    const { userId } = req.user;
    return await this.myTripService.createFeed(createFeedDto, userId);
  }

  // 커버 이미지 변경
  @Post(':feedId/cover-image')
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

  // 게시물 수정
  @Put(':feedId')
  async updateFeed(@Req() req, @Param('feedId') feedId: string, @Body() updateFeedDto: UpdateFeedDto) {
    const { userId } = req.user;
    return await this.myTripService.updateFeed(feedId, userId, updateFeedDto);
  }

  // 게시글 삭제
  @Delete(':feedId')
  async deleteFeed(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.myTripService.deleteFeed(feedId, userId);
  }

  ////////////////////////////////////
  //////////// travelPlan ////////////
  ////////////////////////////////////

  // 여행 일정 등록
  @Post(':feedId/travel-plan')
  async postTravelPlan(@Req() req, @Param('feedId') feedId: string, @Body() createTravelPlanDto: CreateTravelPlanDto) {
    const { userId } = req.user;
    return await this.travelPlanService.createTravelPlan(feedId, createTravelPlanDto, userId);
  }

  // 특정 여행 일정을 여행 일정 ID로 조회
  @Get(':feedId/travel-plan/:travelPlanId')
  async getTravelPlan(@Req() req, @Param('feedId') feedId: string, @Param('travelPlanId') travelPlanId: string) {
    const { userId } = req.user;
    return await this.travelPlanService.findTravelPlan(feedId, travelPlanId, userId);
  }

  // 여행 일정 수정
  @Put(':feedId/travel-plan/:travelPlanId')
  async putTravelPlan(
    @Req() req,
    @Param('feedId') feedId: string,
    @Param('travelPlanId') travelPlanId: string,
    @Body() putTravelPlanDto: PutTravelPlanDto,
  ) {
    const { userId } = req.user;
    return await this.travelPlanService.updateTravelPlan(feedId, travelPlanId, putTravelPlanDto, userId);
  }

  // 여행 일정 삭제
  @Delete(':feedId/travel-plan/:travelPlanId')
  deleteTravelPlan(@Param('feedId') feedId: string, @Param('travelPlanId') travelPlanId: string) {
    return this.travelPlanService.deleteTravelPlan(feedId, travelPlanId);
  }
}
