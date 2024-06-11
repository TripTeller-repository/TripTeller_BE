import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExpenseDto {
  // 카테고리
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expenseCategory: string;

  // 제목 (항목)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  title: string;

  // 금액 (각 항목당 지출 금액)
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  expense: number;

  // 메모
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  expenseMemo: string;
}
