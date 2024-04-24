import { Controller, Post, Delete, Get, Param, Body, Req, Put, Query, ParseIntPipe } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/createFeed.dto';
import { UpdateFeedDto } from './dto/updateFeed.dto';
import { TravelPlanService } from '../travelPlan/travelPlan.service';
import { CreateTravelPlanDto } from '../travelPlan/dto/createTravelPlan.dto';
import { PutTravelPlanDto } from '../travelPlan/dto/putTravelPlan.dto';
import { PostCoverImageDto } from './dto/postCoverImageDto';

//////////////////////////////////////////////////
// feed : 본인 게시물 (비공개 게시물) => MyTrip //
// feeds : 모든 게시물 (공개 게시물) => OurTrip //
//////////////////////////////////////////////////

@Controller('feed')
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly travelPlanService: TravelPlanService,
  ) {}

  ////////////////////////////////////
  /////////////// feed ///////////////
  ////////////////////////////////////

  // 본인 모든 게시물 조회
  @Get()
  async getAllFeeds(@Req() req) {
    const { userId } = req.user;
    return await this.feedService.getAllFeeds(userId);
  }

  // 본인이 쓴 게시물 기간별 조회 (공개, 비공개 다)
  @Get('/byDate')
  async getFeedsByDate(@Req() req, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const { userId } = req.user;
    return await this.feedService.getFeedsByDate(userId, startDate, endDate);
  }

  // 본인의 공개 게시물 조회: feed/public
  @Get('public')
  async getMyPublicFeed(@Req() req) {
    const { userId } = req.user;
    return await this.feedService.getMyPublicFeed(userId);
  }

  // 본인의 비공개 게시물 조회: feed/private
  @Get('private')
  async getMyPrivateFeed(@Req() req) {
    const { userId } = req.user;
    return await this.feedService.getMyPrivateFeed(userId);
  }

  // 본인 모든 게시물 조회 (페이지네이션)
  @Get('pagination')
  async getAllFeedsPagination(@Req() req, @Query('pageNumber', ParseIntPipe) pageNumber: number) {
    const { userId } = req.user;
    return await this.feedService.getAllFeedsPagination(userId, pageNumber);
  }

  // 본인의 특정 게시물을 게시물 ID로 조회
  @Get(':feedId')
  async getFeed(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.feedService.getMyFeedByFeedId(feedId, userId);
  }

  // 특정 게시물의 커버 이미지 url 불러오기
  @Get(':feedId/cover-image')
  async getFeedCoverImage(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.feedService.getMyFeedImgUrl(feedId, userId);
  }

  // AWS S3 프로필 이미지 Signed URL 불러오기
  @Get('cover-image-signed-url/:fileName')
  async getCoverImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.feedService.getCoverImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  // 본인의 모든 게시글 정렬 : 최신순
  @Get('order/byRecent')
  getMyFeedOrderedByRecent(@Req() req) {
    const { userId } = req.user;
    return this.feedService.sortPrivateByRecent(userId);
  }

  // 본인의 모든 게시글 정렬 : 인기순
  @Get('order/byLikeCount')
  getMyFeedOrderedByLikeCount(@Req() req) {
    const { userId } = req.user;
    return this.feedService.sortPrivateByLikeCount(userId);
  }

  // 게시물 등록
  @Post()
  async createFeed(@Req() req, @Body() createFeedDto: CreateFeedDto) {
    const { userId } = req.user;
    return await this.feedService.createFeed(createFeedDto, userId);
  }

  // 커버 이미지 변경
  @Post(':feedId/cover-image')
  async postProfileImage(@Req() req, @Param('feedId') feedId: string, @Body() postCoverImageDto: PostCoverImageDto) {
    try {
      // 해당 게시물의 커버 이미지 변경
      const { userId } = req.user;
      const { imageUrl } = postCoverImageDto;

      // 커버 이미지가 변경된 게시물 정보 업데이트
      const updatedFeed = await this.feedService.updateCoverImageById(feedId, userId, imageUrl);

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
    return await this.feedService.updateFeed(feedId, userId, updateFeedDto);
  }

  // 게시글 삭제
  @Delete(':feedId')
  async deleteFeed(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.feedService.deleteFeed(feedId, userId);
  }

  ////////////////////////////////////
  //////////// travelPlan ////////////
  ////////////////////////////////////

  // 여행 일정 등록
  @Post(':feedId/travelPlan')
  async postTravelPlan(@Req() req, @Param('feedId') feedId: string, @Body() createTravelPlanDto: CreateTravelPlanDto) {
    const { userId } = req.user;
    return await this.travelPlanService.createTravelPlan(feedId, createTravelPlanDto, userId);
  }

  // 특정 여행 일정을 여행 일정 ID로 조회
  @Get(':feedId/travelPlan/:travelPlanId')
  async getTravelPlan(@Req() req, @Param('feedId') feedId: string, @Param('travelPlanId') travelPlanId: string) {
    const { userId } = req.user;
    return await this.travelPlanService.findTravelPlan(feedId, travelPlanId, userId);
  }

  // 여행 일정 수정
  @Put(':feedId/travelPlan/:travelPlanId')
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
  @Delete(':feedId/travelPlan/:travelPlanId')
  deleteTravelPlan(@Param('feedId') feedId: string, @Param('travelPlanId') travelPlanId: string) {
    return this.travelPlanService.deleteTravelPlan(feedId, travelPlanId);
  }
}
