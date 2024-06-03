import { Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { createFileUnixName, createSignedUrl } from 'src/utils/file.util';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  ////// 회원 정보 조회 //////
  // 회원 ID 값으로 조회
  async getUserInfo(userId: string) {
    const user = await this.userModel.findOne({ _id: userId });
    // 내보내고 싶은 정보만 전송 (이메일, 프로필 이미지, 닉네임)
    const userInfoDto = new UserInfoDto(user.email, user.profileImage, user.nickname);
    return userInfoDto;
  }

  // 프로필 이미지 불러오기
  async getProfileImage(userId: string) {
    const user = await this.userModel.findOne({ _id: userId });
    return { profileImage: user.profileImage };
  }

  // AWS S3 프로필 이미지 Signed URL 불러오기
  async getProfileImageSignedUrl(fileName: string, userId: string) {
    const fileNameInBucket = createFileUnixName(fileName, userId);
    const filePathName = `profile-image/${fileNameInBucket}`;
    return await createSignedUrl(filePathName);
  }

  // 닉네임 조회
  async getNickname(userId: string) {
    const user = await this.userModel.findOne({ _id: userId });
    return { nickname: user.nickname };
  }

  ////// 회원 조회 //////
  // 모든 회원 조회
  async findAll() {
    const users = await this.userModel.find().exec();
    return users;
  }

  // Email로 특정 회원 조회
  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    return user;
  }

  // ID로 특정 회원 조회
  async findById(id: string) {
    const user = await this.userModel.findOne({ _id: id }).exec();
    return user;
  }

  ////// 회원 정보 수정 //////
  // Email로 닉네임 수정
  async updateByEmail(email: string, updateUserDto: UpdateUserDto) {
    const { nickname } = updateUserDto;
    const updatedUser = await this.userModel
      .findOneAndUpdate({ email }, { nickname }, { runValidators: true, new: true })
      .exec();
    return updatedUser;
  }

  // 회원 ID로 닉네임 수정
  // 닉네임 중복될 경우 숫자 자동 생성하게 하는 기능 추가할 예정
  async updateNickNameById(id: any, updateUserDto: UpdateUserDto) {
    const { nickname } = updateUserDto;
    const updatedUser = await this.userModel
      .findOneAndUpdate({ _id: id }, { nickname }, { runValidators: true, new: true })
      .exec();
    return updatedUser;
  }

  // 회원 ID로 프로필 이미지 수정
  async updateProfileImageById(userId: string, imageUrl) {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ _id: userId }, { profileImage: imageUrl }, { runValidators: true, new: true })
      .exec();
    return updatedUser;
  }

  ////// 회원 정보 삭제 //////
  // Email로 특정 회원 정보 삭제
  // 삭제 시 deletedAt의 값을 date로 변경함.
  async deleteByEmail(email: string, deletedAt: Date) {
    const deletedUser = await this.userModel.findOneAndUpdate({ email }, { deletedAt }, { new: true }).exec();
    return deletedUser;
  }

  // ID로 특정 회원 정보 삭제
  // 삭제 시 deletedAt의 값을 date로 변경함.
  async deleteById(id: string, deletedAt: Date) {
    const deletedUser = await this.userModel.findOneAndUpdate({ _id: id }, { deletedAt }, { new: true }).exec();
    return deletedUser;
  }
}
