import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PutTravelLogImageDto {
  @ApiProperty({
    description: '커버 이미지 ID',
    example: '673c5950adf39a595b9b723b',
  })
  @IsString()
  @IsOptional()
  imageUrl: string;
}
