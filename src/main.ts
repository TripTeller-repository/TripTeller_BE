import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { CustomSwaggerModule } from './common/swagger/swagger.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string[]>('allowedOrigins'),
    credentials: true,
  });

  app.use(cookieParser());

  CustomSwaggerModule.setup(app);

  await app.listen(configService.get<number>('port'));
}

bootstrap();
