import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginSchema } from './login.schema';
import { UserSchema } from '@user/schemas/user.schema';
import { UserModule } from '@user/user.module';
import { TwoFactorSchema } from './schemas/two-factor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Login', schema: LoginSchema },
      { name: 'TwoFactor', schema: TwoFactorSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    UserModule,
  ],
  providers: [AuthService],
  exports: [AuthService, MongooseModule],
  controllers: [AuthController],
})
export class AuthModule {}
