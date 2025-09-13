import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from './expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { PutExpenseDto } from './dto/put-expense.dto';
import { DailyPlan } from '@daily-plan/daily-plan.schema';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel('DailyPlan') private readonly dailyPlanModel: Model<DailyPlan>,
    @InjectModel('Expense') private readonly expenseModel: Model<Expense>,
  ) {}

  /**
   * 특정 일별 계획에 포함된 전체 지출 내역을 조회
   *
   * @param {string} dailyPlanId - 일별 계획 ID
   * @throws {NotFoundException} 해당 일별 계획이 존재하지 않을 경우
   * @returns {Promise<{ date: Date, expenses: any[] }>} 날짜 및 지출 항목 배열
   */
  async fetchAllExpenses(dailyPlanId: string) {
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

  /**
   * 특정 지출 항목을 조회
   *
   * @param {string} dailyPlanId - 일별 계획 ID (사용 안하지만 일관성 유지 목적)
   * @param {string} expenseId - 지출 항목 ID
   * @throws {NotFoundException} 지출 항목이 존재하지 않을 경우
   * @returns {Promise<Expense>} 지출 항목
   */
  async fetchOneExpense(dailyPlanId: string, expenseId: string) {
    const findExpense = await this.expenseModel.findOne({ _id: expenseId }).exec();

    if (!findExpense) {
      throw new NotFoundException('해당 지출내역을 찾을 수 없습니다.');
    }
    return findExpense;
  }

  /**
   * 새로운 지출 항목을 생성하고 해당 일별 계획에 연결
   *
   * @param {CreateExpenseDto} createExpenseDto - 지출 항목 생성 DTO
   * @param {string} dailyPlanId - 일별 계획 ID
   * @throws {NotFoundException} 일별 계획이 존재하지 않을 경우
   * @returns {Promise<Expense>} 생성된 지출 항목
   */
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

  /**
   * 특정 지출 항목을 수정
   *
   * @param {string} dailyPlanId - 일별 계획 ID (사용 안하지만 일관성 유지 목적)
   * @param {string} expenseId - 수정할 지출 항목 ID
   * @param {PutExpenseDto} putExpenseDto - 수정할 필드 DTO
   * @throws {NotFoundException} 지출 항목이 존재하지 않을 경우
   * @returns {Promise<Expense>} 수정된 지출 항목
   */
  async updateExpense(dailyPlanId: string, expenseId: string, putExpenseDto: PutExpenseDto) {
    const putExpense = await this.expenseModel
      .findOneAndUpdate({ _id: expenseId }, putExpenseDto, { runValidators: true, new: true })
      .exec();
    if (!putExpense) {
      throw new NotFoundException('해당 지출내역을 수정할 수 없습니다.');
    }
    return putExpense;
  }

  /**
   * 특정 지출 항목을 삭제하고, 일별 계획의 expenses 배열에서도 제거
   *
   * @param {string} dailyPlanId - 일별 계획 ID
   * @param {string} expenseId - 삭제할 지출 항목 ID
   * @throws {NotFoundException} 지출 항목이 존재하지 않을 경우
   * @returns {Promise<{ message: string }>} 삭제 완료 메시지
   */
  async removeExpense(dailyPlanId: string, expenseId: string) {
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
