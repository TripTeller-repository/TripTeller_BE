export interface UserDevice {
  browser: string; // 브라우저 정보 (Chrome, Firefox 등)
  os: string; // 운영체제 정보 (Windows, iOS 등)
  userAgent?: string;
}
