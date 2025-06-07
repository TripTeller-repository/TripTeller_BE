export interface IProfileImageService {
  fetchProfileImage(userId: string): Promise<{ profileImage: string }>;
  fetchProfileImageSignedUrl(fileName: string, userId: string): Promise<string>;
}
