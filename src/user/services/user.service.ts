// src/user/user.service.ts (기존 파일 유지하면서 내부만 수정)
import { Injectable } from '@nestjs/common';
import { NicknameService } from './nickname.service';
import { ProfileImageService } from './profile-image.service';
import { UserDeleterService } from './user-deleter.service';
import { UserReaderService } from './user-reader.service';
import { UserUpdaterService } from './user-updater.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserInfoDto } from '../dto/user-info.dto';
import { SignedUrlResult } from '@common/files/signed-url.interface';

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
   * 회원 ID로 사용자 정보를 조회
   *
   * @param {string} userId - 조회할 사용자 ID
   * @returns {Promise<UserInfoDto>} 사용자 정보 DTO
   */
  async findUserInfoById(userId: string): Promise<UserInfoDto> {
    return this.userReaderService.findUserInfoById(userId);
  }

  /**
   * 회원의 프로필 이미지를 반환
   *
   * @param {string} userId - 사용자 ID
   * @returns {Promise<{ profileImage: string }>} 프로필 이미지 URL
   */
  async fetchProfileImage(userId: string): Promise<{ profileImage: string }> {
    return this.profileImageService.fetchProfileImage(userId);
  }

  /**
   * AWS S3 프로필 이미지의 Signed URL을 생성하여 반환
   *
   * @param {string} fileName - 파일명
   * @param {string} userId - 사용자 ID
   * @returns {Promise<string>} 생성된 Signed URL
   */
  async fetchProfileImageSignedUrl(fileName: string, userId: string): Promise<SignedUrlResult> {
    return this.profileImageService.fetchProfileImageSignedUrl(fileName, userId);
  }

  /**
   * 사용자 ID로 닉네임을 조회
   *
   * @param {string} userId - 사용자 ID
   * @returns {Promise<{ nickname: string }>} 사용자 닉네임
   */
  async findNickname(userId: string): Promise<{ nickname: string }> {
    return this.userReaderService.findNickname(userId);
  }

  ////// 회원 조회 //////

  /**
   * 모든 회원을 조회
   *
   * @returns {Promise<any[]>} 모든 회원 목록
   */
  async findAllUsers() {
    return this.userReaderService.findAllUsers();
  }

  /**
   * Email로 특정 회원을 조회
   *
   * @param {string} email - 조회할 회원의 이메일
   * @returns {Promise<any>} 특정 회원 정보
   */
  async findUserByEmail(email: string) {
    return this.userReaderService.findUserByEmail(email);
  }

  /**
   * ID로 특정 회원을 조회
   *
   * @param {string} id - 조회할 회원의 ID
   * @returns {Promise<any>} 특정 회원 정보
   */
  async findUserById(id: string) {
    return this.userReaderService.findUserById(id);
  }

  ////// 회원 정보 수정 //////

  /**
   * Email로 회원의 닉네임을 수정
   *
   * @param {string} email - 수정할 회원의 이메일
   * @param {UpdateUserDto} updateUserDto - 수정할 사용자 정보
   * @returns {Promise<any>} 수정된 사용자 정보
   */
  async updateNicknameByEmail(email: string, updateUserDto: UpdateUserDto) {
    return this.userUpdaterService.updateNicknameByEmail(email, updateUserDto);
  }

  /**
   * 회원 ID로 회원의 닉네임을 수정
   *
   * @param {string} id - 수정할 회원의 ID
   * @param {UpdateUserDto} updateUserDto - 수정할 사용자 정보
   * @returns {Promise<any>} 수정된 사용자 정보
   */
  async updateNickNameById(id: string, updateUserDto: UpdateUserDto) {
    return this.userUpdaterService.updateNickNameById(id, updateUserDto);
  }

  /**
   * 고유한 닉네임을 생성
   *
   * @param {string} nickname - 사용자가 요청한 닉네임
   * @returns {Promise<string>} 고유한 닉네임
   */
  async generateUniqueNickname(nickname: string): Promise<string> {
    return this.nicknameService.generateUniqueNickname(nickname);
  }

  /**
   * 회원의 프로필 이미지를 수정
   *
   * @param {string} userId - 수정할 회원의 ID
   * @param {string} imageUrl - 새로운 프로필 이미지 URL
   * @returns {Promise<any>} 수정된 사용자 정보
   */
  async updateProfileImageById(userId: string, imageUrl: string) {
    return this.userUpdaterService.updateProfileImageById(userId, imageUrl);
  }

  ////// 회원 정보 삭제 //////

  /**
   * Email로 회원 정보를 삭제
   *
   * @param {string} email - 삭제할 회원의 이메일
   * @param {Date} deletedAt - 삭제일시
   * @returns {Promise<any>} 삭제된 회원 정보
   */
  async deleteUserByEmail(email: string, deletedAt: Date) {
    return this.userDeleterService.deleteUserByEmail(email, deletedAt);
  }

  /**
   * ID로 회원 정보를 삭제
   *
   * @param {string} id - 삭제할 회원의 ID
   * @param {Date} deletedAt - 삭제일시
   * @returns {Promise<any>} 삭제된 회원 정보
   */
  async deleteUserById(id: string, deletedAt: Date) {
    return this.userDeleterService.deleteUserById(id, deletedAt);
  }
}
