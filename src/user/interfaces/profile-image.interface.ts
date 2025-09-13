import { SignedUrlResult } from '@common/files/signed-url.interface';

export interface IProfileImageService {
  fetchProfileImage(userId: string): Promise<{ profileImage: string }>;
  fetchProfileImageSignedUrl(fileName: string, userId: string): Promise<SignedUrlResult>;
}
