import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://127.0.0.1:5500'],
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
