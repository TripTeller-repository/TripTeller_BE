import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { IUserDeleter } from '../interfaces/user-deleter.interface';

@Injectable()
export class UserDeleterService implements IUserDeleter {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  /**
   * 이메일로 특정 사용자 정보를 삭제
   * @param email - 사용자 이메일
   * @param deletedAt - 삭제 시간
   * @returns 삭제된 사용자 정보
   */
  async deleteUserByEmail(email: string, deletedAt: Date): Promise<User> {
    const deletedUser = await this.userModel.findOneAndUpdate({ email }, { deletedAt }, { new: true }).exec();
    if (!deletedUser) throw new NotFoundException('User not found or deletion failed');
    return deletedUser;
  }

  /**
   * ID로 특정 사용자 정보를 삭제
   * @param id - 사용자 ID
   * @param deletedAt - 삭제 시간
   * @returns 삭제된 사용자 정보
   */
  async deleteUserById(id: string, deletedAt: Date): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndUpdate(id, { deletedAt }, { new: true }).exec();
    if (!deletedUser) throw new NotFoundException('User not found or deletion failed');
    return deletedUser;
  }
}
