import { ApiProperty } from "@nestjs/swagger";

// 회원 정보 중 클라이언트에게 보내고 싶은 정보만 전송
export class UserInfoDto {
  @ApiProperty({
    description: '회원의 이메일 주소',
    example: 'user@example.com',
  })
  email: string; 

  @ApiProperty({
    description: '회원의 프로필 이미지 URL',
    example: 'https://my-bucket.s3.us-west-2.amazonaws.com/profile-image.jpg'
  })
  profileImage: string;

  @ApiProperty({
    description: '회원의 닉네임',
    example: '트립텔러' 
  })
  nickname: string;

  constructor(email: string, profileImage: string, nickname: string) {
    this.email = email;
    this.profileImage = profileImage;
    this.nickname = nickname;
  }
}
