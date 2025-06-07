import { Module } from '@nestjs/common';
import { DailyPlanService } from './daily-plan.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyPlanSchema } from './daily-plan.schema';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { ExpenseService } from 'src/expense/expense.service';
import { ExpenseSchema } from 'src/expense/expense.schema';
import { DailyScheduleService } from 'src/daily-schedule/daily-schedule.service';
import { DailyScheduleSchema } from 'src/daily-schedule/daily-schedule.schema';
import { DailyPlanController } from './daily-plan.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'Expense', schema: ExpenseSchema },
      { name: 'DailySchedule', schema: DailyScheduleSchema },
    ]),
    UserModule,
  ],
  providers: [DailyPlanService, ExpenseService, DailyScheduleService],
  controllers: [DailyPlanController],
})
export class DailyPlanModule {}
