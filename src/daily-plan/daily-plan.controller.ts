import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateDailyScheduleDto } from '../daily-schedule/dto/create-daily-schedule.dto';
import { PutDailyScheduleDto } from '../daily-schedule/dto/put-daily-schedule.dto';
import { ExpenseService } from '../expense/expense.service';
import { DailyScheduleService } from '../daily-schedule/daily-schedule.service';
import { CreateExpenseDto } from 'src/expense/dto/create-expense.dto';
import { PutExpenseDto } from 'src/expense/dto/put-expense.dto';
import { CustomAuthGuard } from '../authentication/auth.guard';

@Controller('dailyPlan')
@UseGuards(CustomAuthGuard)
export class DailyPlanController {
  constructor(
    private readonly dailyScheduleService: DailyScheduleService,
    private readonly expenseService: ExpenseService,
  ) {}

  //////////////////////////////////
  ///////// DailySchedule //////////
  //////////////////////////////////

  // 개별 일정 조회
  @Get(':dailyPlanId/dailySchedule/:dailyScheduleId')
  async getOneDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('dailyScheduleId') dailyScheduleId: string,
  ) {
    return this.dailyScheduleService.fetchOneDailySchedule(dailyScheduleId);
  }

  // 개별 일정 생성
  @Post(':dailyPlanId/dailySchedule')
  async postDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Body() createDailyScheduleDto: CreateDailyScheduleDto,
  ) {
    const createdSchedule = this.dailyScheduleService.createDailySchedule(createDailyScheduleDto, dailyPlanId);
    return createdSchedule;
  }

  // 개별 일정 수정
  @Put(':dailyPlanId/dailySchedule/:dailyScheduleId')
  async putDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('dailyScheduleId') dailyScheduleId: string,
    @Body() putDailyScheduleDto: PutDailyScheduleDto,
  ) {
    return this.dailyScheduleService.updateDailySchedule(dailyScheduleId, putDailyScheduleDto);
  }

  // 개별 일정 삭제
  @Delete(':dailyPlanId/dailySchedule/:dailyScheduleId')
  async deleteDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('dailyScheduleId') dailyScheduleId: string,
  ) {
    return this.dailyScheduleService.deleteDailySchedule(dailyPlanId, dailyScheduleId);
  }

  /////////////////////////////
  ///////// Expense ///////////
  /////////////////////////////

  // /dailyPlan/:dailyPlanId
  // 일별 전체 지출내역 조회
  @Get(':dailyPlanId')
  async getAllExpenses(@Param('dailyPlanId') dailyPlanId: string) {
    return this.expenseService.fetchAllExpenses(dailyPlanId);
  }

  // 지출 내역 조회
  @Get(':dailyPlanId/expense/:expenseId')
  async getOneExpense(@Param('dailyPlanId') dailyPlanId: string, @Param('expenseId') expenseId: string) {
    return this.expenseService.fetchOneExpense(dailyPlanId, expenseId);
  }

  // 지출 내역 생성
  @Post(':dailyPlanId/expense')
  async postExpense(@Req() req, @Param('dailyPlanId') dailyPlanId: string, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.createExpense(createExpenseDto, dailyPlanId);
  }

  // 지출 내역 수정
  @Put(':dailyPlanId/expense/:expenseId')
  async putExpense(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('expenseId') expenseId: string,
    @Body() putExpenseDto: PutExpenseDto,
  ) {
    return this.expenseService.updateExpense(dailyPlanId, expenseId, putExpenseDto);
  }

  // 지출 내역 삭제
  @Delete(':dailyPlanId/expense/:expenseId')
  async deleteExpense(@Param('dailyPlanId') dailyPlanId: string, @Param('expenseId') expenseId: string) {
    return this.expenseService.removeExpense(dailyPlanId, expenseId);
  }
}
