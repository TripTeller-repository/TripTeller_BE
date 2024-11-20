import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PostCoverImageDto {
  @ApiProperty({
    description: '새로운 커버 이미지 URL',
    example: 'https://example.com/new-cover-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl: string;
}
