export interface IUser {
  userId: string;
  authProvider?: string; // 소셜로그인일 경우만 설정
  tokenId?: string;
  ip?: string;
  deviceInfo?: any;
}
