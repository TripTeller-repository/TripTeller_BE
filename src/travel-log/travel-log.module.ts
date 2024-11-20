import { Module } from '@nestjs/common';
import { TravelLogService } from './travel-log.service';
import { TravelLogController } from './travel-log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyScheduleSchema } from 'src/daily-schedule/daily-schedule.schema';
import { AuthService } from 'src/authentication/auth.service';
import { UserSchema } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [TravelLogController],
  providers: [TravelLogService, AuthService, UserService],
})
export class TravelLogModule {}
