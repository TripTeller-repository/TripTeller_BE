export class UserInfoDto {
  // 사용자 정보 중 클라이언트에게 보내고 싶은 정보만 전송
  email: string; // 이메일
  profileImage: string; // 프로필 이미지 URL
  nickname: string; // 닉네임

  constructor(email: string, profileImage: string, nickname: string) {
    this.email = email;
    this.profileImage = profileImage;
    this.nickname = nickname;
  }
}
