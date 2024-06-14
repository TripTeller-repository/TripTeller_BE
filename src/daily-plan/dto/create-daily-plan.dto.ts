import { IsDate, IsNotEmpty, IsOptional, ValidateIf, IsEnum } from 'class-validator';
import { DateType } from '../daily-plan.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDailyPlanDto {
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
}
