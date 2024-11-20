import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PostProfileImageDto {
  @ApiProperty({
    description: '회원의 프로필 이미지 URL',
    example: 'https://my-bucket.s3.us-west-2.amazonaws.com/profile-image.jpg'
  })
  @IsOptional()
  @IsString()
  imageUrl: string;
}
