import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class Setup2faDto {
  @ApiProperty({
    description: '임시 토큰',
  })
  @IsNotEmpty()
  @IsString()
  tempToken: string;

  @ApiProperty({
    description: '2FA 인증 코드 (6자리)',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  totpCode: string;
}
