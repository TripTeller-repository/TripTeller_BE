import { IsDate, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class PutDailyScheduleDto {
  @IsDate()
  @IsNotEmpty()
  time: Date;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  memo: string;
}
