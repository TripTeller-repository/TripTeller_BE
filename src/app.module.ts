import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
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
import { AllExceptionsFilter } from 'common/filters/all-exceptions.filter';
import { ExpenseModule } from './expense/expense.module';
import { CommonModule } from './common/modules/common.module';
import { ConfigModule } from './common/config/config.module';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { SlackModule } from '@common/slack/slack.module';
import mongoose from 'mongoose';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        if (process.env.NODE_ENV === 'development') {
          mongoose.set('debug', true);
        }

        return {
          uri: configService.get<string>('mongoUri'),
        };
      },
      inject: [ConfigService],
    }),
    WinstonModule.forRoot(winstonConfig),
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
    CommonModule,
    SlackModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: 'APP_FILTER', useClass: AllExceptionsFilter }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, AuthMiddleware).forRoutes('*');
  }
}
