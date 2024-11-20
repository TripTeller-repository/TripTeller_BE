import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class PutDailyScheduleDto {
  @ApiProperty({
    description: '시간',
    type: Date,
    example: '2024-12-15T08:00:00Z',
  })
  @IsDate()
  @IsNotEmpty()
  time: Date;

  @ApiProperty({
    description: '장소',
    type: String,
    example: '맛나부대찌개',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: '일정에 대한 메모 (최대 30자)',
    type: String,
    maxLength: 30,
    example: '미리 예약하고 가야됨',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  memo: string;
}
