import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// 소셜 로그인 사용자 정보 제공자 (Auth 공급자)
enum AuthProvider {
  GOOGLE = 'Google',
  NAVER = 'Naver',
  KAKAO = 'Kakao',
}

const defaultProfileImage =
  'https://tripteller-images.s3.ap-northeast-2.amazonaws.com/user-profile/%EC%8D%AC%EA%B5%AC%EB%A6%AC.webp';

@Schema({ timestamps: true, collection: 'User' })
export class User extends Document {
  // OAuth 공급자
  @Prop({ enum: AuthProvider, default: null })
  authProvider: AuthProvider | null;

  // 이메일 주소
  @Prop({ required: true })
  email: string;

  // 비밀번호
  @Prop()
  password: string | null;

  // 프로필 이미지 url
  @Prop({ default: defaultProfileImage })
  profileImage: string;

  // 닉네임
  // 사용자가 사이트에서 변경시 유효성 검사
  // (한글 또는 영어 1글자 필수 / 총 6자 이하)
  @Prop({ default: null })
  nickname: string;

  // 삭제일
  @Prop({ default: null })
  deletedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
