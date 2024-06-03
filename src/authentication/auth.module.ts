import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: {
          expiresIn: '1h', // 액세스 토큰 유효 기간: 1시간
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [AuthService, UserService],
  controllers: [AuthController],
})
export class AuthModule {}
