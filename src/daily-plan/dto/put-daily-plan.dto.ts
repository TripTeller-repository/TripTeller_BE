import { IsDate, IsNotEmpty, IsOptional, IsEnum, ValidateIf } from 'class-validator';
import { DateType } from '../daily-plan.schema';
import { ApiProperty } from '@nestjs/swagger';

export class PutDailyPlanDto {
  @ApiProperty({
    description: '날짜 타입 (DATE 또는 STRING)',
    enum: DateType,
    default: DateType.DATE,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(DateType)
  dateType: DateType = DateType.DATE;

  @ApiProperty({
    description: '날짜 타입이 DATE일 경우 입력되는 날짜 (클라이언트 측에서 넘겨받는 데이터)',
    type: Date,
    example: '2024-12-15T00:00:00Z',
  })
  @ValidateIf((o) => o.dateType === DateType.DATE)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: '날짜 타입이 STRING일 경우 입력되는 문자열',
    type: String,
    example: '2024-12-15',
  })
  @ValidateIf((o) => o.dateType === DateType.STRING)
  @IsNotEmpty()
  dateString: string;

  @ApiProperty({
    description: '삭제일',
    type: Date,
    nullable: true,
    example: '2024-12-15T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  deletedAt?: Date | null;
}
