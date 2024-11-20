import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { RegionName } from '../region-name.enum';

export class CreateTravelPlanDto {
  @ApiProperty({
    description: '여행 계획의 제목',
    example: '여름 휴가 여행',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @Max(20)
  title: string;

  @ApiProperty({
    description: '여행 시작일',
    type: String,
    format: 'date',
    example: '2024-12-01',
  })
  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: '여행 종료일',
    type: String,
    format: 'date',
    example: '2024-12-10',
  })
  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description: '여행에 참여하는 인원 수',
    example: 4,
  })
  @IsNotEmpty()
  @IsNumber()
  numberOfPeople: number;

  @ApiProperty({
    description: '총 지출 금액',
    example: 150000,
  })
  @IsNotEmpty()
  @IsNumber()
  totalExpense: number;

  @ApiProperty({
    description: '여행 지역',
    example: '서울',
    enum: RegionName,
  })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiProperty({
    description: '삭제일',
    type: String,
    format: 'date',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsDate()
  deletedAt: Date | null;
}
