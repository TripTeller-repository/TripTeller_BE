import { IsOptional, IsString } from 'class-validator';

export class CreateDailyScheduleDto {
  @IsString()
  @IsOptional()
  postContent: string;

  @IsString()
  @IsOptional()
  imgUrl: string;
}
