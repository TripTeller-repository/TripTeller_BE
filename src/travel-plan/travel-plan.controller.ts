import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CustomAuthGuard } from 'src/authentication/auth.guard';
import { DailyPlanService } from 'src/daily-plan/daily-plan.service';
import { CreateDailyPlanDto } from 'src/daily-plan/dto/create-daily-plan.dto';
import { PutDailyPlanDto } from 'src/daily-plan/dto/put-daily-plan.dto';

@Controller('travel-plan')
@UseGuards(CustomAuthGuard)
export class TravelPlanController {
  constructor(private readonly dailyPlanService: DailyPlanService) {}

  //////////////////////////////
  //////// DailyPlan  //////////
  //////////////////////////////

  // 일별 일정 조회
  @Get(':travelPlanId/daily-plan/:dailyPlanId')
  async getOneDailyPlan(@Param('travelPlanId') travelPlanId: string, @Param('dailyPlanId') dailyPlanId: string) {
    return this.dailyPlanService.fetchOneDailyPlan(travelPlanId, dailyPlanId);
  }

  // 일별 일정(DailyPlan) 생성
  @Post(':travelPlanId/daily-plan')
  async postDailyPlan(@Param('travelPlanId') travelPlanId: string, @Body() createDailyPlanDto: CreateDailyPlanDto) {
    return this.dailyPlanService.createDailyPlan(createDailyPlanDto, travelPlanId);
  }

  // 일별 일정 수정
  @Put(':travelPlanId/daily-plan/:dailyPlanId')
  async putDailyPlan(
    @Param('travelPlanId') travelPlanId: string,
    @Param('dailyPlanId') dailyPlanId: string,
    @Body() putDailyPlanDto: PutDailyPlanDto,
  ) {
    return this.dailyPlanService.updateDailyPlan(travelPlanId, dailyPlanId, putDailyPlanDto);
  }

  // 일별 일정 삭제
  @Delete(':travelPlanId/daily-plan/:dailyPlanId')
  async deleteDailyPlan(@Param('travelPlanId') travelPlanId: string, @Param('dailyPlanId') dailyPlanId: string) {
    return this.dailyPlanService.deleteDailyPlan(travelPlanId, dailyPlanId);
  }
}
