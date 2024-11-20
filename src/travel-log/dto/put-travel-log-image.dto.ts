import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PutTravelLogImageDto {
  @ApiProperty({
    description: '여행 로그의 글 내용 (최대 100자)',
    example: '오늘은 제주도에서 멋진 풍경을 봤어요!',
  })
  @IsString()
  @IsOptional()
  imageUrl: string;
}
