import { Body, Controller, Delete, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request as expReq, Response as expRes } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatedUserDto } from './dto/created-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @ApiOperation({ summary: '회원가입', description: '사용자가 이메일과 비밀번호를 입력하면 회원가입을 한다.' })
  @ApiBody({
    description: '회원가입에 필요한 사용자 정보',
    type: CreateUserDto,
  })
  @ApiCreatedResponse({
    description: '유저 생성 성공',
    type: CreatedUserDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 401,
    description: '이미 가입된 계정입니다.',
  })
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
  @ApiOperation({ summary: '로그인', description: '회원 정보를 조회하여 로그인에 성공하면 토큰을 발행한다.' })
  @ApiBody({
    description: '로그인에 필요한 사용자 정보',
    type: SignInDto,
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공, 토큰 반환',
    schema: {
      example: { accessToken: 'your-jwt-access-token' },
    },
  })
  @ApiResponse({
    status: 401,
    description: '로그인 실패, 유효하지 않은 이메일 또는 비밀번호',
  })
  @ApiResponse({
    status: 401,
    description: '리프레시 토큰 만료',
  })
  async postSignIn(@Body() signInDto: SignInDto, @Req() req: expReq, @Res({ passthrough: true }) res: expRes) {
    try {
      const { accessToken, refreshToken } = await this.authService.signIn(signInDto);

      this.setRefreshTokenCookie(res, refreshToken);
      console.log('컨트롤러에서 전달한 accessToken', accessToken);

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
  @ApiOperation({
    summary: '액세스 토큰 재발급',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급한다.',
  })
  @ApiResponse({
    status: 200,
    description: '액세스 토큰 재발급 성공',
    schema: {
      example: { accessToken: 'new-access-token' },
    },
  })
  @ApiResponse({
    status: 401,
    description: '리프레시 토큰이 없거나 유효하지 않음',
    schema: {
      example: {
        statusCode: 401,
        message: 'Refresh token not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '리프레시 토큰 만료',
    schema: {
      example: {
        statusCode: 401,
        message: 'Refresh token has expired',
      },
    },
  })
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
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 인증을 통해 로그인하고, 서버에서 새로운 토큰을 발급한다.',
  })
  @ApiBody({
    description: '카카오 로그인에 필요한 인증 코드',
    type: String,
    schema: {
      example: '3e4a1f0b-34fd-4d2f-abc1-8e23f91a1e88',
    },
  })
  @ApiResponse({
    status: 200,
    description: '카카오 로그인 성공',
    schema: {
      example: { accessToken: 'new-access-token' },
    },
  })
  @ApiResponse({
    status: 401,
    description: '카카오 로그인 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '카카오 로그인에 실패하였습니다.',
      },
    },
  })
  async postSignInKakao(@Body('code') code: string, @Res({ passthrough: true }) res: expRes) {
    try {
      // 카카오에서 인증토큰 받아오기
      const kakaoToken = await this.authService.fetchKakaoToken(code);

      // 토큰을 카카오에게 전달한 후 유저 정보 받아오기
      const kakaoUserInfo = await this.authService.fetchKakaoUserInfo(kakaoToken);

      // 우리 서버의 토큰 발행하기
      const { accessToken, refreshToken } = await this.authService.oauthSignIn(kakaoUserInfo);
      this.setRefreshTokenCookie(res, refreshToken);

      return { accessToken };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('카카오 로그인에 실패하였습니다.');
    }
  }

  @Delete('withdraw')
  @ApiOperation({
    summary: '회원 탈퇴',
    description: '회원 탈퇴를 요청하여 해당 사용자의 계정을 삭제한다.',
  })
  @ApiResponse({
    status: 200,
    description: '회원 탈퇴 성공',
    schema: {
      example: {
        message: '회원탈퇴가 성공적으로 완료되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '회원 탈퇴 실패 (인증되지 않은 사용자)',
    schema: {
      example: {
        statusCode: 401,
        message: 'request에 userId가 존재하지 않습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '회원 없음 (존재하지 않는 회원)',
    schema: {
      example: {
        statusCode: 404,
        message: '해당 ID를 가진 회원이 없습니다.',
      },
    },
  })
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
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1시간
    };

    let additionalOptions = {};

    // 배포환경
    if (process.env.NODE_ENV === 'production') {
      additionalOptions = {
        secure: true,
        sameSite: 'none',
      };
      // 개발 환경
    } else {
      additionalOptions = {
        secure: false,
        sameSite: 'lax',
      };
    }
    res.cookie('refreshToken', refreshToken, {
      ...commonOptions,
      ...additionalOptions,
    });
  }
}
