import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    description: '지출의 카테고리 (예: Food, Accommodation 등)',
    enum: ['Food', 'Accommodation', 'Vehicle', 'Shopping', 'Tour'],
    example: 'Food',
  })
  @IsString()
  @IsNotEmpty()
  expenseCategory: string;

  @ApiProperty({
    description: '지출 항목의 제목 (예: "식사", "숙소 비용" 등)',
    example: '식사',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  title: string;

  @ApiProperty({
    description: '금액 (각 항목당 지출 금액)',
    example: 50000,
  })
  @IsNumber()
  @IsNotEmpty()
  expense: number;

  @ApiProperty({
    description: '지출에 대한 추가 메모',
    example: '식사 비용은 2명이서',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  expenseMemo: string;
}
