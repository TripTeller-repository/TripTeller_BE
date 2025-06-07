import { Controller, Post, Delete, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { CreateScrapDto } from './dto/create-scrap.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards';

@ApiTags('Scrap')
@Controller('scrap')
@UseGuards(JwtAuthGuard)
export class ScrapController {
  constructor(private readonly scrapService: ScrapService) {}

  @Get()
  @ApiOperation({
    summary: '스크랩한 게시물 조회',
    description: '특정 회원이 스크랩한 게시물을 모두 조회한다.',
  })
  @ApiResponse({
    status: 200,
    description: '회원이 스크랩한 게시물 목록을 반환합니다.',
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
    return await this.scrapService.fetchScraps(userId);
  }

  @Post()
  @ApiOperation({
    summary: '스크랩 등록',
    description: '게시물을 스크랩 목록에 등록한다. 이미 스크랩한 게시물은 다시 스크랩할 수 없다.',
  })
  @ApiBody({
    description: '스크랩할 게시물의 고유 ID',
    type: CreateScrapDto,
    schema: {
      example: {
        feedId: '507f191e810c19729de860ea',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '스크랩이 성공적으로 등록되었습니다.',
    schema: {
      example: {
        userId: 'user123',
        feedId: '507f191e810c19729de860ea',
        createdAt: '2024-11-01T08:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (예: 자신이 작성한 게시물 스크랩 시도)' })
  @ApiResponse({ status: 404, description: '게시물 또는 사용자를 찾을 수 없음' })
  async postScrap(@Req() req, @Body() createScrapDto: CreateScrapDto) {
    const { userId } = req.user;
    return await this.scrapService.createScrap(createScrapDto, userId);
  }

  @Delete(':feedId')
  @ApiOperation({
    summary: '스크랩 취소',
    description: '스크랩한 게시물을 취소한다. 취소 후 게시물의 좋아요 수는 1 감소한다.',
  })
  @ApiParam({
    name: 'feedId',
    description: '취소할 스크랩의 게시물 ID',
    type: String,
    example: '507f191e810c19729de860ea',
  })
  @ApiResponse({
    status: 200,
    description: '스크랩이 성공적으로 취소되었습니다.',
    schema: {
      example: {
        message: '스크랩이 취소되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 404, description: '스크랩을 찾을 수 없음' })
  async deleteScrap(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.scrapService.removeScrap(feedId, userId);
  }
}
