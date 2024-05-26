import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './authentication/auth.controller';
import { UserController } from './user/user.controller';
import { AuthService } from './authentication/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema } from './user/user.schema';
import { UserService } from './user/user.service';
import { ScrapSchema } from './scrap/scrap.schema';
import { DailyScheduleSchema } from './dailySchedule/dailySchedule.schema';
import { FeedSchema } from './feed/feed.schema';
import { FeedController } from './feed/feed.controller';
import { FeedService } from './feed/feed.service';
import { ScrapController } from './scrap/scrap.controller';
import { ScrapService } from './scrap/scrap.service';
import { DailyScheduleService } from './dailySchedule/dailySchedule.service';
import { AuthMiddleware } from './authentication/auth.middleware';
import { TravelPlanService } from './travelPlan/travelPlan.service';
import mongoose from 'mongoose';
import { ExpenseSchema } from './expense/expense.schema';
import { TravelPlanSchema } from './travelPlan/travelPlan.schema';
import { FeedsController } from './feed/feeds.controller';
import { TravelPlanController } from './travelPlan/travelPlan.controller';
import { ExpenseService } from './expense/expense.service';
import { TravelLogService } from './travelLog/travelLog.service';
import { DailyScheduleController } from './dailySchedule/dailySchedule.controller';
import { FeedsService } from './feed/feeds.service';
import { DailyPlanSchema } from './dailyPlan/dailyPlan.schema';
import { DailyPlanService } from './dailyPlan/dailyPlan.service';
import { DailyPlanController } from './dailyPlan/dailyPlan.controller';
import { FeedExtractor } from './utils/feedExtractor';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: '1h', // 토큰 유효 기간: 1시간
      },
    }),
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
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Scrap', schema: ScrapSchema },
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'Expense', schema: ExpenseSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'Feed', schema: FeedSchema },
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    FeedController,
    FeedsController,
    ScrapController,
    TravelPlanController,
    DailyPlanController,
    DailyScheduleController,
  ],
  providers: [
    AppService,
    ConfigService,
    UserService,
    AuthService,
    FeedService,
    FeedsService,
    ScrapService,
    DailyScheduleService,
    TravelPlanService,
    DailyPlanService,
    ExpenseService,
    TravelLogService,
    FeedExtractor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        ScrapController,
        UserController,
        FeedController,
        TravelPlanController,
        DailyPlanController,
        DailyScheduleController,
      );
  }
}
