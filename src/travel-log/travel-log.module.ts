import { Module } from '@nestjs/common';
import { TravelLogService } from './travel-log.service';
import { TravelLogController } from './travel-log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyScheduleSchema } from 'src/daily-schedule/daily-schedule.schema';
import { AuthService } from 'src/authentication/auth.service';
import { LoginSchema } from 'src/authentication/login.schema';
import { UserSchema } from 'src/user/schemas/user.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
    UserModule,
  ],
  controllers: [TravelLogController],
  providers: [TravelLogService, AuthService],
})
export class TravelLogModule {}
