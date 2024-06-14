import { IsDate, IsNotEmpty, IsOptional, IsEnum, ValidateIf } from 'class-validator';
import { DateType } from '../daily-plan.schema';
import { ApiProperty } from '@nestjs/swagger';

export class PutDailyPlanDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(DateType)
  dateType: DateType = DateType.DATE;

  @ApiProperty()
  @ValidateIf((o) => o.dateType === DateType.DATE)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  @ValidateIf((o) => o.dateType === DateType.STRING)
  @IsNotEmpty()
  dateString: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  deletedAt?: Date | null;
}
