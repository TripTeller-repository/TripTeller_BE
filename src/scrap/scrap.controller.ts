import { Controller, Post, Delete, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { CreateScrapDto } from './dto/create-scrap.dto';
import { CustomAuthGuard } from 'src/authentication/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Scrap')
@Controller('scrap')
@UseGuards(CustomAuthGuard)
export class ScrapController {
  constructor(private readonly scrapService: ScrapService) {}

  @Get()
  @ApiOperation({ summary: '스크랩한 게시물 조회' })
  async getScraps(@Req() req) {
    const { userId } = req.user;
    return await this.scrapService.fetchScraps(userId);
  }

  @Post()
  @ApiOperation({ summary: '스크랩 등록' })
  async postScrap(@Req() req, @Body() createScrapDto: CreateScrapDto) {
    const { userId } = req.user;
    return await this.scrapService.createScrap(createScrapDto, userId);
  }

  @Delete(':feedId')
  @ApiOperation({ summary: '스크랩 취소' })
  async deleteScrap(@Req() req, @Param('feedId') feedId: string) {
    const { userId } = req.user;
    return await this.scrapService.removeScrap(feedId, userId);
  }
}
