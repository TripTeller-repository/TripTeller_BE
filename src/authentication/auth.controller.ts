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
  UseGuards,
} from '@nestjs/common';
import { Request as expReq, Response as expRes, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatedUserDto } from './dto/created-user.dto';
import { PasswordSerializerInterceptor } from './password.interceptor';
import { RateLimitGuard } from '@common/guards';
import { Setup2faDto } from './dto/setup-2fa.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { DeviceInfoUtil } from '@common/utils/device-info.util';

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
      const deviceInfo = DeviceInfoUtil.extractDeviceInfo(req);
      const ip = req.ip || req.socket.remoteAddress;

      // 디바이스 ID 쿠키 설정
      if (!req.cookies?.deviceId) {
        DeviceInfoUtil.setDeviceIdCookie(res, deviceInfo.deviceId);
      }

      // 로그인 시도
      const result = await this.authService.signIn(signInDto, deviceInfo, ip);

      // 2FA가 필요한 경우
      if (result.requiresTwoFactor) {
        return {
          requiresTwoFactor: true,
          isSuspiciousLogin: result.isSuspiciousLogin,
          suspiciousFactors: result.suspiciousFactors,
          tempToken: result.tempToken,
          userHas2FA: result.userHas2FA,
          message: result.isSuspiciousLogin
            ? '의심스러운 로그인이 감지되었습니다. 2단계 인증을 완료해주세요.'
            : '2단계 인증이 필요합니다.',
        };
      }

      // 일반 로그인 완료
      this.setRefreshTokenCookie(res, result.refreshToken);

      if (result.suspicious) {
        return {
          accessToken: result.accessToken,
          suspicious: true,
          message: '의심스러운 로그인이 감지되었습니다. 본인이 아니라면 비밀번호를 변경해주세요.',
        };
      }

      return { accessToken: result.accessToken };
    } catch (error) {
      throw new UnauthorizedException('로그인에 실패하였습니다.');
    }
  }

  @Post('refresh-accessToken')
  @ApiBearerAuth()
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
      const deviceInfo = DeviceInfoUtil.extractDeviceInfo(req);
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
      const deviceInfo = DeviceInfoUtil.extractDeviceInfo(req);
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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

  @Post('2fa/setup')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '2단계 인증 설정 시작',
    description: 'QR 코드를 생성하여 Google Authenticator 앱에 등록할 수 있도록 한다.',
  })
  async postSetup2FA(@Req() req: expReq) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedException('로그인이 필요합니다.');
      }
      return await this.authService.setup2FA(userId);
    } catch (error) {
      throw new UnauthorizedException('2FA 설정에 실패했습니다.');
    }
  }

  @Post('2fa/verify-setup')
  @ApiBearerAuth()
  @UseGuards(RateLimitGuard)
  @ApiOperation({
    summary: '2단계 인증 설정 완료',
    description: 'Google Authenticator에서 생성된 코드로 2FA 설정을 완료한다.',
  })
  async postVerify2FASetup(@Body() setup2faDto: Setup2faDto, @Req() req: expReq) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedException('로그인이 필요합니다.');
      }
      const result = await this.authService.verify2FASetup(userId, setup2faDto.token);
      return {
        message: '2단계 인증이 활성화되었습니다.',
        backupCodes: result.backupCodes,
      };
    } catch (error) {
      throw new UnauthorizedException('2FA 설정 완료에 실패했습니다.');
    }
  }

  @Post('2fa/verify')
  @UseGuards(RateLimitGuard)
  @ApiOperation({
    summary: '2단계 인증 완료',
    description: '임시 토큰과 2FA 코드로 로그인을 완료한다.',
  })
  async postVerify2FA(@Body() verify2faDto: Verify2faDto, @Res({ passthrough: true }) res: expRes) {
    // 디버깅용 콘솔
    console.log('[2FA DEBUG][CTRL] body', {
      hasTempToken: !!verify2faDto.tempToken,
      hasTotp: !!verify2faDto.totpCode,
      hasBackup: !!verify2faDto.backupCode,
      skipTwoFactor: verify2faDto.skipTwoFactor,
    });

    try {
      const result = await this.authService.verify2FALogin(
        verify2faDto.tempToken,
        verify2faDto.totpCode,
        verify2faDto.skipTwoFactor,
        verify2faDto.backupCode,
      );

      this.setRefreshTokenCookie(res, result.refreshToken);
      this.setAccessTokenCookie(res, result.accessToken);

      return {
        accessToken: result.accessToken,
        user: result.user,
      };
    } catch (error) {
      throw new UnauthorizedException('2FA 인증에 실패했습니다.');
    }
  }

  @Post('2fa/disable')
  @ApiBearerAuth()
  @UseGuards(RateLimitGuard)
  @ApiOperation({
    summary: '2단계 인증 비활성화',
    description: '현재 2FA 코드로 인증 후 2단계 인증을 비활성화한다.',
  })
  async postDisable2FA(@Body() setup2faDto: Setup2faDto, @Req() req: expReq) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedException('로그인이 필요합니다.');
      }
      return await this.authService.disable2FA(userId, setup2faDto.token);
    } catch (error) {
      throw new UnauthorizedException('2FA 비활성화에 실패했습니다.');
    }
  }

  @Get('2fa/status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '2단계 인증 상태 확인',
    description: '현재 사용자의 2FA 활성화 여부를 확인한다.',
  })
  async get2FAStatus(@Req() req: expReq) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedException('로그인이 필요합니다.');
      }
      return await this.authService.get2FAStatus(userId);
    } catch (error) {
      throw new UnauthorizedException('2FA 상태 조회에 실패했습니다.');
    }
  }

  @Post('2fa/backup-codes')
  @ApiBearerAuth()
  @UseGuards(RateLimitGuard)
  @ApiOperation({
    summary: '백업 코드 재생성',
    description: '기존 백업 코드를 모두 사용한 경우 새로운 백업 코드를 생성한다.',
  })
  async postRegenerateBackupCodes(@Body() setup2faDto: Setup2faDto, @Req() req: expReq) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedException('로그인이 필요합니다.');
      }
      return await this.authService.generateNewBackupCodes(userId, setup2faDto.token);
    } catch (error) {
      throw new UnauthorizedException('백업 코드 재생성에 실패했습니다.');
    }
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
