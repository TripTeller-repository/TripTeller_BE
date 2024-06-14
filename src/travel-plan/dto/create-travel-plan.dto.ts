import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max } from 'class-validator';

export class CreateTravelPlanDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(20)
  title: string;

  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @IsNotEmpty()
  @IsNumber()
  numberOfPeople: number;

  @IsNotEmpty()
  @IsNumber()
  totalExpense: number;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsOptional()
  @IsDate()
  deletedAt: Date | null;
}
