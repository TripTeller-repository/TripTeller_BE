import { Test, TestingModule } from '@nestjs/testing';
import { TravelLogService } from '../travelLog/travelLog.service';

describe('TravelLogService', () => {
  let service: TravelLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TravelLogService],
    }).compile();

    service = module.get<TravelLogService>(TravelLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
