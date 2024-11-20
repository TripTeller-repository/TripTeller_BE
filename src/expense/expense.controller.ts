import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ExpenseService } from '../expense/expense.service';
import { CreateExpenseDto } from 'src/expense/dto/create-expense.dto';
import { PutExpenseDto } from 'src/expense/dto/put-expense.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Expense')
@Controller('daily-plan/:dailyPlanId/expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  @ApiOperation({
    summary: '일별 전체 지출내역 조회',
    description: '주어진 `dailyPlanId`에 대해 해당 날짜의 전체 지출내역을 조회한다.',
  })
  @ApiResponse({
    status: 200,
    description: '일별 지출내역 조회 성공',
    schema: {
      example: {
        date: '2024-11-20',
        expenses: [
          {
            id: '635cd4e2f9d1e144c8f45bb8',
            title: '식사',
            memo: '점심 식사',
            price: 15000,
          },
          {
            id: '635cd4e2f9d1e144c8f45bb9',
            title: '숙소 비용',
            memo: '호텔 숙박',
            price: 80000,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '지출내역을 찾을 수 없음',
    schema: {
      example: {
        message: '세부 지출 내역을 찾을 수 없습니다.',
      },
    },
  })
  async getAllExpenses(@Param('dailyPlanId') dailyPlanId: string) {
    return this.expenseService.fetchAllExpenses(dailyPlanId);
  }

  @Get(':expenseId')
  @ApiOperation({
    summary: '지출내역 조회',
    description: '주어진 `expenseId`에 해당하는 지출내역을 조회한다.',
  })
  @ApiResponse({
    status: 200,
    description: '지출내역 조회 성공',
    schema: {
      example: {
        id: '635cd4e2f9d1e144c8f45bb8',
        expenseCategory: 'Food',
        title: '식사',
        expense: 15000,
        expenseMemo: '점심 식사',
        deletedAt: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '지출내역을 찾을 수 없음',
    schema: {
      example: {
        message: '해당 지출내역을 찾을 수 없습니다.',
      },
    },
  })
  async getOneExpense(@Param('dailyPlanId') dailyPlanId: string, @Param('expenseId') expenseId: string) {
    return this.expenseService.fetchOneExpense(dailyPlanId, expenseId);
  }

  @Post()
  @ApiOperation({
    summary: '지출내역 생성',
    description: '새로운 지출내역을 생성하고, 해당 `dailyPlanId`에 추가한다.',
  })
  @ApiResponse({
    status: 201,
    description: '지출내역 생성 성공',
    schema: {
      example: {
        expenseCategory: 'Food',
        title: '식사',
        expense: 15000,
        expenseMemo: '점심 식사',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효하지 않은 입력값)',
    schema: {
      example: {
        message: '유효하지 않은 입력값입니다.',
      },
    },
  })
  async postExpense(@Req() req, @Param('dailyPlanId') dailyPlanId: string, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.createExpense(createExpenseDto, dailyPlanId);
  }

  @Put(':expenseId')
  @ApiOperation({
    summary: '지출내역 수정',
    description: '주어진 `expenseId`에 해당하는 지출내역을 수정한다.',
  })
  @ApiResponse({
    status: 200,
    description: '지출내역 수정 성공',
    schema: {
      example: {
        id: '635cd4e2f9d1e144c8f45bb8',
        expenseCategory: 'Food',
        title: '식사',
        expense: 20000,
        expenseMemo: '저녁 식사',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '지출내역을 찾을 수 없음',
    schema: {
      example: {
        message: '해당 지출내역을 수정할 수 없습니다.',
      },
    },
  })
  async putExpense(
    @Param('dailyPlanId') dailyPlanId: string,
    @Param('expenseId') expenseId: string,
    @Body() putExpenseDto: PutExpenseDto,
  ) {
    return this.expenseService.updateExpense(dailyPlanId, expenseId, putExpenseDto);
  }

  @Delete(':expenseId')
  @ApiOperation({
    summary: '지출내역 삭제',
    description: '주어진 `expenseId`에 해당하는 지출내역을 삭제한다.',
  })
  @ApiResponse({
    status: 200,
    description: '지출내역 삭제 성공',
    schema: {
      example: {
        message: '지출 내역이 삭제되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '지출내역을 찾을 수 없음',
    schema: {
      example: {
        message: '해당 지출 내역이 존재하지 않습니다.',
      },
    },
  })
  async deleteExpense(@Param('dailyPlanId') dailyPlanId: string, @Param('expenseId') expenseId: string) {
    return this.expenseService.removeExpense(dailyPlanId, expenseId);
  }
}
