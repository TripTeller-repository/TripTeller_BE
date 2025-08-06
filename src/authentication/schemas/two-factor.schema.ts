import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'TwoFactor' })
export class TwoFactor extends Document {
  // 사용자 ID (User 컬렉션과 연결)
  @Prop({ type: String, required: true, unique: true })
  userId: string;

  // 2FA 시크릿 키 (speakeasy에서 생성)
  @Prop({ required: true })
  secret: string;

  // 2FA 활성화 여부
  @Prop({ default: true })
  enabled: boolean;

  // 백업 코드들
  @Prop({ type: [String], default: [] })
  backupCodes: string[];

  // 임시 2FA 시크릿 (설정 과정에서만 사용)
  @Prop({ default: null })
  tempSecret: string | null;

  // 마지막 2FA 인증 시간
  @Prop({ default: null })
  lastAuthenticatedAt: Date | null;

  // 설정 완료 시간
  @Prop({ default: Date.now })
  setupCompletedAt: Date;

  // 2FA 비활성화 시간 (null이면 활성화 상태)
  @Prop({ default: null })
  disabledAt: Date | null;
}

export const TwoFactorSchema = SchemaFactory.createForClass(TwoFactor);

// 인덱스 설정
TwoFactorSchema.index({ userId: 1 }, { unique: true });
