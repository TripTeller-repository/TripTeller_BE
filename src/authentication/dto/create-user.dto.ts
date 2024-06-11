import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { EAuthProvider } from '../auth.service';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const passwordMessage = {
  message:
    '한글, 영문자, 숫자만 입력 가능합니다. 한글 또는 영문자가 최소 1개 이상 있어야 하고, 총 6글자 이하여야 합니다.',
};

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(EAuthProvider)
  authProvider: EAuthProvider;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(passwordRegex, passwordMessage)
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  nickname: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  profileImage?: string;
}
