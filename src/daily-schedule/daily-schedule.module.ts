import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyScheduleSchema } from './daily-schedule.schema';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { DailyScheduleService } from './daily-schedule.service';
import { DailyPlanService } from 'src/daily-plan/daily-plan.service';
import { ExpenseService } from 'src/expense/expense.service';
import { ExpenseSchema } from 'src/expense/expense.schema';
import { DailyScheduleIndexService } from './daily-schedule-index.service';
import { AuthModule } from 'src/authentication/auth.module';
import { CustomAuthGuard } from 'src/authentication/auth.guard';
import { AuthService } from 'src/authentication/auth.service';
import { UserSchema } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { TravelLogService } from 'src/travel-log/travel-log.service';
import { DailyScheduleController } from './daily-schedule.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'User', schema: UserSchema },
    ]),
    AuthModule,
  ],
  providers: [
    DailyPlanService,
    DailyScheduleService,
    DailyScheduleIndexService,
    CustomAuthGuard,
    AuthService,
    UserService,
    TravelLogService,
  ],
  controllers: [DailyScheduleController],
})
export class DailyScheduleModule {}
