import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Res,
  UnauthorizedException,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Request as expReq, Response as expRes, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatedUserDto } from './dto/created-user.dto';
import { PasswordSerializerInterceptor } from './password.interceptor';

@UseInterceptors(PasswordSerializerInterceptor)
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
      // 디바이스 정보 추출
      const deviceInfo = this.extractDeviceInfo(req);
      const ip = req.ip || req.socket.remoteAddress;

      // 로그인 시도
      const { accessToken, refreshToken, suspicious } = await this.authService.signIn(signInDto, deviceInfo, ip);

      // 쿠키에 토큰 설정
      this.setRefreshTokenCookie(res, refreshToken);

      // 의심스러운 로그인이면 클라이언트에 알림
      if (suspicious) {
        return {
          accessToken,
          suspicious: true,
          message: '의심스러운 로그인이 감지되었습니다. 본인이 아니라면 비밀번호를 변경해주세요.',
        };
      }

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('로그인에 실패하였습니다.');
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
  async postRefreshToken(@Req() req: expReq, @Res({ passthrough: true }) res: expRes) {
    try {
      // 헤더의 쿠키에서 리프레시 토큰 확인
      const refreshToken = req.cookies['refreshToken'];

      // 리프레시 토큰이 없으면 에러
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      // 디바이스 정보 추출
      const deviceInfo = this.extractDeviceInfo(req);
      const ip = req.ip || req.socket.remoteAddress;

      // 액세스 토큰 재발급
      const { accessToken, suspicious } = await this.authService.refreshAccessToken(refreshToken, deviceInfo, ip);

      // 쿠키에 새 액세스 토큰 설정
      this.setAccessTokenCookie(res, accessToken);

      // 의심스러운 로그인 감지 시 추가 정보 반환
      if (suspicious) {
        return { accessToken, suspicious: true, message: '의심스러운 로그인이 감지되었습니다.' };
      }

      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('액세스 토큰 재발급에 실패했습니다.');
    }
  }

  @Get('sign-in/kakao')
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 인증을 통해 로그인하고, 서버에서 새로운 토큰을 발급한다.',
  })
  @ApiResponse({
    status: 302,
    description: '카카오 로그인 성공 후 프론트엔드 리다이렉트 페이지로 이동',
    headers: {
      Location: {
        description: '리다이렉션 URL',
        example: 'https://www.trip-teller.com/login/redirect',
      },
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
  async postSignInKakao(@Query('code') code: string, @Req() req: expReq, @Res({ passthrough: true }) res: expRes) {
    try {
      // 카카오에서 인증토큰 받아오기
      const kakaoToken = await this.authService.fetchKakaoToken(code);

      // 토큰을 카카오에게 전달한 후 유저 정보 받아오기
      const kakaoUserInfo = await this.authService.fetchKakaoUserInfo(kakaoToken);

      // 디바이스 정보 추출
      const deviceInfo = this.extractDeviceInfo(req);
      const ip = req.ip || req.socket.remoteAddress;

      // 우리 서버의 토큰 발행하기
      const { accessToken, refreshToken } = await this.authService.oauthSignIn(kakaoUserInfo, deviceInfo, ip);

      this.setRefreshTokenCookie(res, refreshToken);
      this.setAccessTokenCookie(res, accessToken);

      return res.redirect(process.env.KAKAO_REDIRECT_URI);
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
  async deleteWithdraw(@Req() req: expReq, @Res({ passthrough: true }) res: expRes) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedException('request에 userId가 존재하지 않습니다.');
      }

      await this.authService.withdraw(userId);

      // 쿠키에서 토큰 제거
      this.clearTokenCookies(res);

      return { message: '회원탈퇴가 성공적으로 완료되었습니다.' };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('회원탈퇴가 실패하였습니다.');
    }
  }

  @Post('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '현재 기기에서 로그아웃한다.',
  })
  async postLogout(@Req() req: expReq, @Res({ passthrough: true }) res: expRes) {
    try {
      this.clearTokenCookies(res);

      return { message: '로그아웃 되었습니다.' };
    } catch (error) {
      throw new UnauthorizedException('로그아웃에 실패했습니다.');
    }
  }

  @Get('login-history')
  @ApiOperation({
    summary: '로그인 이력 조회',
    description: '사용자의 로그인 이력을 조회한다.',
  })
  async getLoginHistory(@Req() req: expReq) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedException('유효하지 않은 사용자 정보입니다.');
      }

      // 로그인 이력 조회
      const loginHistory = await this.authService.getLoginHistory(userId);

      return { loginHistory };
    } catch (error) {
      throw new UnauthorizedException('로그인 이력 조회에 실패했습니다.');
    }
  }

  // 디바이스 정보 추출 메서드
  private extractDeviceInfo(req: expReq): any {
    const userAgent = req.headers['user-agent'] || '';

    // 간단한 디바이스 정보 추출 로직
    const browser = this.detectBrowser(userAgent);
    const os = this.detectOS(userAgent);

    return {
      deviceId: req.cookies.deviceId || `device_${this.detectBrowser(userAgent)}_${Date.now()}`,
      browser,
      os,
      userAgent,
    };
  }

  // 브라우저 감지
  private detectBrowser(userAgent: string): string {
    // Edge (Chromium 기반) - 반드시 가장 먼저 확인해야 함
    if (/Edg\//.test(userAgent)) {
      return 'Edge';
    }

    // Edge (레거시)
    if (/Edge\//.test(userAgent)) {
      return 'Edge';
    }

    // Firefox
    if (/Firefox\//.test(userAgent) && !/ Seamonkey\//.test(userAgent)) {
      return 'Firefox';
    }

    // Chrome - Edge 및 다른 Chromium 기반 브라우저 체크 후에 확인
    if (
      /Chrome\//.test(userAgent) &&
      !/Chromium\//.test(userAgent) &&
      !/Edg\//.test(userAgent) &&
      !/OPR\//.test(userAgent)
    ) {
      return 'Chrome';
    }

    // Safari - Chrome 체크 후 확인 (Safari는 Chrome UA 문자열에도 포함됨)
    if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent) && !/Chromium\//.test(userAgent)) {
      return 'Safari';
    }

    // Internet Explorer
    if (/MSIE(\d+\.\d+);/.test(userAgent) || /Trident\//.test(userAgent)) {
      return 'Internet Explorer';
    }

    // Thunder Client
    if (/Thunder Client/.test(userAgent)) {
      return 'Thunder Client';
    }

    // 기타 API 클라이언트
    if (/Postman/.test(userAgent)) {
      return 'Postman';
    }

    if (/curl/.test(userAgent)) {
      return 'curl';
    }

    return 'Unknown';
  }

  // OS 감지
  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  // 쿠키에서 모든 토큰 제거
  private clearTokenCookies(res: expRes) {
    const options = {
      ...this.getCookieOptions(),
      httpOnly: true,
      expires: new Date(0),
    };

    res.clearCookie('refreshToken', options);
  }

  // 쿠키 옵션 공통 부분
  private getCookieOptions(): CookieOptions {
    const isProd = process.env.NODE_ENV === 'production';

    return {
      domain: process.env.COOKIE_DOMAIN,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    };
  }

  // 액세스 토큰 쿠키 설정
  private setAccessTokenCookie(res: expRes, accessToken: string) {
    const options = {
      ...this.getCookieOptions(),
      maxAge: 60 * 1000 * 10, // 10분
    };

    res.cookie('accessToken', accessToken, options);
  }

  // 리프레시 토큰 쿠키 설정
  private setRefreshTokenCookie(res: expRes, refreshToken: string) {
    const options: CookieOptions = {
      ...this.getCookieOptions(),
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1시간
    };

    res.cookie('refreshToken', refreshToken, options);
  }
}
