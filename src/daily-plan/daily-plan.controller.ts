import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/authentication/auth.guard';
import { DailyPlanService } from 'src/daily-plan/daily-plan.service';
import { CreateDailyPlanDto } from 'src/daily-plan/dto/create-daily-plan.dto';
import { PutDailyPlanDto } from 'src/daily-plan/dto/put-daily-plan.dto';

@ApiTags('DailyPlan')
@Controller('travel-plan')
@UseGuards(AuthGuard)
export class DailyPlanController {
  constructor(private readonly dailyPlanService: DailyPlanService) {}

  @Get(':travelPlanId/daily-plan/:dailyPlanId')
  @ApiOperation({ summary: '일별 일정 조회', description: '특정 여행 계획에 대한 일별 일정을 조회한다.' })
  @ApiParam({
    name: 'travelPlanId',
    description: '여행 계획 ID',
    type: String,
  })
  @ApiParam({
    name: 'dailyPlanId',
    description: '일별 일정 ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '일별 일정 조회 성공',
    schema: {
      example: {
        _id: '607d1f77bcf86cd799439011',
        travelPlanId: '607d1f77bcf86cd799439012',
        dateType: 'DATE',
        date: '2024-12-15',
        dateString: '2024-12-15',
        deletedAt: null,
        dailySchedules: [
          {
            _id: '607d1f77bcf86cd799439013',
            time: '2024-12-15T08:00:00Z',
            location: '여행지1',
            memo: '기타 정보',
            postContent: '긴 여행 로그 내용',
            imageUrl: 'https://example.com/image.jpg',
            isThumbnail: true,
            deletedAt: null,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '일별 일정을 찾을 수 없습니다.',
  })
  async getOneDailyPlan(@Param('travelPlanId') travelPlanId: string, @Param('dailyPlanId') dailyPlanId: string) {
    return this.dailyPlanService.fetchOneDailyPlan(travelPlanId, dailyPlanId);
  }

  @Post(':travelPlanId/daily-plan')
  @ApiOperation({ summary: '일별 일정 생성', description: '새로운 일별 일정을 생성한다.' })
  @ApiParam({
    name: 'travelPlanId',
    description: '여행 계획 ID',
    type: String,
  })
  @ApiBody({
    description: '새로운 일별 일정의 날짜를 포함하는 객체 (date만 수정됨)',
    type: CreateDailyPlanDto,
    examples: {
      'application/json': {
        value: {
          date: '2024-12-15',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '새로운 일별 일정 생성 성공',
    schema: {
      example: {
        _id: '607d1f77bcf86cd799439011',
        travelPlanId: '607d1f77bcf86cd799439012',
        dateType: 'DATE',
        date: '2024-12-15',
        dateString: '2024-12-15',
        deletedAt: null,
        dailySchedules: [],
        expenses: [],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '여행 계획을 찾을 수 없습니다.',
  })
  async postDailyPlan(@Param('travelPlanId') travelPlanId: string, @Body() createDailyPlanDto: CreateDailyPlanDto) {
    return this.dailyPlanService.createDailyPlan(createDailyPlanDto, travelPlanId);
  }

  @Put(':travelPlanId/daily-plan/:dailyPlanId')
  @ApiOperation({ summary: '일별 일정 수정', description: '기존 일별 일정을 수정한다.' })
  @ApiParam({
    name: 'travelPlanId',
    description: '여행 계획 ID',
    type: String,
  })
  @ApiParam({
    name: 'dailyPlanId',
    description: '수정할 일별 일정 ID',
    type: String,
  })
  @ApiBody({
    description: '수정할 일별 일정의 날짜만 포함하는 객체 (date만 수정됨)',
    type: PutDailyPlanDto,
    examples: {
      'application/json': {
        value: {
          date: '2024-05-15',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '일별 일정 수정 성공',
    schema: {
      example: {
        _id: '607d1f77bcf86cd799439011',
        travelPlanId: '607d1f77bcf86cd799439012',
        dateType: 'DATE',
        date: '2024-05-15',
        dateString: '2024-05-15',
        deletedAt: null,
        dailySchedules: [],
        expenses: [],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 일별 일정이 존재하지 않습니다.',
  })
  async putDailyPlan(
    @Param('travelPlanId') travelPlanId: string,
    @Param('dailyPlanId') dailyPlanId: string,
    @Body() putDailyPlanDto: PutDailyPlanDto,
  ) {
    return this.dailyPlanService.updateDailyPlan(travelPlanId, dailyPlanId, putDailyPlanDto);
  }

  @Delete(':travelPlanId/daily-plan/:dailyPlanId')
  @ApiOperation({ summary: '일별 일정 삭제', description: '특정 일별 일정을 삭제한다.' })
  @ApiParam({
    name: 'travelPlanId',
    description: '여행 계획 ID',
    type: String,
  })
  @ApiParam({
    name: 'dailyPlanId',
    description: '삭제할 일별 일정 ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '일별 일정 삭제 성공',
    schema: {
      example: { message: '날짜별 일정이 삭제되었습니다.' },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 일별 일정이 존재하지 않습니다.',
  })
  async deleteDailyPlan(@Param('travelPlanId') travelPlanId: string, @Param('dailyPlanId') dailyPlanId: string) {
    return this.dailyPlanService.deleteDailyPlan(travelPlanId, dailyPlanId);
  }
}
