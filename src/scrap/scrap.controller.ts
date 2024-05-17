import { Controller, Post, Delete, Get, Param, Body, Req } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { CreateScrapDto } from './dto/createScrap.dto';

@Controller('scrap')
export class ScrapController {
  constructor(private readonly scrapService: ScrapService) {}
  // 스크랩한 게시물 조회
  @Get()
  async getScraps(@Req() req) {
    const { userId } = req.user;
    return await this.scrapService.fetchScraps(userId);
  }

  // 스크랩 등록
  @Post()
  async postScrap(@Req() req, @Body() createScrapDto: CreateScrapDto) {
    const { userId } = req.user;
    return await this.scrapService.createScrap(createScrapDto, userId);
  }

  // 스크랩 취소
  @Delete(':feedId')
  async deleteScrap(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.scrapService.removeScrap(feedId, userId);
  }
}
