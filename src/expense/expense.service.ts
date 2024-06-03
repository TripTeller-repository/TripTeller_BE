import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from './expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { PutExpenseDto } from './dto/put-expense.dto';
import { DailyPlan } from 'src/daily-plan/daily-plan.schema';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel('DailyPlan') private readonly dailyPlanModel: Model<DailyPlan>,
    @InjectModel('Expense') private readonly expenseModel: Model<Expense>,
  ) {}

  // 일별 전체 지출내역 조회
  // ex. 3월 20일에 해당하는 전체 지출 내역이 배열로 나옴
  async findAllExpenses(dailyPlanId: string) {
    const dailyPlans = await this.dailyPlanModel.findById(dailyPlanId).populate('expenses').exec();
    if (!dailyPlans) {
      throw new NotFoundException('세부 지출 내역을 찾을 수 없습니다.');
    }
    const formattedExpenses = await Promise.all(
      dailyPlans.expenses.map(async (expense) => {
        const detailedExpense = await this.expenseModel.findById(expense).exec();
        return {
          id: detailedExpense._id,
          title: detailedExpense.title,
          memo: detailedExpense.expenseMemo,
          price: detailedExpense.expense,
        };
      }),
    );

    return {
      date: dailyPlans.date,
      expenses: formattedExpenses,
    };
  }

  // 지출 내역 조회
  async findOneExpense(dailyPlanId: string, expenseId: string) {
    const findExpense = await this.expenseModel.findOne({ _id: expenseId }).exec();

    if (!findExpense) {
      throw new NotFoundException('해당 지출내역을 찾을 수 없습니다.');
    }
    return findExpense;
  }

  // 지출 내역 생성
  async createExpense(createExpenseDto: CreateExpenseDto, dailyPlanId: string) {
    const createExpense = await this.expenseModel.create(createExpenseDto);
    const expense = await this.dailyPlanModel
      .findByIdAndUpdate(
        { _id: dailyPlanId },
        { $push: { expenses: createExpense._id } },
        {
          runValidators: true,
          new: true,
        },
      )
      .exec();
    if (!expense) {
      throw new NotFoundException('해당 지출내역을 생성할 수 없습니다.');
    }
    return createExpense;
  }

  // 지출 내역 수정
  async updateExpense(dailyPlanId: string, expenseId: string, putExpenseDto: PutExpenseDto) {
    const putExpense = await this.expenseModel
      .findOneAndUpdate({ _id: expenseId }, putExpenseDto, { runValidators: true, new: true })
      .exec();
    if (!putExpense) {
      throw new NotFoundException('해당 지출내역을 수정할 수 없습니다.');
    }
    return putExpense;
  }

  // 지출 내역 삭제
  async deleteExpense(dailyPlanId: string, expenseId: string) {
    // dailyPlanModel 모델의 expenses 필드(배열)에서 expenseId id값 삭제
    const objectExpenseId = new Types.ObjectId(expenseId);
    await this.dailyPlanModel
      .updateOne({ _id: dailyPlanId }, { $pull: { expenses: objectExpenseId } }, { runValidators: true, new: true })
      .exec();
    // Expense 모델에서 해당 expenseId값을 가진 도큐먼트 삭제
    const deletedExpense = await this.expenseModel.findByIdAndDelete({ _id: expenseId });
    if (!deletedExpense) {
      throw new NotFoundException('해당 지출 내역이 존재하지 않습니다.');
    }
    return { message: '지출 내역이 삭제되었습니다.' };
  }
}
