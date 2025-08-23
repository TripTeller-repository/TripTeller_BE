import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { CustomSwaggerModule } from './common/swagger/swagger.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string[]>('allowedOrigins'),
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // DTO 타입으로 캐스팅
      whitelist: true, // DTO에 없는 필드는 제거
      forbidNonWhitelisted: false, // 허용X 필드 있으면 400 (원하면 true)
      transformOptions: {
        enableImplicitConversion: true, // @Type 없이도 기본형 변환 허용
      },
    }),
  );

  CustomSwaggerModule.setup(app);

  await app.listen(configService.get<number>('port'));
}

bootstrap();
