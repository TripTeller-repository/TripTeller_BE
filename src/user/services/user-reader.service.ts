import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInfoDto } from '../dto/user-info.dto';
import { User } from '../schemas/user.schema';
import { IUserReader } from '../interfaces/user-reader.interface';

@Injectable()
export class UserReaderService implements IUserReader {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  /**
   * 사용자 ID로 사용자 정보를 조회
   * @param userId - 사용자 ID
   * @returns 사용자 정보 DTO
   */
  async findUserInfoById(userId: string): Promise<UserInfoDto> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return new UserInfoDto(user.email, user.profileImage, user.nickname);
  }

  /**
   * 사용자 ID로 닉네임을 조회
   * @param userId - 사용자 ID
   * @returns 닉네임 정보
   */
  async findNickname(userId: string): Promise<{ nickname: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return { nickname: user.nickname };
  }

  /**
   * 모든 사용자를 조회
   * @returns 모든 사용자 배열
   */
  async findAllUsers(): Promise<User[]> {
    return await this.userModel.find().lean().exec();
  }

  /**
   * 이메일로 특정 사용자를 조회
   * @param email - 사용자 이메일
   * @returns 사용자 정보
   */
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * ID로 특정 사용자를 조회
   * @param id - 사용자 ID
   * @returns 사용자 정보
   */
  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
