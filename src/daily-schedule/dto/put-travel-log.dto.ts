import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateDailyScheduleDto {
  @ApiProperty({
    description: '여행 로그의 글 내용',
    type: String,
    example: '오늘은 강남 맛집이라는 맛나 부대찌개집에서 전골을 먹었다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  postContent: string;

  @ApiProperty({
    description: '여행 로그 이미지 URL',
    type: String,
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imgUrl: string;
}
