import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './middlewares/auth.middleware';
import mongoose from 'mongoose';
import { AuthModule } from './authentication/auth.module';
import { DailyPlanModule } from './daily-plan/daily-plan.module';
import { DailyScheduleModule } from './daily-schedule/daily-schedule.module';
import { MyTripModule } from './my-trip/my-trip.module';
import { OurTripModule } from './our-trip/our-trip.module';
import { ScrapModule } from './scrap/scrap.module';
import { SearchModule } from './search/search.module';
import { UserModule } from './user/user.module';
import { TravelPlanModule } from './travel-plan/travel-plan.module';
import { TravelLogModule } from './travel-log/travel-log.module';
import { AuthService } from './authentication/auth.service';
import { AllExceptionsFilter } from './utils/all-exceptions.filter';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ExpenseModule } from './expense/expense.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URL');
        const logger = winston.createLogger({
          level: 'info',
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
            }),
          ],
        });

        const conn = mongoose.createConnection(uri);

        // MongoDB 연결 상태에 따른 로그 출력
        let connectionStatus = '비정상';
        switch (conn.readyState) {
          case 0:
            connectionStatus = 'disconnected';
            break;
          case 1:
            connectionStatus = 'connected';
            break;
          case 2:
            connectionStatus = 'connecting';
            break;
          case 3:
            connectionStatus = 'disconnecting';
            break;
        }

        logger.info(`◆ 접속한 MongoDB 주소: ${uri}`);
        logger.info(`◆ MongoDB 연결 상태: ${conn.readyState}, ${connectionStatus}`);
        return { uri };
      },
      inject: [ConfigService],
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('TripTeller', { prettyPrint: true, colors: true }),
          ),
        }),
      ],
    }),
    AuthModule,
    DailyPlanModule,
    DailyScheduleModule,
    MyTripModule,
    OurTripModule,
    ScrapModule,
    SearchModule,
    UserModule,
    TravelPlanModule,
    TravelLogModule,
    ExpenseModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, { provide: 'APP_FILTER', useClass: AllExceptionsFilter }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
