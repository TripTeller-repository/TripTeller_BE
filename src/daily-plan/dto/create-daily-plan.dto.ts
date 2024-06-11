import { IsDate, IsNotEmpty, IsOptional, ValidateIf, IsEnum } from 'class-validator';
import { DateType } from '../daily-plan.schema';

export class CreateDailyPlanDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(DateType)
  dateType: DateType = DateType.DATE;

  @ValidateIf((o) => o.dateType === DateType.DATE)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ValidateIf((o) => o.dateType === DateType.STRING)
  @IsNotEmpty()
  dateString: string;
}
