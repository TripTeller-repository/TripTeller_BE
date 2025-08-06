export interface UserDevice {
  browser: string; // 브라우저 정보 (Chrome, Firefox 등)
  os: string; // 운영체제 정보 (Windows, iOS 등)
  device: string; // 디바이스 정보 (Desktop, Mobile 등)
  userAgent: string; // 전체 User-Agent 문자열
  deviceId?: string; // 고유 디바이스 ID (선택적)
}
