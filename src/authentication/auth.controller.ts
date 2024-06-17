import { Body, Controller, Delete, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request as expReq, Response as expRes } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatedUserDto } from './dto/created-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @ApiOperation({ summary: '회원가입', description: '유저를 생성한다!' })
  @ApiCreatedResponse({ description: '유저 생성', type: CreatedUserDto })
  async postSignUp(@Body() createUserDto: CreateUserDto): Promise<CreatedUserDto> {
    const newUser = await this.authService.createUser(createUserDto);
    return {
      email: newUser.email, // 이메일
      profileImage: newUser.profileImage, // 프로필 이미지
      nickname: newUser.nickname, // 닉네임
      _id: newUser._id, // 회원 ID
    };
  }

  @Post('sign-in')
  @ApiOperation({ summary: '로그인' })
  async postSignIn(@Body() signInDto: SignInDto, @Req() req: expReq, @Res({ passthrough: true }) res: expRes) {
    try {
      const { accessToken, refreshToken } = await this.authService.signIn(signInDto);

      this.setRefreshTokenCookie(res, refreshToken);
      console.log('컨트롤러에서 전달한 accessToken', accessToken);
      // const domain = '.localhost';
      // res.cookie('refreshToken', refreshToken, {
      //   httpOnly: false,
      //   domain: domain,
      //   maxAge: 24 * 60 * 60 * 1000,
      // });

      return { accessToken };
    } catch (error) {
      // 쿠키의 리프레시 토큰 확인해서 만료 시 에러처리
      if (error instanceof UnauthorizedException && error.message === 'Token has expired') {
        const refreshToken = req.cookies?.refreshToken;
        const isExpired = await this.authService.isRefreshTokenExpired(refreshToken);
        if (isExpired) {
          throw new UnauthorizedException('Refresh token has expired');
        }
      }
      throw new UnauthorizedException('유효하지 않은 이메일이나 비밀번호를 입력하여 로그인이 실패하였습니다.');
    }
  }

  @Post('refresh-accessToken')
  @ApiOperation({ summary: '액세스 토큰 재발급' })
  async postRefreshAccessToken(@Req() req: expReq, @Res({ passthrough: true }) res) {
    try {
      // 헤더의 쿠키에서 리프레시 토큰 확인
      const refreshToken = req.cookies['refreshToken'];

      // 리프레시 토큰이 없으면 에러
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      // 리프레시 토큰 검증
      const { userId, authProvider } = await this.authService.verifyToken(refreshToken);

      // 액세스 토큰 재발급
      const { accessToken } = await this.authService.createAccessTokenAgain(userId, authProvider);

      return { accessToken };
    } catch (error) {
      return res.status(401).json(error);
    }
  }

  @Post('sign-in/kakao')
  @ApiOperation({ summary: '카카오 로그인' })
  async postSignInKakao(@Body('code') code: string, @Res({ passthrough: true }) res: expRes) {
    try {
      // 카카오에서 인증토큰 받아오기
      console.log('카카오 로그인 코드', code);
      const kakaoToken = await this.authService.fetchKakaoToken(code);
      console.log('카카오 로그인 코드', code);
      console.log('카카오 로그인 카카오토큰', kakaoToken);
      // 토큰을 카카오에게 전달한 후 유저 정보 받아오기
      const kakaoUserInfo = await this.authService.fetchKakaoUserInfo(kakaoToken);
      console.log('카카오 로그인 유저정보', kakaoUserInfo);
      // 우리 서버의 토큰 발행하기
      const { accessToken, refreshToken } = await this.authService.oauthSignIn(kakaoUserInfo);
      console.log('우리 서버 액세스토큰', accessToken);
      console.log('우리 서버 리프레시토큰', refreshToken);
      this.setRefreshTokenCookie(res, refreshToken);

      return { accessToken };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('카카오 로그인에 실패하였습니다.');
    }
  }

  @Delete('withdraw')
  @ApiOperation({ summary: '회원탈퇴' })
  async deleteWithdraw(@Req() req: expReq) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedException('request에 userId가 존재하지 않습니다.');
      }

      await this.authService.withdraw(userId);

      return { message: '회원탈퇴가 성공적으로 완료되었습니다.' };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('회원탈퇴가 실패하였습니다.');
    }
  }

  // 쿠키 환경 설정
  private setRefreshTokenCookie(res: expRes, refreshToken: string) {
    const commonOptions = {
      domain: process.env.COOKIE_DOMAIN,
      maxAge: 60 * 60 * 1000, // 1시간
    };

    let additionalOptions = {};

    // 배포환경
    if (process.env.NODE_ENV === 'production') {
      additionalOptions = {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      };
      // 개발 환경
    } else {
      additionalOptions = {
        httpOnly: false,
        sameSite: true,
      };
    }
    res.cookie('refreshToken', refreshToken, {
      ...commonOptions,
      ...additionalOptions,
    });
  }
}
