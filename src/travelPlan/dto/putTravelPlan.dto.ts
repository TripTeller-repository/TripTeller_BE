import { IsDate, IsNotEmpty } from 'class-validator';

export class PutTravelPlanDto {
  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  endDate: Date;
}
