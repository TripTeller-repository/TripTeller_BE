import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../schemas/user.schema';
import { NicknameService } from './nickname.service';
import { IUserUpdater } from '../interfaces/user-updater.interface';

@Injectable()
export class UserUpdaterService implements IUserUpdater {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly nicknameService: NicknameService,
  ) {}

  /**
   * 이메일로 사용자의 닉네임을 수정
   * @param email - 사용자 이메일
   * @param updateUserDto - 업데이트할 사용자 정보
   * @returns 업데이트된 사용자 정보
   */
  async updateNicknameByEmail(email: string, updateUserDto: UpdateUserDto): Promise<User> {
    const newNickname = await this.nicknameService.generateUniqueNickname(updateUserDto.nickname);
    const updatedUser = await this.userModel
      .findOneAndUpdate({ email }, { nickname: newNickname }, { new: true, runValidators: true })
      .exec();
    if (!updatedUser) throw new NotFoundException('User not found or update failed');
    return updatedUser;
  }

  /**
   * 사용자 ID로 닉네임을 수정
   * @param id - 사용자 ID
   * @param updateUserDto - 업데이트할 사용자 정보
   * @returns 업데이트된 사용자 정보
   */
  async updateNickNameById(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const newNickname = await this.nicknameService.generateUniqueNickname(updateUserDto.nickname);
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { nickname: newNickname }, { new: true, runValidators: true })
      .exec();
    if (!updatedUser) throw new NotFoundException('User not found or update failed');
    return updatedUser;
  }

  /**
   * 사용자 ID로 프로필 이미지를 수정
   * @param userId - 사용자 ID
   * @param imageUrl - 새로운 이미지 URL
   * @returns 업데이트된 사용자 정보
   */
  async updateProfileImageById(userId: string, imageUrl: string): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { profileImage: imageUrl }, { new: true, runValidators: true })
      .exec();
    if (!updatedUser) throw new NotFoundException('User not found or update failed');
    return updatedUser;
  }
}
