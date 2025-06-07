import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { IProfileImageService } from '../interfaces/profile-image.interface';
import { createFileUnixName, createSignedUrl } from 'src/utils/file.util';

@Injectable()
export class ProfileImageService implements IProfileImageService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

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
  async fetchProfileImageSignedUrl(fileName: string, userId: string): Promise<string> {
    const fileNameInBucket = createFileUnixName(fileName, userId);
    const filePathName = `profile-image/${fileNameInBucket}`;
    return await createSignedUrl(filePathName);
  }
}
