import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { IProfileImageService } from '../interfaces/profile-image.interface';
import { FileUtilService } from '@common/files/file-util.service';
import { SignedUrlResult } from '@common/files/signed-url.interface';

@Injectable()
export class ProfileImageService implements IProfileImageService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly fileUtilService: FileUtilService,
  ) {}

  /**
   * 사용자의 프로필 이미지를 조회합니다
   * @param userId - 사용자 ID
   * @returns 프로필 이미지 정보
   */
  async fetchProfileImage(userId: string): Promise<{ profileImage: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { profileImage: user.profileImage };
  }

  /**
   * AWS S3 프로필 이미지의 Signed URL을 생성
   * @param fileName - 파일명
   * @param userId - 사용자 ID
   * @returns Signed URL
   */
  async fetchProfileImageSignedUrl(fileName: string, userId: string): Promise<SignedUrlResult> {
    const fileNameInBucket = this.fileUtilService.createFileUnixName(fileName, userId);
    const filePathName = `profile-image/${fileNameInBucket}`;
    return await this.fileUtilService.createSignedUrl(filePathName);
  }
}
