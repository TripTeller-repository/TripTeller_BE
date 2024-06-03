import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { DailySchedule } from '../daily-schedule/daily-schedule.schema';
import type { Expense } from '../expense/expense.schema';

export enum DateType {
  DATE = 'DATE',
  STRING = 'STRING',
}

@Schema({ timestamps: true, collection: 'DailyPlan' })
export class DailyPlan {
  // 일별 일정 관리 (참조)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'DailySchedule' }] })
  dailySchedules: DailySchedule[];

  // 일별지출 내역 (배열로 ID값이 들어감)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Expense' }] })
  expenses: Expense[];

  // 날짜 유형
  @Prop({ required: true, enum: Object.values(DateType), default: DateType.DATE })
  dateType: DateType;

  // 날짜
  @Prop({})
  date: Date;

  // 여행준비
  @Prop({})
  dateString: string;

  // 삭제일
  @Prop({ default: null })
  deletedAt: Date | null;
}

const DailyPlanSchema = SchemaFactory.createForClass(DailyPlan);

const populateExpenses = function (next) {
  this.populate({
    path: 'expenses',
    model: 'Expense',
  });
  this.populate({
    path: 'dailySchedules',
    model: 'DailySchedule',
  });
  next();
};

DailyPlanSchema.pre('find', populateExpenses);
DailyPlanSchema.pre('findOne', populateExpenses);

export { DailyPlanSchema };
