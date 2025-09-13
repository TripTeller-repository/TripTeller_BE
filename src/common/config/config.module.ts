import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configuration } from './config.service';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `.${process.env.NODE_ENV ?? 'development'}.env`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        PORT: Joi.number().default(3000),
        MONGODB_URL: Joi.string().required(),

        // 카카오 로그인
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().required(),
        KAKAO_REDIRECT_URI: Joi.string().required(),

        // 서버 비밀키
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_TEMP_SECRET: Joi.string().min(32).required(),

        // AWS S3
        AWS_S3_ACCESSKEYID: Joi.string().required(),
        AWS_S3_SECRETACCESSKEY: Joi.string().required(),
        AWS_S3_REGION: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
        AWS_S3_IMG_DIRECTORY: Joi.string().required(),

        // 기타
        DATABASE_HOST: Joi.string().required(),
        COOKIE_DOMAIN: Joi.string().required(),
        SLACK_WEBHOOK_URL: Joi.string().uri().optional(),
      }),
    }),
  ],
})
export class ConfigModule {}
