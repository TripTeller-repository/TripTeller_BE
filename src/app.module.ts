import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './authentication/auth.middleware';
import mongoose from 'mongoose';
import { AuthModule } from './authentication/auth.module';
import { DailyPlanModule } from './daily-plan/daily-plan.module';
import { DailyscheduleModule } from './daily-schedule/daily-schedule.module';
import { MyTripModule } from './my-trip/my-trip.module';
import { OurTripModule } from './our-trip/our-trip.module';
import { ScrapModule } from './scrap/scrap.module';
import { SearchModule } from './search/search.module';
import { UserModule } from './user/user.module';
import { TravelPlanModule } from './travel-plan/travel-plan.module';
import { TravelLogModule } from './travel-log/travel-log.module';
import { AuthService } from './authentication/auth.service';
import { UserController } from './user/user.controller';
import { TravelPlanController } from './travel-plan/travel-plan.controller';
import { SearchController } from './search/search.controller';
import { ScrapController } from './scrap/scrap.controller';
import { OurTripController } from './our-trip/our-trip.controller';
import { MyTripController } from './my-trip/my-trip.controller';
import { DailyScheduleController } from './daily-schedule/daily-schedule.controller';
import { DailyPlanController } from './daily-plan/daily-plan.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 비동기 실행을 위해 forRootAsync 함수 사용
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      // 다른 모듈에서 imports 에 등록 안해도 사용할 수 있도록 함.
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URL');
        const conn = await mongoose.createConnection(uri);
        console.log('◆ 접속한 MongoDB 주소: ', uri);
        console.log('◆ MongoDB 연결 상태: ', conn.readyState);
        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    DailyPlanModule,
    DailyscheduleModule,
    MyTripModule,
    OurTripModule,
    ScrapModule,
    SearchModule,
    UserModule,
    TravelPlanModule,
    TravelLogModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        DailyPlanController,
        DailyScheduleController,
        MyTripController,
        OurTripController,
        ScrapController,
        UserController,
        SearchController,
        TravelPlanController,
      );
  }
}
