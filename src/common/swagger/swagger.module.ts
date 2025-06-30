import { Module } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

@Module({})
export class CustomSwaggerModule {
  static setup(app: any) {
    const config = new DocumentBuilder()
      .setTitle('TripTeller APIs')
      .setDescription('TripTeller APIs description')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
}
