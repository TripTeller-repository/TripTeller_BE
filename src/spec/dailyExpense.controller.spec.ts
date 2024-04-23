import { Test, TestingModule } from '@nestjs/testing';
import { DailyExpenseController } from '../dailyExpense/dailyExpense.controller';

describe('DailyExpenseController', () => {
  let controller: DailyExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyExpenseController],
    }).compile();

    controller = module.get<DailyExpenseController>(DailyExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
