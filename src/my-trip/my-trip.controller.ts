import { Controller, Post, Delete, Get, Param, Body, Req, Put, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MyTripService } from './my-trip.service';
import { CreateFeedDto } from '../feed/dto/create-feed.dto';
import { UpdateFeedDto } from '../feed/dto/update-feed.dto';
import { TravelPlanService } from '../travel-plan/travel-plan.service';
import { CreateTravelPlanDto } from '../travel-plan/dto/create-travel-plan.dto';
import { PutTravelPlanDto } from '../travel-plan/dto/put-travel-plan.dto';
import { PostCoverImageDto } from '../feed/dto/post-cover-Image.dto';
import { CustomAuthGuard } from 'src/authentication/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('my-trip')
@UseGuards(CustomAuthGuard)
export class MyTripController {
  constructor(
    private readonly myTripService: MyTripService,
    private readonly travelPlanService: TravelPlanService,
  ) {}

  // my-trip?pageNumber=1
  @ApiTags('MyTrip')
  @Get()
  @ApiOperation({ summary: '본인의 모든 게시물 조회' })
  async getAllFeeds(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return await this.myTripService.fetchAllMyFeedsPaginated(pageNumber, userId);
  }

  // my-trip/date?startDate=2023-01-01&endDate=2023-01-31&pageNumber=1
  @ApiTags('MyTrip')
  @Get('/date')
  @ApiOperation({ summary: '본인이 쓴 게시물 기간별 조회' })
  async getFeedsByDate(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
  ) {
    const { userId } = req.user;
    console.log('컨트롤러 userId', userId);
    console.log('컨트롤러 startDate', startDate);
    console.log('컨트롤러 endDate', endDate);
    console.log('컨트롤러 pageNumber', pageNumber);
    return await this.myTripService.fetchMyFeedsByDate(startDate, endDate, pageNumber, userId);
  }

  // my-trip/public?pageNumber=1
  @ApiTags('MyTrip')
  @Get('public')
  @ApiOperation({ summary: '본인의 공개 게시물 조회' })
  async getMyPublicFeed(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyPublicFeeds(pageNumber, userId);
  }

  // my-trip/private?pageNumber=1
  @ApiTags('MyTrip')
  @Get('private')
  @ApiOperation({ summary: '본인의 비공개 게시물 조회' })
  async getMyPrivateFeed(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyPrivateFeeds(pageNumber, userId);
  }

  // my-trip/:feedId
  @ApiTags('MyTrip')
  @Get(':feedId')
  @ApiOperation({ summary: '본인의 특정 게시물을 게시물 ID로 조회' })
  async getOneFeed(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyFeedByFeedId(feedId, userId);
  }

  // my-trip/:feedId/cover-image
  @ApiTags('MyTrip')
  @Get(':feedId/cover-image')
  @ApiOperation({ summary: '특정 게시물의 커버 이미지 url 불러오기' })
  async getFeedCoverImage(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.myTripService.fetchMyFeedImgUrl(feedId, userId);
  }

  // my-trip/cover-image-signed-url/:fileName
  @ApiTags('MyTrip')
  @Get('cover-image-signed-url/:fileName')
  @ApiOperation({ summary: 'AWS S3 프로필 이미지 Signed URL 불러오기' })
  async getCoverImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.myTripService.fetchCoverImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  // my-trip/order-by/recent
  @ApiTags('MyTrip')
  @Get('order-by/recent')
  @ApiOperation({ summary: '본인의 모든 게시글 정렬 : 최신순' })
  async getMyFeedOrderedByRecent(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return this.myTripService.sortMyFeedsByRecent(pageNumber, userId);
  }

  // my-trip/order-by/like-count
  @ApiTags('MyTrip')
  @Get('order-by/like-count')
  @ApiOperation({ summary: '본인의 모든 게시글 정렬 : 인기순' })
  async getMyFeedOrderedByLikeCount(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req) {
    const { userId } = req.user;
    return this.myTripService.sortMyFeedsByLikeCount(pageNumber, userId);
  }

  @ApiTags('MyTrip')
  @Post()
  @ApiOperation({ summary: '게시물 등록' })
  async postOneFeed(@Req() req, @Body() createFeedDto: CreateFeedDto) {
    const { userId } = req.user;
    return await this.myTripService.createFeed(createFeedDto, userId);
  }

  @ApiTags('MyTrip')
  @Post(':feedId/cover-image')
  @ApiOperation({ summary: '커버 이미지 변경' })
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

  @ApiTags('MyTrip')
  @Put(':feedId')
  @ApiOperation({ summary: '게시물 수정' })
  async putOneFeed(@Req() req, @Param('feedId') feedId: string, @Body() updateFeedDto: UpdateFeedDto) {
    const { userId } = req.user;
    return await this.myTripService.updateFeed(feedId, userId, updateFeedDto);
  }

  @ApiTags('MyTrip')
  @Delete(':feedId')
  @ApiOperation({ summary: '게시물 삭제' })
  async deleteOneFeed(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.myTripService.removeFeed(feedId, userId);
  }

  ////////////////////////////////////
  //////////// travelPlan ////////////
  ////////////////////////////////////

  @ApiTags('TravelPlan')
  @Post(':feedId/travel-plan')
  @ApiOperation({ summary: '여행 일정 등록' })
  async postTravelPlan(@Req() req, @Param('feedId') feedId: string, @Body() createTravelPlanDto: CreateTravelPlanDto) {
    const { userId } = req.user;
    return await this.travelPlanService.createTravelPlan(feedId, createTravelPlanDto, userId);
  }

  @ApiTags('TravelPlan')
  @Get(':feedId/travel-plan/:travelPlanId')
  @ApiOperation({ summary: '특정 여행 일정을 여행 일정 ID로 조회' })
  async getTravelPlan(@Req() req, @Param('feedId') feedId: string, @Param('travelPlanId') travelPlanId: string) {
    const { userId } = req.user;
    return await this.travelPlanService.fetchTravelPlan(feedId, travelPlanId, userId);
  }

  @ApiTags('TravelPlan')
  @Put(':feedId/travel-plan/:travelPlanId')
  @ApiOperation({ summary: '여행 일정 수정' })
  async putTravelPlan(
    @Req() req,
    @Param('feedId') feedId: string,
    @Param('travelPlanId') travelPlanId: string,
    @Body() putTravelPlanDto: PutTravelPlanDto,
  ) {
    const { userId } = req.user;
    return await this.travelPlanService.updateTravelPlan(feedId, travelPlanId, putTravelPlanDto, userId);
  }

  @ApiTags('TravelPlan')
  @Delete(':feedId/travel-plan/:travelPlanId')
  @ApiOperation({ summary: '여행 일정 삭제' })
  async deleteTravelPlan(@Param('feedId') feedId: string, @Param('travelPlanId') travelPlanId: string) {
    return this.travelPlanService.removeTravelPlan(feedId, travelPlanId);
  }
}
