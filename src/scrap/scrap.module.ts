import { Module } from '@nestjs/common';
import { ScrapController } from './scrap.controller';
import { ScrapService } from './scrap.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapSchema } from './scrap.schema';
import { TravelPlanSchema } from '@travel-plan/travel-plan.schema';
import { DailyPlanSchema } from '@daily-plan/daily-plan.schema';
import { AuthService } from '@auth/auth.service';
import { LoginSchema } from '@auth/login.schema';
import { UserSchema } from '@user/schemas/user.schema';
import { UserModule } from '@user/user.module';
import { CommonModule } from '@common/modules/common.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Scrap', schema: ScrapSchema },
      { name: 'User', schema: UserSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
    UserModule,
    CommonModule,
    AuthModule,
  ],
  providers: [ScrapService, AuthService],
  controllers: [ScrapController],
})
export class ScrapModule {}
