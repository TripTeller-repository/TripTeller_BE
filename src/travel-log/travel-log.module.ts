import { Module } from '@nestjs/common';
import { TravelLogService } from './travel-log.service';
import { TravelLogController } from './travel-log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyScheduleSchema } from 'src/daily-schedule/daily-schedule.schema';
import { AuthService } from 'src/authentication/auth.service';
import { UserSchema } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { LoginSchema } from 'src/authentication/login.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
  ],
  controllers: [TravelLogController],
  providers: [TravelLogService, AuthService, UserService],
})
export class TravelLogModule {}
