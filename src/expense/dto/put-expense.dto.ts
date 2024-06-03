import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class PutExpenseDto {
  // 카테고리
  @IsString()
  @IsNotEmpty()
  expenseCategory: string;

  // 제목
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  title: string;

  // 금액 (각 항목당 지출 금액)
  @IsNumber()
  @IsNotEmpty()
  expense: number;

  // 메모
  @IsOptional()
  @IsString()
  @MaxLength(20)
  expenseMemo: string;
}
