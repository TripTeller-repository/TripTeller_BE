import { IsDate, IsNotEmpty, IsOptional, IsEnum, ValidateIf } from 'class-validator';
import { DateType } from '../dailyPlan.schema';

export class PutDailyPlanDto {
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

  @IsOptional()
  @IsDate()
  deletedAt?: Date | null;
}
