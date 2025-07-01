import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyScheduleSchema } from './daily-schedule.schema';
import { DailyPlanSchema } from '@daily-plan/daily-plan.schema';
import { TravelPlanSchema } from '@travel-plan/travel-plan.schema';
import { DailyScheduleService } from './daily-schedule.service';
import { DailyPlanService } from '@daily-plan/daily-plan.service';
import { DailyScheduleIndexService } from './daily-schedule-index.service';
import { TravelLogService } from '@travel-log/travel-log.service';
import { DailyScheduleController } from './daily-schedule.controller';
import { LoginSchema } from '@auth/login.schema';
import { UserSchema } from '@user/schemas/user.schema';
import { UserModule } from '@user/user.module';
import { FileModule } from '@common/files/file.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
    UserModule,
    FileModule,
  ],
  providers: [DailyPlanService, DailyScheduleService, DailyScheduleIndexService, TravelLogService],
  controllers: [DailyScheduleController],
})
export class DailyScheduleModule {}
