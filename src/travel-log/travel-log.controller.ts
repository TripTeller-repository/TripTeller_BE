import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/authentication/auth.guard';
import { PutTravelLogImageDto } from 'src/travel-log/dto/put-travel-log-image.dto';
import { PutTravelLogPostContentDto } from 'src/travel-log/dto/put-travel-log-post-content.dto';
import { TravelLogService } from 'src/travel-log/travel-log.service';

@ApiTags('TravelLog')
@Controller('')
@UseGuards(AuthGuard)
export class TravelLogController {
  constructor(private readonly travelLogService: TravelLogService) {}

  @Get('dailySchedule/:dailyScheduleId/travel-log')
  @ApiOperation({ summary: '여행 로그 조회', description: '특정 dailyScheduleId에 해당하는 여행 로그를 조회합니다.' })
  @ApiParam({
    name: 'dailyScheduleId',
    description: '여행 로그를 조회할 dailySchedule의 ID',
    type: String,
    example: '507f191e810c19729de860ea',
  })
  @ApiResponse({
    status: 200,
    description: '여행 로그가 성공적으로 조회되었습니다.',
    schema: {
      example: {
        dailyScheduleId: '507f191e810c19729de860ea',
        postContent: '오늘은 제주도 여행을 다녀왔어요!',
        imageUrl: 'https://my-bucket.s3.us-west-2.amazonaws.com/travel-log-image.jpg',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 여행 로그를 찾을 수 없습니다.',
  })
  async getOneTravelLog(@Param('dailyScheduleId') dailyScheduleId: string) {
    return this.travelLogService.fetchOneTravelLog(dailyScheduleId);
  }

  @Get('travel-log-image-signed-url/:fileName')
  @ApiOperation({
    summary: 'AWS S3 프로필 이미지 Signed URL 불러오기',
    description: 'AWS S3에서 여행 로그 이미지를 위한 Signed URL을 생성합니다.',
  })
  @ApiParam({
    name: 'fileName',
    description: '이미지 파일 이름',
    type: String,
    example: 'travel-log-image.jpg',
  })
  @ApiResponse({
    status: 200,
    description: '이미지의 Signed URL이 성공적으로 반환됩니다.',
    schema: {
      example: {
        signedUrl:
          'https://my-bucket.s3.us-west-2.amazonaws.com/travel-log-image.jpg?AWSAccessKeyId=AKIA...&Expires=...&Signature=...',
      },
    },
  })
  async getTravelLogImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.travelLogService.fetchTravelLogImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  @Put('dailySchedule/:dailyScheduleId/travel-log/post-content')
  @ApiOperation({ summary: '여행 로그 글 등록', description: '여행 로그의 내용을 등록합니다.' })
  @ApiParam({
    name: 'dailyScheduleId',
    description: '여행 로그를 등록할 dailySchedule의 ID',
    type: String,
    example: '507f191e810c19729de860ea',
  })
  @ApiBody({
    description: '여행 로그 내용',
    type: PutTravelLogPostContentDto,
    examples: {
      example1: {
        value: {
          postContent: '오늘은 제주도 여행을 다녀왔어요!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '여행 로그 내용이 성공적으로 등록되었습니다.',
    schema: {
      example: {
        postContent: '오늘은 제주도 여행을 다녀왔어요!',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 입력 값 또는 길이가 100자를 초과한 경우.',
  })
  async putTravelLogPostContent(
    @Param('dailyScheduleId') dailyScheduleId: string,
    @Body() putTravelLogPostContentDto: PutTravelLogPostContentDto,
  ) {
    return this.travelLogService.updateTravelLogPostContent(dailyScheduleId, putTravelLogPostContentDto);
  }

  @Put('dailySchedule/:dailyScheduleId/travel-log/image')
  @ApiOperation({ summary: '여행 로그 이미지 등록', description: '여행 로그 이미지를 등록합니다.' })
  @ApiParam({
    name: 'dailyScheduleId',
    description: '여행 로그를 등록할 dailySchedule의 ID',
    type: String,
    example: '507f191e810c19729de860ea',
  })
  @ApiBody({
    description: '여행 로그 이미지 URL',
    type: PutTravelLogImageDto,
    examples: {
      example1: {
        value: {
          imageUrl: 'https://my-bucket.s3.us-west-2.amazonaws.com/travel-log-image.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '여행 로그 이미지가 성공적으로 등록되었습니다.',
    schema: {
      example: {
        imageUrl: 'https://my-bucket.s3.us-west-2.amazonaws.com/travel-log-image.jpg',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '이미지 등록 중 오류 발생.',
  })
  async putTravelLogImage(
    @Param('dailyScheduleId') dailyScheduleId: string,
    @Body() putTravelLogImageDto: PutTravelLogImageDto,
  ) {
    return this.travelLogService.updateTravelLogImage(dailyScheduleId, putTravelLogImageDto);
  }

  @Delete('dailySchedule/:dailyScheduleId/travel-log')
  @ApiOperation({ summary: '여행 로그 삭제', description: '특정 여행 로그를 삭제합니다.' })
  @ApiParam({
    name: 'dailyScheduleId',
    description: '삭제할 여행 로그의 dailySchedule ID',
    type: String,
    example: '507f191e810c19729de860ea',
  })
  @ApiResponse({
    status: 200,
    description: '여행 로그가 성공적으로 삭제되었습니다.',
    schema: {
      example: {
        message: '여행 로그가 삭제되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 여행 로그를 찾을 수 없습니다.',
  })
  async deleteTravelLog(@Param('dailyScheduleId') dailyScheduleId: string) {
    return this.travelLogService.deleteTravelLog(dailyScheduleId);
  }
}
