import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
import { AuthService } from 'src/authentication/auth.service';
import { LoginSchema } from 'src/authentication/login.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Login', schema: LoginSchema },
    ]),
  ],
  providers: [UserService, AuthService],
  controllers: [UserController],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
