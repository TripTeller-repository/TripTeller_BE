import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// 소셜 로그인 사용자 정보 제공자 (Auth 공급자)
export enum AuthProvider {
  GOOGLE = 'Google',
  NAVER = 'Naver',
  KAKAO = 'Kakao',
}

@Schema({ timestamps: true, collection: 'UserOAuth' })
export class UserOAuth extends Document {
  // 연결된 사용자 ID
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  // OAuth 공급자
  @Prop({ enum: AuthProvider, required: true })
  provider: AuthProvider;

  // 공급자에서 제공하는 ID
  @Prop({ required: true })
  providerId: string;

  // 액세스 토큰
  @Prop({ default: null })
  accessToken: string | null;

  // 리프레시 토큰
  @Prop({ default: null })
  refreshToken: string | null;

  // 토큰 만료일
  @Prop({ default: null })
  tokenExpires: Date | null;

  // 공급자에서 제공받은 이메일
  @Prop()
  email: string;

  // 공급자에서 제공받은 프로필 데이터
  @Prop({ type: Object, default: {} })
  profile: Record<string, any>;

  // 마지막 사용 일시
  @Prop({ default: Date.now })
  lastUsedAt: Date;
}

export const UserOAuthSchema = SchemaFactory.createForClass(UserOAuth);

// 복합 인덱스 추가: provider + providerId는 고유해야 함
UserOAuthSchema.index({ provider: 1, providerId: 1 }, { unique: true });
