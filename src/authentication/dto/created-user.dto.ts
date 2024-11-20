import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatedUserDto {
  // 이메일
  @ApiProperty({
    description: '사용자의 이메일 주소',
    example: 'user@example.com',
  })
  @IsString()
  email: string;

  // 프로필 이미지
  @ApiProperty({
    description: '사용자의 프로필 이미지 URL',
    example: 'http://example.com/profile.jpg',
  })
  @IsNotEmpty()
  @IsString()
  profileImage: string;

  // 닉네임
  @ApiProperty({
    description: '사용자의 닉네임',
    example: '트립텔러',
  })
  @IsString()
  nickname: string;

  // 회원 ID
  @ApiProperty({
    description: '사용자의 고유 ID',
    example: '12345abcde',
  })
  @IsString()
  _id: string;
}
