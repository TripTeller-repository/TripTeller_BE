import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PostProfileImageDto } from './dto/post-profile-image.dto';
import { CustomAuthGuard } from 'src/authentication/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
@UseGuards(CustomAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @ApiOperation({ summary: '회원정보(이메일, 프로필 이미지 URL, 닉네임) 전체 조회' })
  async getUserInfoMyTrip(@Req() req) {
    const { userId } = req.user;
    return this.userService.findUserInfoById(userId);
  }

  @Get('profile-image')
  @ApiOperation({ summary: '프로필 이미지 불러오기' })
  async getProfileImage(@Req() req) {
    const { userId } = req.user;
    return this.userService.fetchProfileImage(userId);
  }

  @Get('nickname')
  @ApiOperation({ summary: '닉네임 조회' })
  async getNickname(@Req() req) {
    const { userId } = req.user;
    return this.userService.findNickname(userId);
  }

  @Get('profile-image-signed-url/:fileName')
  @ApiOperation({ summary: 'AWS S3 프로필 이미지 Signed URL 불러오기' })
  async getProfileImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.userService.fetchProfileImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  @Post('profile-image')
  @ApiOperation({ summary: '프로필 이미지 변경' })
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

  @Post('nickname')
  @ApiOperation({ summary: '닉네임 변경' })
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
