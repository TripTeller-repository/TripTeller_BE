import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
