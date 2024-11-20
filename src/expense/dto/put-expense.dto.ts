import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class PutExpenseDto {
  @ApiProperty({
    description: '지출의 카테고리 (예: Food, Accommodation 등)',
    enum: ['Food', 'Accommodation', 'Vehicle', 'Shopping', 'Tour'],
    example: 'Accommodation',
  })
  @IsString()
  @IsNotEmpty()
  expenseCategory: string;

  @ApiProperty({
    description: '지출 항목의 제목 (예: "식사", "숙소 비용" 등)',
    example: '숙소 비용',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  title: string;

  @ApiProperty({
    description: '지출 항목에 대한 금액',
    example: 100000,
  })
  @IsNumber()
  @IsNotEmpty()
  expense: number;

  @ApiProperty({
    description: '지출에 대한 추가 메모',
    example: '하루 숙박 비용',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  expenseMemo: string;
}
