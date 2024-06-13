import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CustomAuthGuard } from 'src/authentication/auth.guard';
import { PutTravelLogImageDto } from 'src/travel-log/dto/put-travel-log-image.dto';
import { PutTravelLogPostContentDto } from 'src/travel-log/dto/put-travel-log-post-content.dto';
import { TravelLogService } from 'src/travel-log/travel-log.service';

@Controller('daily-schedule')
@UseGuards(CustomAuthGuard)
export class DailyScheduleController {
  constructor(private readonly travelLogService: TravelLogService) {}

  // 여행 로그 조회
  @Get(':dailyScheduleId/travel-log')
  @ApiOperation({ summary: '여행 로그 조회' })
  async getOneTravelLog(@Param('dailyScheduleId') dailyScheduleId: string) {
    return this.travelLogService.fetchOneTravelLog(dailyScheduleId);
  }

  // AWS S3 프로필 이미지 Signed URL 불러오기
  @Get('travel-log-image-signed-url/:fileName')
  @ApiOperation({ summary: 'AWS S3 프로필 이미지 Signed URL 불러오기' })
  async getTravelLogImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.travelLogService.fetchTravelLogImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  // 여행 로그 글 등록
  @Put(':dailyScheduleId/travel-log/post-content')
  @ApiOperation({ summary: '여행 로그 글 등록' })
  async putTravelLogPostContent(
    @Param('dailyScheduleId') dailyScheduleId: string,
    @Body() putTravelLogPostContentDto: PutTravelLogPostContentDto,
  ) {
    return this.travelLogService.updateTravelLogPostContent(dailyScheduleId, putTravelLogPostContentDto);
  }

  // 여행 로그 이미지 등록
  @Put(':dailyScheduleId/travel-log/image')
  @ApiOperation({ summary: '여행 로그 이미지 등록' })
  async putTravelLogImage(
    @Param('dailyScheduleId') dailyScheduleId: string,
    @Body() putTravelLogImageDto: PutTravelLogImageDto,
  ) {
    return this.travelLogService.updateTravelLogImage(dailyScheduleId, putTravelLogImageDto);
  }

  // 여행 로그 삭제
  @Delete(':dailyScheduleId/travel-log')
  @ApiOperation({ summary: '여행 로그 삭제' })
  async deleteTravelLog(@Param('dailyScheduleId') dailyScheduleId: string) {
    return this.travelLogService.deleteTravelLog(dailyScheduleId);
  }
}
