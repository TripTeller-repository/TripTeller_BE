import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeedService } from '@feed/feed.service';
import { JwtAuthGuard } from '@common/guards';

@ApiTags('Scrap')
@Controller('scrap')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * 사용자가 스크랩한 게시물 목록 조회
   * @param {object} req - 요청 객체
   * @returns {Promise<ExtractedFeed[]>} 사용자가 스크랩한 게시물 목록
   */
  @Get()
  @ApiOperation({
    summary: '스크랩한 게시물 조회',
    description: '특정 회원이 스크랩한 게시물을 모두 조회한다.',
  })
  @ApiResponse({
    status: 200,
    description: '회원이 스크랩한 게시물 목록을 반환',
    schema: {
      example: [
        {
          feedId: '507f191e810c19729de860ea',
          title: '경주 여행 나들이~',
          content: '수학여행으로만 갔던 경주! 이번에 가니...',
          createdAt: '2024-11-01T08:00:00Z',
          likeCount: 23,
          isPublic: true,
          coverImage: 'http://example.com/cover.jpg',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '사용자가 스크랩한 게시물이 없음' })
  async getScraps(@Req() req) {
    const { userId } = req.user;
    return await this.feedService.fetchScraps(userId);
  }
}
