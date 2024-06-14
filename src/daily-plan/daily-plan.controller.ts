import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateDailyScheduleDto } from '../daily-schedule/dto/create-daily-schedule.dto';
import { PutDailyScheduleDto } from '../daily-schedule/dto/put-daily-schedule.dto';
import { ExpenseService } from '../expense/expense.service';
import { DailyScheduleService } from '../daily-schedule/daily-schedule.service';
import { CreateExpenseDto } from 'src/expense/dto/create-expense.dto';
import { PutExpenseDto } from 'src/expense/dto/put-expense.dto';
import { CustomAuthGuard } from '../authentication/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('daily-plan')
@UseGuards(CustomAuthGuard)
export class DailyPlanController {
  constructor(
    private readonly dailyScheduleService: DailyScheduleService,
    private readonly expenseService: ExpenseService,
  ) {}

  //////////////////////////////////
  ///////// DailySchedule //////////
  //////////////////////////////////

  @ApiTags('DailySchedule')
  @Get(':dailyPlanId/daily-schedule/:dailyScheduleId')
  @ApiOperation({ summary: '개별 일정 조회' })
  async getOneDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('dailyScheduleId') dailyScheduleId: string,
  ) {
    return this.dailyScheduleService.fetchOneDailySchedule(dailyScheduleId);
  }

  @ApiTags('DailySchedule')
  @Post(':dailyPlanId/daily-schedule')
  @ApiOperation({ summary: '개별 일정 생성' })
  async postDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Body() createDailyScheduleDto: CreateDailyScheduleDto,
  ) {
    const createdSchedule = this.dailyScheduleService.createDailySchedule(createDailyScheduleDto, dailyPlanId);
    return createdSchedule;
  }

  @ApiTags('DailySchedule')
  @Put(':dailyPlanId/daily-schedule/:dailyScheduleId')
  @ApiOperation({ summary: '개별 일정 수정' })
  async putDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('dailyScheduleId') dailyScheduleId: string,
    @Body() putDailyScheduleDto: PutDailyScheduleDto,
  ) {
    return this.dailyScheduleService.updateDailySchedule(dailyScheduleId, putDailyScheduleDto);
  }

  @ApiTags('DailySchedule')
  @Delete(':dailyPlanId/daily-schedule/:dailyScheduleId')
  @ApiOperation({ summary: '개별 일정 삭제' })
  async deleteDailySchedule(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('dailyScheduleId') dailyScheduleId: string,
  ) {
    return this.dailyScheduleService.deleteDailySchedule(dailyPlanId, dailyScheduleId);
  }

  /////////////////////////////
  ///////// Expense ///////////
  /////////////////////////////

  @ApiTags('Expense')
  @Get(':dailyPlanId')
  @ApiOperation({ summary: '일별 전체 지출내역 조회' })
  async getAllExpenses(@Param('dailyPlanId') dailyPlanId: string) {
    return this.expenseService.fetchAllExpenses(dailyPlanId);
  }

  @ApiTags('Expense')
  @Get(':dailyPlanId/expense/:expenseId')
  @ApiOperation({ summary: '지출내역 조회' })
  async getOneExpense(@Param('dailyPlanId') dailyPlanId: string, @Param('expenseId') expenseId: string) {
    return this.expenseService.fetchOneExpense(dailyPlanId, expenseId);
  }

  @ApiTags('Expense')
  @Post(':dailyPlanId/expense')
  @ApiOperation({ summary: '지출내역 생성' })
  async postExpense(@Req() req, @Param('dailyPlanId') dailyPlanId: string, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.createExpense(createExpenseDto, dailyPlanId);
  }

  @ApiTags('Expense')
  @Put(':dailyPlanId/expense/:expenseId')
  @ApiOperation({ summary: '지출내역 수정' })
  async putExpense(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('expenseId') expenseId: string,
    @Body() putExpenseDto: PutExpenseDto,
  ) {
    return this.expenseService.updateExpense(dailyPlanId, expenseId, putExpenseDto);
  }

  @ApiTags('Expense')
  @Delete(':dailyPlanId/expense/:expenseId')
  @ApiOperation({ summary: '지출내역 삭제' })
  async deleteExpense(@Param('dailyPlanId') dailyPlanId: string, @Param('expenseId') expenseId: string) {
    return this.expenseService.removeExpense(dailyPlanId, expenseId);
  }
}
