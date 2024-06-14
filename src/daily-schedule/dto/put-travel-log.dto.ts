import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateDailyScheduleDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  postContent: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imgUrl: string;
}
