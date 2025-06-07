// src/user/user.service.ts (기존 파일 유지하면서 내부만 수정)
import { Injectable } from '@nestjs/common';
import { NicknameService } from './nickname.service';
import { ProfileImageService } from './profile-image.service';
import { UserDeleterService } from './user-deleter.service';
import { UserReaderService } from './user-reader.service';
import { UserUpdaterService } from './user-updater.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserInfoDto } from '../dto/user-info.dto';

/**
 * 메인 UserService - Facade 패턴
 * 기존 API 호환성을 유지하면서 내부적으로는 분리된 서비스들을 사용
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userReaderService: UserReaderService,
    private readonly userUpdaterService: UserUpdaterService,
    private readonly userDeleterService: UserDeleterService,
    private readonly profileImageService: ProfileImageService,
    private readonly nicknameService: NicknameService,
  ) {}

  ////// 회원 정보 조회 //////
  /**
   * 회원 ID 값으로 조회
   */
  async findUserInfoById(userId: string): Promise<UserInfoDto> {
    return this.userReaderService.findUserInfoById(userId);
  }

  /**
   * 프로필 이미지 불러오기
   */
  async fetchProfileImage(userId: string): Promise<{ profileImage: string }> {
    return this.profileImageService.fetchProfileImage(userId);
  }

  /**
   * AWS S3 프로필 이미지 Signed URL 불러오기
   */
  async fetchProfileImageSignedUrl(fileName: string, userId: string): Promise<string> {
    return this.profileImageService.fetchProfileImageSignedUrl(fileName, userId);
  }

  /**
   * 닉네임 조회
   */
  async findNickname(userId: string): Promise<{ nickname: string }> {
    return this.userReaderService.findNickname(userId);
  }

  ////// 회원 조회 //////
  /**
   * 모든 회원 조회
   */
  async findAllUsers() {
    return this.userReaderService.findAllUsers();
  }

  /**
   * Email로 특정 회원 조회
   */
  async findUserByEmail(email: string) {
    return this.userReaderService.findUserByEmail(email);
  }

  /**
   * ID로 특정 회원 조회
   */
  async findUserById(id: string) {
    return this.userReaderService.findUserById(id);
  }

  ////// 회원 정보 수정 //////
  /**
   * Email로 닉네임 수정
   */
  async updateNicknameByEmail(email: string, updateUserDto: UpdateUserDto) {
    return this.userUpdaterService.updateNicknameByEmail(email, updateUserDto);
  }

  /**
   * 회원 ID로 닉네임 수정
   */
  async updateNickNameById(id: string, updateUserDto: UpdateUserDto) {
    return this.userUpdaterService.updateNickNameById(id, updateUserDto);
  }

  /**
   * 고유한 닉네임 생성
   */
  async generateUniqueNickname(nickname: string): Promise<string> {
    return this.nicknameService.generateUniqueNickname(nickname);
  }

  /**
   * 회원 ID로 프로필 이미지 수정
   */
  async updateProfileImageById(userId: string, imageUrl: string) {
    return this.userUpdaterService.updateProfileImageById(userId, imageUrl);
  }

  ////// 회원 정보 삭제 //////
  /**
   * Email로 특정 회원 정보 삭제
   */
  async deleteUserByEmail(email: string, deletedAt: Date) {
    return this.userDeleterService.deleteUserByEmail(email, deletedAt);
  }

  /**
   * ID로 특정 회원 정보 삭제
   */
  async deleteUserById(id: string, deletedAt: Date) {
    return this.userDeleterService.deleteUserById(id, deletedAt);
  }
}
