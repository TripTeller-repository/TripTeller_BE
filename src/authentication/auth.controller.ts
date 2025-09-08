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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
    description: '2단계 인증 필요 (선택적 2단계 인증)',
    schema: {
      type: 'object',
      properties: {
        requiresTwoFactor: { type: 'boolean', example: true },
        isSuspiciousLogin: { type: 'boolean', example: true },
        suspiciousFactors: {
          type: 'array',
          items: { type: 'string' },
          example: ['기기 또는 위치 변경 감지'],
        },
        tempToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        userHas2FA: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: '의심스러운 로그인이 감지되었습니다. 2단계 인증을 완료해주세요.',
        },
      },
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

      // 로그인 검증 (토큰 발급 없이)
      const result = await this.authService.validateSignIn(signInDto, deviceInfo, ip);

      // 2FA나 의심스러운 로그인이 필요한 경우
      if (result.requiresTwoFactor || result.isSuspiciousLogin) {
        return {
          requiresTwoFactor: result.requiresTwoFactor,
          isSuspiciousLogin: result.isSuspiciousLogin,
          suspiciousFactors: result.suspiciousFactors,
          tempToken: result.tempToken,
          userHas2FA: result.userHas2FA,
          message: result.isSuspiciousLogin ? '의심스러운 로그인이 감지되었습니다.' : '2단계 인증이 필요합니다.',
        };
      }

      // 정상 로그인 - 바로 토큰 발급
      const tokens = await this.authService.proceedLogin(result.tempToken);
      this.setRefreshTokenCookie(res, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        message: '로그인이 완료되었습니다.',
      };
    } catch (error) {
      throw new UnauthorizedException('로그인에 실패하였습니다.');
    }
  }

  @Post('sign-in/proceed')
  @ApiOperation({
    summary: '첫 로그인 이후 그냥 로그인 선택 시 진행',
    description: 'tempToken으로 일반 로그인을 진행한다.',
  })
  @ApiBody({
    description: '임시 토큰',
    schema: {
      type: 'object',
      properties: {
        tempToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 완료',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: '새로 발급된 액세스 토큰',
          example: 'eyJhbGciOiJIUzI1N...',
        },
        message: {
          type: 'string',
          example: '로그인이 완료되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '로그인 진행 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '로그인 진행에 실패했습니다.',
      },
    },
  })
  async proceedSignIn(@Body() body: { tempToken: string }, @Res({ passthrough: true }) res: expRes) {
    try {
      const result = await this.authService.proceedLogin(body.tempToken);
      this.setRefreshTokenCookie(res, result.refreshToken);

      return {
        accessToken: result.accessToken,
        message: '로그인이 완료되었습니다.',
      };
    } catch (error) {
      throw new UnauthorizedException('로그인 진행에 실패했습니다.');
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
        message: '리프레시 토큰이 없거나 유효하지 않습니다.',
      },
    },
  })
  async postRefreshToken(@Req() req: expReq, @Res({ passthrough: true }) res: expRes) {
    try {
      // 헤더의 쿠키에서 리프레시 토큰 확인
      const refreshToken = req.cookies['refreshToken'];

      // 리프레시 토큰이 없으면 에러
      if (!refreshToken) {
        throw new UnauthorizedException('리프레시 토큰이 없습니다.');
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
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '현재 기기에서 로그아웃되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (로그인되지 않은 사용자)',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: '로그인이 필요합니다.',
        },
        error: {
          type: 'string',
          example: 'Unauthorized',
        },
      },
    },
  })
  async postLogout(@Req() req: expReq, @Res({ passthrough: true }) res: expRes) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('로그인이 필요합니다.');

    const refreshToken = req.cookies['refreshToken'];
    const { deviceId } = DeviceInfoUtil.extractDeviceInfo(req);

    await this.authService.revokeSession({ userId, deviceId, refreshToken });

    this.clearTokenCookies(res);
    return { message: '현재 기기에서 로그아웃되었습니다.' };
  }

  @Get('login-history')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '로그인 이력 조회',
    description: '사용자의 로그인 이력을 조회한다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 이력 조회 성공',
    schema: {
      type: 'object',
      properties: {
        loginHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '68be7952577946cafc302963' },
              userId: { type: 'string', example: '68adc583b7ba0e9c6465d814' },
              deviceInfo: {
                type: 'object',
                properties: {
                  browser: { type: 'string', example: 'Chrome 139.0.0.0' },
                  os: { type: 'string', example: 'Windows 10' },
                  device: { type: 'string', example: 'Desktop' },
                  userAgent: {
                    type: 'string',
                    example:
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                  },
                  deviceId: {
                    type: 'string',
                    example: 'device_1756255632792_1mql30rh6qr',
                  },
                },
              },
              ipAddress: { type: 'string', example: '::ffff:127.0.0.1' },
              lastLoginAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-09-08T06:36:02.210Z',
              },
              suspicious: { type: 'boolean', example: false },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-09-08T06:36:02.229Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-09-08T06:36:02.229Z',
              },
              __v: { type: 'number', example: 0 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '로그인 이력 조회 실패 (인증되지 않은 사용자)',
    schema: {
      example: {
        statusCode: 401,
        message: '유효하지 않은 사용자 정보입니다.',
      },
    },
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
  @ApiOperation({
    summary: '2단계 인증 설정 시작',
    description: `
    2단계 인증(2FA) 설정을 시작한다.
    
    - Google Authenticator 등의 TOTP 앱에서 사용할 수 있는 QR 코드를 생성한다.
    - QR 코드는 10분 후 만료된다.
    - 이미 2FA가 활성화된 경우 에러를 반환한다.
    - 설정 완료를 위해서는 별도의 verify 엔드포인트에서 인증 코드를 확인해야 한다.
  `,
  })
  @ApiResponse({
    status: 200,
    description: '2FA 설정 성공',
    schema: {
      type: 'object',
      properties: {
        qrCode: {
          type: 'string',
          description: 'QR 코드 이미지 (Base64 Data URL)',
          example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51...',
        },
        manualEntryKey: {
          type: 'string',
          description: '수동 입력용 비밀 키',
          example: 'JBSWY3DPEHPK3PXP',
        },
        expiresAt: {
          type: 'number',
          description: 'QR 코드 만료 시간 (Unix timestamp)',
          example: 1640995200000,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 2FA 설정 실패',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '로그인이 필요합니다.',
        },
        statusCode: {
          type: 'number',
          example: 401,
        },
        error: {
          type: 'string',
          example: 'Unauthorized',
        },
      },
      examples: {
        notLoggedIn: {
          summary: '로그인 필요',
          value: {
            message: '로그인이 필요합니다.',
            statusCode: 401,
            error: 'Unauthorized',
          },
        },
        userNotFound: {
          summary: '사용자를 찾을 수 없음',
          value: {
            message: '사용자를 찾을 수 없습니다.',
            statusCode: 401,
            error: 'Unauthorized',
          },
        },
        alreadyEnabled: {
          summary: '이미 2FA가 활성화됨',
          value: {
            message: '이미 2단계 인증이 활성화되어 있습니다.',
            statusCode: 401,
            error: 'Unauthorized',
          },
        },
        setupFailed: {
          summary: '일반적인 설정 실패',
          value: {
            message: '2FA 설정에 실패했습니다.',
            statusCode: 401,
            error: 'Unauthorized',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 410,
    description: '2FA 설정 시간 만료',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '2FA 설정 시간이 만료되었습니다. 다시 QR을 발급받아 시작하세요.',
        },
        statusCode: {
          type: 'number',
          example: 410,
        },
        error: {
          type: 'string',
          example: 'Gone',
        },
      },
    },
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

      return {
        accessToken: result.accessToken,
        user: result.user,
        message: '2단계 인증이 완료되었습니다.',
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
  @ApiOkResponse({
    description: '2FA 상태 조회 성공',
    schema: {
      example: {
        enabled: false,
        backupCodesCount: 0,
        setupCompletedAt: null,
        lastAuthenticatedAt: null,
      },
      properties: {
        enabled: { type: 'boolean', description: '2FA 활성화 여부' },
        backupCodesCount: { type: 'number', description: '남은 백업 코드 개수' },
        setupCompletedAt: { type: 'string', format: 'date-time', nullable: true, description: '설정 완료 시각' },
        lastAuthenticatedAt: { type: 'string', format: 'date-time', nullable: true, description: '마지막 인증 시각' },
      },
    },
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
