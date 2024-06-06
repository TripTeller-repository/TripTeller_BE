import { Body, Controller, Delete, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request as expReq, Response as expRes } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('sign-up')
  async postSignUp(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.createUser(createUserDto);
    return {
      email: newUser.email, // 이메일
      profileImage: newUser.profileImage, // 프로필 이미지
      nickname: newUser.nickname, // 닉네임
      _id: newUser._id, // 회원 ID
    };
  }

  // 로그인
  @Post('sign-in')
  async postSignIn(@Body() signInDto: SignInDto, @Req() req, @Res({ passthrough: true }) res: expRes) {
    try {
      const { accessToken, refreshToken } = await this.authService.signIn(signInDto);

      const domain = '.trip-teller.com' || '.localhost';

      res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: domain, maxAge: 24 * 60 * 60 * 1000 });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 이메일이나 비밀번호를 입력하여 로그인이 실패하였습니다.');
    }
  }

  // 카카오 로그인
  @Post('sign-in/kakao')
  async postSignInKakao(@Body('code') code: string) {
    try {
      // 카카오에서 토큰 받아오기
      const kakaoToken = await this.authService.fetchKakaoToken(code);
      // 토큰을 카카오에게 전달한 후 유저 정보 받아오기
      const kakaoUserInfo = await this.authService.fetchKakaoUserInfo(kakaoToken);
      // 우리 서버의 토큰 발행하기
      const token = await this.authService.oauthSignIn(kakaoUserInfo);
      return token;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('카카오 로그인에 실패하였습니다.');
    }
  }

  // 회원탈퇴
  @Delete('withdraw')
  async deleteWithdraw(@Req() req: expReq) {
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.withdraw(token);
    return { message: '회원탈퇴가 성공적으로 완료되었습니다.' };
  }
}
