import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatedUserDto {
  // 이메일
  @ApiProperty()
  @IsString()
  email: string;

  // 프로필 이미지
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  profileImage: string;

  // 닉네임
  @ApiProperty()
  @IsString()
  nickname: string;

  // 회원 ID
  @ApiProperty()
  @IsString()
  _id: string;
}
