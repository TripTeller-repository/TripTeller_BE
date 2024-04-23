import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = Expense & Document;

// 카테고리 enum 정의
enum ExpenseCategory {
  Food = 'Food',
  Accommodation = 'Accommodation',
  Vehicle = 'Vehicle',
  Shopping = 'Shopping',
  Tour = 'Tour',
}

@Schema({ timestamps: true, collection: 'Expense' })
export class Expense {
  // 카테고리
  @Prop({ required: true, enum: Object.values(ExpenseCategory) })
  expenseCategory: ExpenseCategory;

  // 제목
  // 유효성 검사 ( 영문 혹은 한글 )
  @Prop({ required: true, maxlength: 20 })
  title: string;

  // 개별 항목별 지출 금액
  @Prop({ required: true, min: 0 })
  expense: number;

  // 메모
  @Prop({ maxlength: 20 })
  expenseMemo: string;

  // 삭제일
  @Prop({ default: null })
  deletedAt: Date | null;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
