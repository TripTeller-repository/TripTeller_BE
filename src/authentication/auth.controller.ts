import { Body, Controller, Delete, Get, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/authentication/dto/createUser.dto';
import { SignInDto } from './dto/signIn.dto';

interface IOAuthUser {
  user: {
    name: string;
    email: string;
    password: string;
  };
}

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
  async postSignIn(@Body() signInDto: SignInDto) {
    try {
      const token = this.authService.signIn(signInDto);
      return token;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 이메일이나 비밀번호를 입력하여 로그인이 실패하였습니다.');
    }
  }

  ////// 카카오 로그인
  // 프론트에서 인가 코드 넘겨줌
  // 카카오에게 토큰 요청
  @Post('sign-in/kakao')
  async postSignInKakao(@Query('code') code: string) {
    try {
      // 카카오에서 토큰 받아오기
      console.log('code', code)  // 인가 코드 확인
      const kakaoToken = await this.authService.fetchKakaoToken(code);
      // 토큰을 카카오에게 전달한 후 유저 정보 받아오기
      const kakaoUserInfo = await this.authService.fetchKakaoUserInfo(kakaoToken);
      // 우리 서버의 토큰 발행하기
      const token = await this.authService.oauthSignIn(kakaoUserInfo);
      // 토큰에 oauthProvider 정보 넣어주기
      ///
    } catch (error) {
      throw error;
    }
  }

  // 회원탈퇴
  @Delete('withdraw')
  async deleteWithdraw(@Req() req: Request) {
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.withdraw(token);
    return { message: '회원탈퇴가 성공적으로 완료되었습니다.' };
  }

  // 토큰 검증 (테스트용)
  @Get('token-verification')
  async getVerifyToken(@Req() req: Request) {
    // 헤더에서 토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    // 토큰 유무 검증
    // 로그인한 회원만 서비스를 이용할 수 있도록 함.
    if (!token) {
      return { success: false, message: '토큰이 제공되지 않았습니다.' };
    }
    // 토큰 검증함
    try {
      const decodedToken = await this.authService.verifyToken(token);
      return { success: true, payload: decodedToken };
    } catch (error) {
      return { success: false, message: '토큰 검증에 실패하였습니다.' };
    }
  }
}
