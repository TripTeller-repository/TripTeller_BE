import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty } from 'class-validator';

export class PutTravelPlanDto {
  @ApiProperty({
    description: '여행 시작일 (수정 가능)',
    type: String,
    format: 'date',
    example: '2024-12-05',
  })
  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: '여행 종료일 (수정 가능)',
    type: String,
    format: 'date',
    example: '2024-12-15',
  })
  @IsNotEmpty()
  @IsDate()
  endDate: Date;
}
