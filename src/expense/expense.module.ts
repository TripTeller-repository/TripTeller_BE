import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpenseController } from './expense.controller';
import { ExpenseSchema } from './expense.schema';
import { ExpenseService } from './expense.service';
import { DailyPlanSchema } from 'src/daily-plan/daily-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Expense', schema: ExpenseSchema },
      { name: 'DailyPlan', schema: DailyPlanSchema },
    ]),
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class ExpenseModule {}
