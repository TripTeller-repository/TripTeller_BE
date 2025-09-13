// 임시 토큰 타입 정의
export interface TempTokenPayload {
  userId: string;
  type: 'temp';
  isSuspicious: boolean;
  userHas2FA: boolean;
  browser: string;
  os: string;
  device: string;
  userAgent: string;
  deviceId: string;
  ip: string;
  authProvider: string | null;
}
