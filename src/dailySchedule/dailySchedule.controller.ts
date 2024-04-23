import { Body, Controller, Delete, Get, Param, Put, Req } from '@nestjs/common';
import { PutTravelLogImageDto } from 'src/travelLog/dto/putTravelLogImage.dto';
import { PutTravelLogPostContentDto } from 'src/travelLog/dto/putTravelLogPostContent.dto';
import { TravelLogService } from 'src/travelLog/travelLog.service';

@Controller('dailySchedule')
export class DailyScheduleController {
  constructor(private readonly travelLogService: TravelLogService) {}

  // 여행 로그 조회
  @Get(':dailyScheduleId/travelLog')
  async getTravelLogOne(@Param('dailyScheduleId') dailyScheduleId: string) {
    return this.travelLogService.findTravelLogOne(dailyScheduleId);
  }

  // AWS S3 프로필 이미지 Signed URL 불러오기
  @Get('travel-log-image-signed-url/:fileName')
  async getTravelLogImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.travelLogService.getTravelLogImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  // 여행 로그 글 등록
  @Put(':dailyScheduleId/travelLog/postContent')
  async putTravelLogPostContent(
    @Param('dailyScheduleId') dailyScheduleId: string,
    @Body() putTravelLogPostContentDto: PutTravelLogPostContentDto,
  ) {
    return this.travelLogService.updateTravelLogPostContent(dailyScheduleId, putTravelLogPostContentDto);
  }

  // 여행 로그 이미지 등록
  @Put(':dailyScheduleId/travelLog/image')
  async putTravelLogImage(
    @Param('dailyScheduleId') dailyScheduleId: string,
    @Body() putTravelLogImageDto: PutTravelLogImageDto,
  ) {
    return this.travelLogService.updateTravelLogImage(dailyScheduleId, putTravelLogImageDto);
  }

  // 여행 로그 삭제
  @Delete(':dailyScheduleId/travelLog')
  async removeTravelLog(@Param('dailyScheduleId') dailyScheduleId: string) {
    return this.travelLogService.deleteTravelLog(dailyScheduleId);
  }
}
