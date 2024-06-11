import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// NODE_ENV 값에 따라 .env 파일을 다르게 읽음
dotenv.config({
  path: path.resolve(
    process.env.NODE_ENV === 'production'
      ? '.production.env' // 프로덕션 환경
      : '.development.env', // 로컬(개발) 환경
  ),
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const devList = ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:5173', 'http://127.0.0.1:5173'];

  const prodList = ['https://trip-teller.com', 'https://www.trip-teller.com'];

  const origin = process.env.NODE_ENV === 'development' ? devList : prodList;

  app.enableCors({
    origin,
    credentials: true,
  });

  app.use(cookieParser());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('TripTeller APIs')
    .setDescription('TripTeller APIs description')
    .setVersion('1.0')
    .addTag('group')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
