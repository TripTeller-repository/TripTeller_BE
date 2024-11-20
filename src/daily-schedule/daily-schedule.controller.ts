import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateDailyScheduleDto } from '../daily-schedule/dto/create-daily-schedule.dto';
import { PutDailyScheduleDto } from '../daily-schedule/dto/put-daily-schedule.dto';
import { DailyScheduleService } from '../daily-schedule/daily-schedule.service';
import { CustomAuthGuard } from '../authentication/auth.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('DailySchedule')
@Controller('daily-plan')
@UseGuards(CustomAuthGuard)
export class DailyScheduleController {
  constructor(private readonly dailyScheduleService: DailyScheduleService) {}

  @Get(':dailyPlanId/daily-schedule/:dailyScheduleId')
  @ApiOperation({ summary: '개별 일정 조회', description: '특정 일별 일정에 대한 개별 일정을 조회한다.' })
  @ApiParam({
    name: 'dailyPlanId',
    description: '일별 일정 ID',
    type: String,
  })
  @ApiParam({
    name: 'dailyScheduleId',
    description: '조회할 개별 일정 ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '개별 일정 조회 성공',
    schema: {
      example: {
        _id: '607d1f77bcf86cd799439011',
        dailyPlanId: '607d1f77bcf86cd799439012',
        time: '2024-12-15T10:00:00Z',
        location: '서울',
        memo: '방문할 장소에 대한 추가 정보',
        postContent: '긴 여행 로그 내용...',
        imageUrl: 'https://example.com/image.jpg',
        isThumbnail: true,
        deletedAt: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 일정이 존재하지 않음',
  })
  async getOneDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('dailyScheduleId') dailyScheduleId: string,
  ) {
    return this.dailyScheduleService.fetchOneDailySchedule(dailyScheduleId);
  }

  @Post(':dailyPlanId/daily-schedule')
  @ApiOperation({ summary: '개별 일정 생성', description: '새로운 개별 일정을 생성한다.' })
  @ApiParam({
    name: 'dailyPlanId',
    description: '일별 일정 ID',
    type: String,
  })
  @ApiBody({
    description: '생성할 개별 일정의 정보',
    type: CreateDailyScheduleDto,
    examples: {
      'application/json': {
        value: {
          time: '2024-12-15T10:00:00Z',
          location: '서울',
          memo: '방문할 장소에 대한 추가 정보',
          postContent: '긴 여행 로그 내용...',
          imageUrl: 'https://example.com/image.jpg',
          isThumbnail: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '개별 일정 생성 성공',
    schema: {
      example: {
        _id: '607d1f77bcf86cd799439011',
        dailyPlanId: '607d1f77bcf86cd799439012',
        time: '2024-12-15T10:00:00Z',
        location: '서울',
        memo: '방문할 장소에 대한 추가 정보',
        postContent: '긴 여행 로그 내용...',
        imageUrl: 'https://example.com/image.jpg',
        isThumbnail: true,
        deletedAt: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '일별 계획을 찾을 수 없음',
  })
  async postDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Body() createDailyScheduleDto: CreateDailyScheduleDto,
  ) {
    const createdSchedule = this.dailyScheduleService.createDailySchedule(createDailyScheduleDto, dailyPlanId);
    return createdSchedule;
  }

  @Put(':dailyPlanId/daily-schedule/:dailyScheduleId')
  @ApiOperation({ summary: '개별 일정 수정', description: '기존 개별 일정을 수정한다.' })
  @ApiParam({
    name: 'dailyPlanId',
    description: '일별 일정 ID',
    type: String,
  })
  @ApiParam({
    name: 'dailyScheduleId',
    description: '수정할 개별 일정 ID',
    type: String,
  })
  @ApiBody({
    description: '수정할 개별 일정의 정보',
    type: PutDailyScheduleDto,
    examples: {
      'application/json': {
        value: {
          time: '2024-12-15T14:00:00Z',
          location: '부산',
          memo: '새로운 여행지에 대한 추가 정보',
          postContent: '긴 여행 로그 내용...',
          imageUrl: 'https://example.com/image2.jpg',
          isThumbnail: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '개별 일정 수정 성공',
    schema: {
      example: {
        _id: '607d1f77bcf86cd799439011',
        dailyPlanId: '607d1f77bcf86cd799439012',
        time: '2024-12-15T14:00:00Z',
        location: '부산',
        memo: '새로운 여행지에 대한 추가 정보',
        postContent: '긴 여행 로그 내용...',
        imageUrl: 'https://example.com/image2.jpg',
        isThumbnail: false,
        deletedAt: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 개별 일정이 존재하지 않음',
  })
  async putDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('dailyScheduleId') dailyScheduleId: string,
    @Body() putDailyScheduleDto: PutDailyScheduleDto,
  ) {
    return this.dailyScheduleService.updateDailySchedule(dailyScheduleId, putDailyScheduleDto);
  }

  @Delete(':dailyPlanId/daily-schedule/:dailyScheduleId')
  @ApiOperation({ summary: '개별 일정 삭제', description: '특정 개별 일정을 삭제한다.' })
  @ApiParam({
    name: 'dailyPlanId',
    description: '일별 일정 ID',
    type: String,
  })
  @ApiParam({
    name: 'dailyScheduleId',
    description: '삭제할 개별 일정 ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '개별 일정 삭제 성공',
    schema: {
      example: { message: '일정이 삭제되었습니다.' },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 개별 일정이 존재하지 않음',
  })
  async deleteDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('dailyScheduleId') dailyScheduleId: string,
  ) {
    return this.dailyScheduleService.deleteDailySchedule(dailyPlanId, dailyScheduleId);
  }
}
