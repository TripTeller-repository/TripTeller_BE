import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDailyScheduleDto {
  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  time: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  memo: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  deletedAt: Date | null;
}
