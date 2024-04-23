import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { PostProfileImageDto } from './dto/postProfileImage.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 회원정보 전체 조회
  // 정보 : 이메일, 프로필 이미지 URL, 닉네임
  // MyTrip => 토큰에 있는 userID로 조회
  @Get('info')
  async getUserInfoMyTrip(@Req() req) {
    const { userId } = req.user;
    return this.userService.getUserInfo(userId);
  }

  // 프로필 이미지 불러오기
  @Get('profile-image')
  async getProfileImage(@Req() req) {
    const { userId } = req.user;
    return this.userService.getProfileImage(userId);
  }

  // 닉네임 조회
  @Get('nickname')
  async getNickname(@Req() req) {
    const { userId } = req.user;
    return this.userService.getNickname(userId);
  }

  // AWS S3 프로필 이미지 Signed URL 불러오기
  @Get('profile-image-signed-url/:fileName')
  async getProfileImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.userService.getProfileImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  // 프로필 이미지 변경
  @Post('profile-image')
  async postProfileImage(@Req() req, @Body() postProfileImageDto: PostProfileImageDto) {
    try {
      // 사용자 ID를 사용하여 해당 사용자를 찾아 프로필 이미지 변경
      const { userId } = req.user;
      const { imageUrl } = postProfileImageDto;

      // 프로필 이미지 변경된 사용자 정보 업데이트
      const updatedUser = await this.userService.updateProfileImageById(userId, imageUrl);

      if (updatedUser) {
        return { message: '프로필 이미지가 성공적으로 변경되었습니다.', user: updatedUser };
      } else {
        return { message: '사용자를 찾을 수 없습니다.' };
      }
    } catch (error) {
      return { message: '프로필 이미지 변경 중 오류가 발생했습니다.' };
    }
  }

  // 닉네임 변경
  @Post('nickname')
  async postNickname(@Req() req, @Body() dto: UpdateUserDto) {
    try {
      // 사용자 ID를 사용하여 해당 사용자를 찾아 닉네임 변경
      const { userId } = req.user;

      // 닉네임 변경된 사용자 정보 업데이트
      const updatedUser = await this.userService.updateNickNameById(userId, { nickname: dto.nickname });
      if (updatedUser) {
        return { message: '닉네임이 성공적으로 변경되었습니다.', user: updatedUser };
      } else {
        return { message: '사용자를 찾을 수 없습니다.' };
      }
    } catch (error) {
      return { message: '닉네임 변경 중 오류가 발생했습니다.' };
    }
  }
}
