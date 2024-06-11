import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyPlanController } from 'src/daily-plan/daily-plan.controller';
import { DailyScheduleSchema } from './daily-schedule.schema';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';
import { TravelPlanSchema } from 'src/travel-plan/travel-plan.schema';
import { DailyScheduleService } from './daily-schedule.service';
import { DailyPlanService } from 'src/daily-plan/daily-plan.service';
import { ExpenseService } from 'src/expense/expense.service';
import { ExpenseSchema } from 'src/expense/expense.schema';
import { DailyScheduleIndexService } from './daily-schedule-index.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailyPlan', schema: DailyPlanSchema },
      { name: 'TravelPlan', schema: TravelPlanSchema },
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'Expense', schema: ExpenseSchema },
    ]),
  ],
  providers: [DailyPlanService, DailyScheduleService, ExpenseService, DailyScheduleIndexService],
  controllers: [DailyPlanController],
})
export class DailyscheduleModule {}
