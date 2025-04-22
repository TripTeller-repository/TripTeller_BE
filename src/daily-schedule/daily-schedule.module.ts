import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyScheduleSchema } from './daily-schedule.schema';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { DailyScheduleService } from './daily-schedule.service';
import { DailyPlanService } from 'src/daily-plan/daily-plan.service';
import { DailyScheduleIndexService } from './daily-schedule-index.service';
import { AuthModule } from 'src/authentication/auth.module';
import { AuthGuard } from 'src/authentication/auth.guard';
import { AuthService } from 'src/authentication/auth.service';
import { UserSchema } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { TravelLogService } from 'src/travel-log/travel-log.service';
import { DailyScheduleController } from './daily-schedule.controller';
import { LoginSchema } from 'src/authentication/login.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
    AuthModule,
  ],
  providers: [
    DailyPlanService,
    DailyScheduleService,
    DailyScheduleIndexService,
    AuthGuard,
    AuthService,
    UserService,
    TravelLogService,
  ],
  controllers: [DailyScheduleController],
})
export class DailyScheduleModule {}
