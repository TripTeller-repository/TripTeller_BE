import { Module } from '@nestjs/common';
import { OurTripController } from './our-trip.controller';
import { OurTripService } from './our-trip.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from '@feed/feed.schema';
import { TravelPlanSchema } from '@travel-plan/travel-plan.schema';
import { ScrapSchema } from '@scrap/scrap.schema';
import { AuthService } from '@auth/auth.service';
import { FeedModule } from '@feed/feed.module';
import { DailyPlanSchema } from '@daily-plan/daily-plan.schema';
import { LoginSchema } from '@auth/login.schema';
import { UserSchema } from '@user/schemas/user.schema';
import { UserModule } from '@user/user.module';
import { TwoFactorSchema } from '@auth/schemas/two-factor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feed', schema: FeedSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Scrap', schema: ScrapSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'Login', schema: LoginSchema },
      { name: 'TwoFactor', schema: TwoFactorSchema },
    ]),
    FeedModule,
    UserModule,
  ],
  providers: [OurTripService, AuthService],
  controllers: [OurTripController],
})
export class OurTripModule {}
