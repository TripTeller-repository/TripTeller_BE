import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { UserDevice } from './user-device.interface';

@Schema({ timestamps: true })
export class Login extends Document {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Object, required: true })
  deviceInfo: UserDevice;

  @Prop({ type: String, required: true })
  ipAddress: string;

  @Prop({ type: Date, required: true, default: Date.now })
  lastLoginAt: Date;

  @Prop({ type: Date, default: null })
  expiredAt: Date;
}

export const LoginSchema = SchemaFactory.createForClass(Login);
