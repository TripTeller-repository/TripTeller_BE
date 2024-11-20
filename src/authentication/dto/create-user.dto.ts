import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { EAuthProvider } from '../auth.service';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const passwordMessage = {
  message:
    '한글, 영문자, 숫자만 입력 가능합니다. 한글 또는 영문자가 최소 1개 이상 있어야 하고, 총 6글자 이하여야 합니다.',
};

export class CreateUserDto {
  @ApiProperty({
    description: '소셜 로그인 제공자 (Google, Naver, Kakao)',
    enum: EAuthProvider,
    required: true,
  })
  @IsOptional()
  @IsEnum(EAuthProvider)
  authProvider: EAuthProvider;

  @ApiProperty({
    description: '사용자의 이메일 주소 (고유 식별자)',
    example: 'user@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description:
      '사용자의 비밀번호 (한글, 영문자, 숫자만 입력 가능. 한글 또는 영문자가 최소 1개 이상 있어야 하고, 총 6글자 이하)',
    required: false,
    example: 'Password@123',
    pattern: passwordRegex.source,
  })
  @IsOptional()
  @IsString()
  @Matches(passwordRegex, passwordMessage)
  password?: string;

  @ApiProperty({
    description: '사용자의 닉네임',
    example: '여행자',
    required: true,
  })
  @IsOptional()
  @IsString()
  nickname: string;

  @ApiProperty({
    description: '사용자의 프로필 이미지 URL',
    example: 'http://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
