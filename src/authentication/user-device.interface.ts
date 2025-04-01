export interface UserDevice {
  // deviceId: string; // 디바이스 고유 Id
  browser: string; // 브라우저 정보 (Chrome, Firefox 등)
  os: string; // 운영체제 정보 (Windows, iOS 등)
  userAgent?: string;
}
