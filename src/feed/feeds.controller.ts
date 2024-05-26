// import { Controller, Get, HttpException, HttpStatus, Optional, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
// import { FeedsService } from './feeds.service';
// import { Body } from '@nestjs/common';
// import { UserService } from 'src/user/user.service';
// import { Post } from '@nestjs/common';

// // feed : 본인 게시물 (비공개 게시물) => MyTrip
// // feeds : 모든 게시물 (공개 게시물) => OurTrip

// @Controller('feeds')
// export class FeedsController {
//   constructor(
//     private readonly feedsService: FeedsService,
//     private readonly userService: UserService,
//   ) {}

//   // 모든 게시글 조회 (공개)(페이지네이션)
//   // feeds?pageNumber=1
//   @Get()
//   async getPublicFeedsPagination(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req: Request) {
//     try {
//       const userId = req.user
//       return this.feedsService.fetchPublicFeedsPaginated(pageNumber, userId);
//     } catch (error) {
//       throw new HttpException(
//         {
//           status: HttpStatus.INTERNAL_SERVER_ERROR,
//           error: 'Failed to fetch public feeds',
//         },
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   // 모든 공개 게시물 기간별 조회
//   // feeds/date?startDate=2023-01-01&endDate=2023-01-31&pageNumber=1
//   @Get('date')
//   getFeedsByDate(
//     @Query('startDate') startDate: string,
//     @Query('endDate') endDate: string,
//     @Query('pageNumber', ParseIntPipe) pageNumber: number = 1,
//     @Query('pageSize', ParseIntPipe) pageSize: number = 9,
//     @Req() req: Request,
//   ) {
//     const userId = req.user?.userId;
//     return this.feedsService.fetchFeedsByDate(startDate, endDate, pageNumber, pageSize, userId);
//   }

//   // 모든 공개 게시글 정렬 : 최신순 (페이지네이션)
//   // feeds/order/byRecent?pageNumber=1
//   @Get('order/byRecent')
//   getPublicFeedsOrderedByRecent(
//     @Query('pageNumber', ParseIntPipe) pageNumber: number = 1,
//     @Query('pageSize', ParseIntPipe) pageSize: number = 9,
//     @Req() req: Request,
//   ) {
//     const userId = req.user?.userId;
//     return this.feedsService.sortPublicByRecent(pageNumber, pageSize, userId);
//   }

//   // 모든 공개 게시글 정렬 : 인기순 (페이지네이션)
//   // feeds/order/byLikeCount?pageNumber=1
//   @Get('order/byLikeCount')
//   getPublicFeedsOrderedByLikeCount(
//     @Query('pageNumber', ParseIntPipe) pageNumber: number = 1,
//     @Optional() @Query('pageSize', ParseIntPipe) pageSize: number = 9,
//   ) {
//     return this.feedsService.sortPublicByLikeCount(pageNumber, pageSize);
//   }

//   // 게시물 ID로 특정 게시물 조회 (공개)
//   // feeds/:feedId
//   @Get(':feedId')
//   getOnePublicFeed(@Param('feedId') feedId: string) {
//     return this.feedsService.fetchOnePublicFeed(feedId);
//   }

//   // // 게시물 ID로 특정 게시물 조회 (공개)
//   // // feeds/:feedId
//   // @Get(':feedId')
//   // getOnePublicFeed(@Param('feedId') feedId: string) {
//   //   return this.feedsService.fetchOnePublicFeed(feedId);
//   // }

//   // 회원 프로필 정보를 회원 ID로 조회
//   // 정보 : 이메일, 프로필 이미지 URL, 닉네임
//   // OurTrip => 회원 ID 값으로 조회
//   @Post('user/info')
//   async getUserInfoOurTrip(@Body('userId') userId: string) {
//     return this.userService.getUserInfo(userId);
//   }
// }
