import { Module } from '@nestjs/common';
import { TravelLogService } from './travel-log.service';
import { TravelLogController } from './travel-log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyScheduleSchema } from '@daily-schedule/daily-schedule.schema';
import { AuthService } from '@auth/auth.service';
import { LoginSchema } from '@auth/login.schema';
import { UserSchema } from '@user/schemas/user.schema';
import { UserModule } from '@user/user.module';
import { FileModule } from '@common/files/file.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailySchedule', schema: DailyScheduleSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
    UserModule,
    FileModule,
  ],
  controllers: [TravelLogController],
  providers: [TravelLogService, AuthService],
})
export class TravelLogModule {}
