import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class Verify2faDto {
  @ApiProperty({
    description: '임시 토큰 (로그인 1단계 완료 후 받은 토큰)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({
    description: '2FA 인증 코드',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  totpCode?: string;

  @ApiProperty({
    description: '2FA 백업 코드 (잃어버릴 경우)',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  backupCode?: string;

  @ApiProperty({
    description: '2FA 건너뛰기 여부 (의심스러운 로그인시만)',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  skipTwoFactor?: boolean;
}
