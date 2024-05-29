import { Controller, Get, HttpException, HttpStatus, Optional, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { Body } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Post } from '@nestjs/common';
import { AuthService } from 'src/authentication/auth.service';

// feed : 본인 게시물 (비공개 게시물) => MyTrip
// feeds : 모든 게시물 (공개 게시물) => OurTrip

@Controller('feeds')
export class FeedsController {
  constructor(
    private readonly feedsService: FeedsService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  // 모든 게시글 조회 (공개)(페이지네이션)
  // feeds?pageNumber=1
  @Get()
  async getPublicFeeds(@Query('pageNumber', ParseIntPipe) pageNumber: number, @Req() req: Request) {
    try {
      // 로그인한 상태인 경우 회원의 userId를 추출
      const authHeader = req.headers['authorization'];
      let userId = null; // userId 기본값을 null로 설정

      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          const decodedToken = await this.authService.verifyToken(token);
          userId = decodedToken ? decodedToken.userId : null;
        }
      }

      return this.feedsService.fetchOurFeeds(pageNumber, userId || null);
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
  // feeds/date?startDate=2023-01-01&endDate=2023-01-31&pageNumber=1
  @Get('date')
  async getFeedsByDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pageNumber', ParseIntPipe) pageNumber: number = 1,
    @Req() req: Request,
  ) {
    try {
      // 로그인한 상태인 경우 회원의 userId를 추출
      const authHeader = req.headers['authorization'];
      let userId = null; // userId 기본값을 null로 설정

      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          const decodedToken = await this.authService.verifyToken(token);
          userId = decodedToken ? decodedToken.userId : null;
        }
      }

      return this.feedsService.fetchFeedsByDate(startDate, endDate, pageNumber, userId || null);
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
  // feeds/order/byRecent?pageNumber=1
  @Get('order/byRecent')
  async getOurFeedsOrderedByRecent(@Query('pageNumber', ParseIntPipe) pageNumber: number = 1, @Req() req: Request) {
    try {
      // 로그인한 상태인 경우 회원의 userId를 추출
      const authHeader = req.headers['authorization'];
      let userId = null; // userId 기본값을 null로 설정

      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          const decodedToken = await this.authService.verifyToken(token);
          userId = decodedToken ? decodedToken.userId : null;
        }
      }

      return this.feedsService.sortOurFeedsByRecent(pageNumber, userId || null);
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
  // // feeds/order/byLikeCount?pageNumber=1
  @Get('order/byLikeCount')
  async getOurFeedsOrderedByLikeCount(@Query('pageNumber', ParseIntPipe) pageNumber: number = 1, @Req() req: Request) {
    try {
      // 로그인한 상태인 경우 회원의 userId를 추출
      const authHeader = req.headers['authorization'];
      let userId = null; // userId 기본값을 null로 설정

      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          const decodedToken = await this.authService.verifyToken(token);
          userId = decodedToken ? decodedToken.userId : null;
        }
      }

      return this.feedsService.sortOurFeedsByLikeCount(pageNumber, userId || null);
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
  // feeds/:feedId
  @Get(':feedId')
  getOnePublicFeed(@Param('feedId') feedId: string) {
    return this.feedsService.fetchOurFeed(feedId);
  }

  // 회원 프로필 정보를 회원 ID로 조회
  // 정보 : 이메일, 프로필 이미지 URL, 닉네임
  // OurTrip => 회원 ID 값으로 조회
  @Post('user-info')
  async getUserInfoOurTrip(@Body('userId') userId: string) {
    return this.userService.getUserInfo(userId);
  }
}
