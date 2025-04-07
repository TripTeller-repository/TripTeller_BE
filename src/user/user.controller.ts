import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PostProfileImageDto } from './dto/post-profile-image.dto';
import { AuthGuard } from 'src/authentication/auth.guard';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserInfoDto } from './dto/user-info.dto';

@ApiTags('User')
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @ApiOperation({
    summary: '회원정보(이메일, 프로필 이미지 URL, 닉네임) 전체 조회',
    description: '클라이언트에게 반환해야할 회원 정보를 조회한다.',
  })
  @ApiResponse({
    status: 200,
    description: '회원 정보 조회 성공',
    type: UserInfoDto,
  })
  @ApiResponse({
    status: 404,
    description: '회원 정보를 찾을 수 없음',
  })
  async getUserInfoMyTrip(@Req() req) {
    const { userId } = req.user;
    return this.userService.findUserInfoById(userId);
  }

  @Get('profile-image')
  @ApiOperation({ summary: '프로필 이미지 불러오기', description: '프로필 이미지 URL을 조회한다.' })
  @ApiResponse({
    status: 200,
    description: '프로필 이미지 조회 성공',
    schema: {
      type: 'object',
      properties: {
        profileImage: {
          type: 'string',
          example: 'https://my-bucket.s3.amazonaws.com/profile-image.jpg',
        },
      },
    },
  })
  async getProfileImage(@Req() req) {
    const { userId } = req.user;
    return this.userService.fetchProfileImage(userId);
  }

  @Get('nickname')
  @ApiOperation({ summary: '닉네임 조회', description: '특정 회원의 닉네임을 조회한다.' })
  @ApiResponse({
    status: 200,
    description: '닉네임 조회 성공',
    schema: {
      type: 'object',
      properties: {
        nickname: {
          type: 'string',
          example: '트립텔러',
        },
      },
    },
  })
  async getNickname(@Req() req) {
    const { userId } = req.user;
    return this.userService.findNickname(userId);
  }

  @Get('profile-image-signed-url/:fileName')
  @ApiOperation({
    summary: 'AWS S3 프로필 이미지 Signed URL 불러오기',
    description: '프로필 이미지 presigned URL을 AWS SDK에서 불러온다.',
  })
  @ApiParam({
    name: 'fileName',
    description: 'AWS S3에 저장된 프로필 이미지 파일명',
    example: 'user_profile_image.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed URL 조회 성공',
    schema: {
      type: 'object',
      properties: {
        signedUrl: {
          type: 'string',
          example: 'https://my-bucket.s3.amazonaws.com/signed-url',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '파일을 찾을 수 없음',
  })
  async getProfileImageSignedUrl(@Req() req, @Param('fileName') fileName) {
    const { userId } = req.user;
    const signedUrl = await this.userService.fetchProfileImageSignedUrl(fileName, userId);
    return { signedUrl };
  }

  @Post('profile-image')
  @ApiOperation({ summary: '프로필 이미지 변경', description: '특정 회원의 프로필 이미지를 변경한다.' })
  @ApiResponse({
    status: 200,
    description: '프로필 이미지 변경 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '프로필 이미지가 성공적으로 변경되었습니다.' },
        user: { type: 'object', properties: { email: { type: 'string' }, profileImage: { type: 'string' } } },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '프로필 이미지 변경 실패',
  })
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
  @ApiOperation({ summary: '닉네임 변경', description: '특정 회원의 닉네임을 변경한다.' })
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
