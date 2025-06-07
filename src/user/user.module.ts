import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controllers/user.controller';
import { UserSchema } from './schemas/user.schema';
import { UserService } from './services/user.service';

// 분리된 서비스들 (내부에서만 사용)
import { UserReaderService } from './services/user-reader.service';
import { UserUpdaterService } from './services/user-updater.service';
import { UserDeleterService } from './services/user-deleter.service';
import { ProfileImageService } from './services/profile-image.service';
import { NicknameService } from './services/nickname.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), ConfigModule],
  controllers: [UserController],
  providers: [
    // 내부 서비스들 (외부에 노출되지 않음)
    UserReaderService,
    UserUpdaterService,
    UserDeleterService,
    ProfileImageService,
    NicknameService,

    // 메인 Facade 서비스 (유일한 외부 인터페이스)
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}
