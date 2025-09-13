import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { INicknameGenerator } from '../interfaces/nickname-generator.interface';

@Injectable()
export class NicknameService implements INicknameGenerator {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  /**
   * 중복되지 않는 고유한 닉네임을 생성
   * @param nickname - 기본 닉네임
   * @returns 고유한 닉네임
   */
  async generateUniqueNickname(nickname: string): Promise<string> {
    let candidate = nickname;
    let counter = 1;
    while (await this.userModel.exists({ nickname: candidate })) {
      candidate = `${nickname}${counter}`;
      counter++;
    }
    return candidate;
  }
}
