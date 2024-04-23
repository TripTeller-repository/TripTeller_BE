import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignInDto } from './dto/signIn.dto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { CreateUserDto } from './dto/createUser.dto';

// 소셜 로그인 사용자 정보 제공자 (OAuth 공급자)
enum OAuthProvider {
  Google = 'google',
  Naver = 'naver',
  Kakao = 'kakao',
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly userService: UserService,
  ) {}

  ////// 회원 가입
  async createUser(createUserDto: CreateUserDto) {
    // DB에 중복된 이메일이 있는지 확인
    const existingEmail = await this.userModel.findOne({ email: createUserDto.email });
    if (existingEmail) {
      throw new UnauthorizedException('이미 가입된 계정입니다.');
    }

    // 비밀번호 해시화하여 암호 저장
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const newUser = {
      ...createUserDto,
      password: hashedPassword,
    };

    // 아닌 경우 회원가입 진행
    const user = await this.userModel.create(newUser);
    await user.save();
    return user;
  }

  ////// 토큰 생성
  // userId, oauthProvider을 기반으로 JWT 토큰을 생성
  // 추후 쿠키(res.cookie) 사용할 예정
  async createToken(userId: string, oauthProvider: string) {
    // JWT payload 생성
    const payload = { userId, oauthProvider };

    // Access Token 생성
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY);

    return { accessToken };
  }

  ////// 로그인
  async signIn(signInDto: SignInDto) {
    try {
      // 이메일로 특정 회원 조회
      const user = await this.userService.findByEmail(signInDto.email);

      // 회원이 존재하지 않을 경우
      if (!user || user === null || user === undefined) {
        throw new UnauthorizedException('등록되지 않은 회원입니다.');
      }

      // 탈퇴한 회원인지 확인
      if (user.deletedAt !== null) {
        throw new UnauthorizedException('이미 탈퇴한 회원입니다.');
      }

      // 비밀번호 생성
      const isPasswordValid = await this.verifyPassword(signInDto.password, user.password);

      // 비밀번호 확인
      if (!isPasswordValid) {
        throw new UnauthorizedException('잘못된 비밀번호입니다.');
      }

      // 해당 유저가 DB에 존재하고, user의 고유 ID가 있는 경우에는 토큰 발행
      if (user && user._id) {
        const token = await this.createToken(user._id, user.oauthProvider);
        return token;
      }
    } catch (error) {
      throw new UnauthorizedException('로그인에 실패하였습니다.');
    }
  }

  ////// 카카오 로그인 로직
  // 카카오한테 토큰 요청
  // 프론트에서 인증번호 넘겨줌
  async getKakaoToken(code: string | null) {
    try {
      const {
        data: { access_token },
      } = await axios({
        url: `https://kauth.kakao.com/oauth/token`,
        method: 'post',
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID,
          redirect_url: process.env.KAKAO_CALLBACK_URL,
          code, // 프론트측에서 넘겨준 코드
        },
      });
      return access_token;
    } catch (error) {
      throw error;
    }
  }

  // 받은 토큰 다시 넘겨주고 회원 정보 받아오기
  async getKakaoUserInfo(kakaoToken: string | null) {
    const result = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${kakaoToken}`,
      },
    });

    const { data } = result;
    const nickname = data.properties.nickname;
    const email = data.kakako_account.email;

    if (!nickname || !email) {
      throw new Error('닉네임 혹은 이메일이 없습니다.');
    }
  }

  ////// 소셜 로그인 성공 후 우리 서버로 로그인 처리
  async oauthSignIn(userInfo) {
    try {
      // 이메일로 회원 조회
      const { email } = userInfo;
      const user = await this.userService.findByEmail(email);

      // DB에 회원 정보가 존재하지 않으면 자동으로 가입되도록 함.
      // if (!user) {
      //   user = await this.userService.createUser(userInfo);
      // }

      // JWT 토큰 생성
      const { accessToken } = await this.createToken(user._id, OAuthProvider.Kakao);
      return { token: accessToken };
    } catch (error) {
      // 오류 발생시 에러 메시지 출력
      throw new UnauthorizedException('로그인에 실패하였습니다.');
    }
  }

  ////// 토큰 검증
  // 토큰에서 회원 정보 추출
  async verifyToken(token: string): Promise<{ userId: string; oauthProvider: string }> {
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY) as jwt.JwtPayload;
      const { userId, oauthProvider } = decodedToken;

      return { userId, oauthProvider };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // 토큰 기한 만료
        throw new UnauthorizedException('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        // 토큰 형식 문제
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Token verification error');
      }
    }
  }

  ////// 비밀번호 해쉬화
  async hashPassword(password: string) {
    const saltRounds = 15;
    return await bcrypt.hash(password, saltRounds);
  }

  ////// 비밀번호 확인
  async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  ////// 회원 탈퇴
  async withdraw(token: string) {
    try {
      // 토큰에 있는 회원 ID 확인
      const verifiedToken = await this.verifyToken(token);
      const { userId } = verifiedToken;

      // 회원 ID로 회원 조회
      const user = await this.userService.findById(userId);

      // DB에 있는 회원 id에서 deletedAt의 값을 현재 시각(date)로 만들기
      if (user) {
        await this.userService.deleteById(userId, new Date());
      } else {
        return { message: '해당하는 사용자를 찾을 수 없습니다.' };
      }
    } catch (error) {
      return { message: '회원 탈퇴 중 오류가 발생했습니다.' };
    }
  }

  // 탈퇴한 회원인지 확인
  async isWithDrawn(userId: string) {
    const user = await this.userModel.findById({ _id: userId });
    if (!user || user.deletedAt !== null) {
      throw new UnauthorizedException('이미 탈퇴한 회원입니다.');
    }
  }
}
