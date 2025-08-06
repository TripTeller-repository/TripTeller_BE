import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { UserDevice } from './interfaces/user-device.interface';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Login extends Document {
  @Prop({ type: String, required: true })
  userId: string;

  // 로그인한 기기 정보 (브라우저, OS 등)
  @Prop({ type: Object, required: true })
  deviceInfo: UserDevice;

  // 로그인 시 클라이언트의 IP 주소
  @Prop({ type: String, required: true })
  ipAddress: string;

  // 마지막 로그인 시각
  @Prop({ type: Date, required: true, default: Date.now })
  lastLoginAt: Date;

  // 마지막 활동 시각 (선택적 필드)
  @Prop({ type: Date })
  lastActivityAt: Date;

  // 의심스러운 로그인으로 감지되었는지 여부
  @Prop({ type: Boolean, default: false })
  suspicious: boolean;
}

export const LoginSchema = SchemaFactory.createForClass(Login);
