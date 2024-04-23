import { Test, TestingModule } from '@nestjs/testing';
import { DailyExpenseService } from '../dailyExpense/dailyExpense.service';

describe('DailyExpenseService', () => {
  let service: DailyExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyExpenseService],
    }).compile();

    service = module.get<DailyExpenseService>(DailyExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
