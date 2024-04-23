import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateDailyPlanDto } from 'src/dailyPlan/dto/createDailyPlan.dto';
import { PutDailyPlanDto } from 'src/dailyPlan/dto/putDailyPlan.dto';
import { DailyPlanService } from 'src/dailyPlan/dailyPlan.service';

@Controller('travelPlan')
export class TravelPlanController {
  constructor(private readonly dailyPlanService: DailyPlanService) {}

  //////////////////////////////
  //////// DailyPlan  //////////
  //////////////////////////////

  // 일별 일정 조회
  @Get(':travelPlanId/dailyPlan/:dailyPlanId')
  async getDailyPlanOne(@Param('travelPlanId') travelPlanId: string, @Param('dailyPlanId') dailyPlanId: string) {
    return this.dailyPlanService.findDailyPlanOne(travelPlanId, dailyPlanId);
  }

  // 일별 일정(DailyPlan) 생성
  @Post(':travelPlanId/dailyPlan')
  async createDailyPlan(@Param('travelPlanId') travelPlanId: string, @Body() createDailyPlanDto: CreateDailyPlanDto) {
    return this.dailyPlanService.createDailyPlan(createDailyPlanDto, travelPlanId);
  }

  // 일별 일정 수정
  @Put(':travelPlanId/dailyPlan/:dailyPlanId')
  async putDailyPlan(
    @Param('travelPlanId') travelPlanId: string,
    @Param('dailyPlanId') dailyPlanId: string,
    @Body() putDailyPlanDto: PutDailyPlanDto,
  ) {
    return this.dailyPlanService.updateDailyPlan(travelPlanId, dailyPlanId, putDailyPlanDto);
  }

  // 일별 일정 삭제
  @Delete(':travelPlanId/dailyPlan/:dailyPlanId')
  async removeDailyPlan(@Param('travelPlanId') travelPlanId: string, @Param('dailyPlanId') dailyPlanId: string) {
    return this.dailyPlanService.deleteDailyPlan(travelPlanId, dailyPlanId);
  }
}
