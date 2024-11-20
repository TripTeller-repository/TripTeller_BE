import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFeedDto {
  @ApiProperty()
  @ApiProperty({
    description: '게시물 작성자(회원) ID',
    example: 'user123',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: '게시물 커버 이미지 URL',
    example: 'https://example.com/cover-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverImage: string;

  @ApiProperty({
    description: '게시물 공개 여부',
    example: true,
  })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({
    description: '비공개 요청 날짜',
    example: '2024-11-20T15:00:00Z',
  })
  @IsDate()
  requestPrivateAt: Date;

  @ApiProperty({
    description: '삭제일',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsDate()
  deletedAt: Date | null;
}
