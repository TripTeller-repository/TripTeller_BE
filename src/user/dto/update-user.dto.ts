import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// 닉네임 설정 시
// 1) 한글 또는 영문이 최소 1글자 있어야 함.
// 2) 총 6글자 (한글, 영문, 숫자만 입력 가능)
// 유효성 검사 실패시, 안내 메시지 띄움.
const regex = /^(?=.*[가-힣a-zA-Z])[가-힣\dA-Za-z]{1,6}$/;
const message = {
  message:
    '한글, 영문자, 숫자만 입력 가능합니다. 한글 또는 영문자가 최소 1개 이상 있어야 하고, 총 6글자 이하여야 합니다.',
};

export class UpdateUserDto {
  @ApiProperty({
    description: '회원 닉네임',
    example: '트립텔러',
    maxLength: 6,
    pattern: '^(?=.*[가-힣a-zA-Z])[가-힣dA-Za-z]{1,6}$',
  })
  @IsOptional()
  @IsString()
  @MaxLength(6)
  @Matches(regex, message)
  nickname: string;
}
