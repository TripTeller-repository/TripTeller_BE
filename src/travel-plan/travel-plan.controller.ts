import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomAuthGuard } from 'src/authentication/auth.guard';
import { DailyPlanService } from 'src/daily-plan/daily-plan.service';
import { CreateDailyPlanDto } from 'src/daily-plan/dto/create-daily-plan.dto';
import { PutDailyPlanDto } from 'src/daily-plan/dto/put-daily-plan.dto';

@ApiTags('DailyPlan')
@Controller('travel-plan')
@UseGuards(CustomAuthGuard)
export class TravelPlanController {
  constructor(private readonly dailyPlanService: DailyPlanService) {}

  //////////////////////////////
  //////// DailyPlan  //////////
  //////////////////////////////

  @Get(':travelPlanId/daily-plan/:dailyPlanId')
  @ApiOperation({ summary: '일별 일정 조회' })
  async getOneDailyPlan(@Param('travelPlanId') travelPlanId: string, @Param('dailyPlanId') dailyPlanId: string) {
    return this.dailyPlanService.fetchOneDailyPlan(travelPlanId, dailyPlanId);
  }

  @Post(':travelPlanId/daily-plan')
  @ApiOperation({ summary: '일별 일정 생성' })
  async postDailyPlan(@Param('travelPlanId') travelPlanId: string, @Body() createDailyPlanDto: CreateDailyPlanDto) {
    return this.dailyPlanService.createDailyPlan(createDailyPlanDto, travelPlanId);
  }

  @Put(':travelPlanId/daily-plan/:dailyPlanId')
  @ApiOperation({ summary: '일별 일정 수정' })
  async putDailyPlan(
    @Param('travelPlanId') travelPlanId: string,
    @Param('dailyPlanId') dailyPlanId: string,
    @Body() putDailyPlanDto: PutDailyPlanDto,
  ) {
    return this.dailyPlanService.updateDailyPlan(travelPlanId, dailyPlanId, putDailyPlanDto);
  }

  @Delete(':travelPlanId/daily-plan/:dailyPlanId')
  @ApiOperation({ summary: '일별 일정 삭제' })
  async deleteDailyPlan(@Param('travelPlanId') travelPlanId: string, @Param('dailyPlanId') dailyPlanId: string) {
    return this.dailyPlanService.deleteDailyPlan(travelPlanId, dailyPlanId);
  }
}
