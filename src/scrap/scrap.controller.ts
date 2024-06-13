import { Controller, Post, Delete, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { CreateScrapDto } from './dto/create-scrap.dto';
import { CustomAuthGuard } from 'src/authentication/auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('scrap')
@UseGuards(CustomAuthGuard)
export class ScrapController {
  constructor(private readonly scrapService: ScrapService) {}
  // 스크랩한 게시물 조회
  @Get()
  @ApiOperation({ summary: '스크랩한 게시물 조회' })
  async getScraps(@Req() req) {
    const { userId } = req.user;
    return await this.scrapService.fetchScraps(userId);
  }

  // 스크랩 등록
  @Post()
  @ApiOperation({ summary: '스크랩 등록' })
  async postScrap(@Req() req, @Body() createScrapDto: CreateScrapDto) {
    const { userId } = req.user;
    return await this.scrapService.createScrap(createScrapDto, userId);
  }

  // 스크랩 취소
  @Delete(':feedId')
  @ApiOperation({ summary: '스크랩 취소' })
  async deleteScrap(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.scrapService.removeScrap(feedId, userId);
  }
}
