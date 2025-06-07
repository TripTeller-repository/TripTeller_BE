import { Controller, Post, Delete, Get, Param, Body, Req, Put, UseGuards } from '@nestjs/common';
import { TravelPlanService } from '../travel-plan/travel-plan.service';
import { CreateTravelPlanDto } from '../travel-plan/dto/create-travel-plan.dto';
import { PutTravelPlanDto } from '../travel-plan/dto/put-travel-plan.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards';

@ApiTags('TravelPlan')
@Controller('my-trip')
@UseGuards(JwtAuthGuard)
export class TravelPlanController {
  constructor(private readonly travelPlanService: TravelPlanService) {}

  @Post(':feedId/travel-plan')
  @ApiOperation({
    summary: '여행 일정 등록',
    description:
      '특정 피드에 새로운 여행 일정을 등록한다. 여행 일정을 등록하면, 해당 일정에 맞춰 자동으로 일별 계획이 생성된다.',
  })
  @ApiParam({ name: 'feedId', description: '여행 일정의 Feed ID' })
  @ApiBody({
    type: CreateTravelPlanDto,
    description: '여행 일정 등록에 필요한 정보',
    examples: {
      example1: {
        value: {
          title: '겨울 여행',
          region: 'SEOUL',
          numberOfPeople: 4,
          totalExpense: 100000,
          startDate: '2024-12-01',
          endDate: '2024-12-07',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '여행 일정이 성공적으로 등록됨',
    schema: {
      example: {
        _id: '605c72ef153207001f6470f',
        title: '겨울 여행',
        region: 'SEOUL',
        numberOfPeople: 4,
        totalExpense: 100000,
        startDate: '2024-12-01T00:00:00.000Z',
        endDate: '2024-12-07T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 입력 값' })
  async postTravelPlan(@Req() req, @Param('feedId') feedId: string, @Body() createTravelPlanDto: CreateTravelPlanDto) {
    const { userId } = req.user;
    return await this.travelPlanService.createTravelPlan(feedId, createTravelPlanDto, userId);
  }

  @Get(':feedId/travel-plan/:travelPlanId')
  @ApiOperation({
    summary: '특정 여행 일정을 여행 일정 ID로 조회',
    description: '여행 일정 ID를 통해 특정 여행 일정을 조회한다. 해당 일정의 상세 정보를 포함하여 반환된다.',
  })
  @ApiParam({ name: 'feedId', description: 'Feed ID' })
  @ApiResponse({
    status: 200,
    description: '여행 일정을 성공적으로 조회',
    schema: {
      example: {
        _id: '605c72ef153207001f6470f',
        title: '겨울 여행',
        region: 'SEOUL',
        numberOfPeople: 4,
        totalExpense: 100000,
        startDate: '2024-12-01T00:00:00.000Z',
        endDate: '2024-12-07T00:00:00.000Z',
        dailySchedules: [],
        dailyPlans: [],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '여행 일정을 성공적으로 조회',
    schema: {
      example: {
        _id: '605c72ef153207001f6470f',
        title: '겨울 여행',
        region: 'SEOUL',
        numberOfPeople: 4,
        totalExpense: 100000,
        startDate: '2024-12-01T00:00:00.000Z',
        endDate: '2024-12-07T00:00:00.000Z',
        dailySchedules: [],
        dailyPlans: [],
      },
    },
  })
  @ApiResponse({ status: 404, description: '여행 일정을 찾을 수 없음' })
  async getTravelPlan(@Req() req, @Param('feedId') feedId: string, @Param('travelPlanId') travelPlanId: string) {
    const { userId } = req.user;
    return await this.travelPlanService.fetchTravelPlan(feedId, travelPlanId, userId);
  }

  @Put(':feedId/travel-plan/:travelPlanId')
  @ApiOperation({
    summary: '여행 일정 수정',
    description: '기존의 여행 일정을 수정한다. 일정의 시작일과 종료일을 포함하여 기타 정보를 변경할 수 있다.',
  })
  @ApiParam({ name: 'feedId', description: 'Feed ID' })
  @ApiParam({ name: 'travelPlanId', description: '여행 일정 ID' })
  @ApiBody({
    type: PutTravelPlanDto,
    description: '여행 일정 수정에 필요한 정보',
    examples: {
      example1: {
        value: {
          title: '겨울 여행 수정',
          region: 'SEOUL',
          numberOfPeople: 5,
          totalExpense: 120000,
          startDate: '2024-12-02',
          endDate: '2024-12-08',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '여행 일정이 성공적으로 수정됨',
    schema: {
      example: {
        _id: '605c72ef153207001f6470f',
        title: '겨울 여행 수정',
        region: 'SEOUL',
        numberOfPeople: 5,
        totalExpense: 120000,
        startDate: '2024-12-02T00:00:00.000Z',
        endDate: '2024-12-08T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: '여행 일정을 찾을 수 없음' })
  async putTravelPlan(
    @Req() req,
    @Param('feedId') feedId: string,
    @Param('travelPlanId') travelPlanId: string,
    @Body() putTravelPlanDto: PutTravelPlanDto,
  ) {
    const { userId } = req.user;
    return await this.travelPlanService.updateTravelPlan(feedId, travelPlanId, putTravelPlanDto, userId);
  }

  @Delete(':feedId/travel-plan/:travelPlanId')
  @ApiOperation({
    summary: '여행 일정 삭제',
    description: '지정한 여행 일정을 삭제한다.',
  })
  @ApiParam({ name: 'feedId', description: 'Feed ID' })
  @ApiParam({ name: 'travelPlanId', description: '삭제할 여행 일정 ID' })
  @ApiResponse({
    status: 200,
    description: '여행 일정이 성공적으로 삭제됨',
    schema: {
      example: {
        message: '여행 일정이 삭제되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 404, description: '여행 일정을 찾을 수 없음' })
  async deleteTravelPlan(@Param('feedId') feedId: string, @Param('travelPlanId') travelPlanId: string) {
    return this.travelPlanService.removeTravelPlan(feedId, travelPlanId);
  }
}
