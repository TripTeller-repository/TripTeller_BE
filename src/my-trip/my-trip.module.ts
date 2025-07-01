import { Module } from '@nestjs/common';
import { MyTripService } from './my-trip.service';
import { MyTripController } from './my-trip.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from '@feed/feed.schema';
import { TravelPlanService } from '@travel-plan/travel-plan.service';
import { TravelPlanSchema } from '@travel-plan/travel-plan.schema';
import { DailyPlanSchema } from '@daily-plan/daily-plan.schema';
import { ScrapSchema } from '@scrap/scrap.schema';
import { FeedModule } from '@feed/feed.module';
import { AuthService } from '@auth/auth.service';
import { LoginSchema } from '@auth/login.schema';
import { UserSchema } from '@user/schemas/user.schema';
import { UserModule } from '@user/user.module';
import { FileModule } from '@common/files/file.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feed', schema: FeedSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Scrap', schema: ScrapSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
    FeedModule,
    UserModule,
    FileModule,
  ],
  providers: [MyTripService, TravelPlanService, AuthService],
  controllers: [MyTripController],
})
export class MyTripModule {}
