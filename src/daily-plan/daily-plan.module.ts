import { Module } from '@nestjs/common';
import { DailyPlanService } from './daily-plan.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyPlanSchema } from './daily-plan.schema';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { ExpenseService } from 'src/expense/expense.service';
import { ExpenseSchema } from 'src/expense/expense.schema';
import { DailyScheduleService } from 'src/daily-schedule/daily-schedule.service';
import { DailyScheduleSchema } from 'src/daily-schedule/daily-schedule.schema';
import { AuthService } from 'src/authentication/auth.service';
import { AuthModule } from 'src/authentication/auth.module';
import { UserSchema } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { DailyPlanController } from './daily-plan.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'Expense', schema: ExpenseSchema },
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'User', schema: UserSchema },
    ]),
    AuthModule,
  ],
  providers: [DailyPlanService, ExpenseService, DailyScheduleService, AuthService, UserService],
  controllers: [DailyPlanController],
})
export class DailyPlanModule {}
