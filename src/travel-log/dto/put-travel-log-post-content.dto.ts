import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PutTravelLogPostContentDto {
  @ApiProperty({
    description: '여행 로그 이미지의 S3 URL',
    example: 'https://s3.amazonaws.com/my-bucket/travel-log-image.jpg'
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  postContent: string;
}
