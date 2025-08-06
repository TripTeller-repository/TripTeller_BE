import { UserDevice } from '@auth/interfaces/user-device.interface';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export class DeviceInfoUtil {
  /**
   * 요청에서 디바이스 정보를 추출 (ua-parser-js 사용)
   */
  static extractDeviceInfo(req: Request): UserDevice {
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // 브라우저 정보
    const browser = result.browser.name
      ? `${result.browser.name} ${result.browser.version || ''}`.trim()
      : 'Unknown Browser';

    // OS 정보
    const os = result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : 'Unknown OS';

    // 디바이스 타입
    let device = 'Desktop';
    if (result.device.type) {
      device = result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1);
      if (result.device.vendor && result.device.model) {
        device += ` (${result.device.vendor} ${result.device.model})`;
      }
    }

    // 디바이스 ID 생성
    const deviceId = req.cookies?.deviceId || `device_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return {
      browser,
      os,
      device,
      userAgent,
      deviceId,
    };
  }

  /**
   * 디바이스 ID 쿠키를 설정
   */
  static setDeviceIdCookie(res: any, deviceId: string) {
    res.cookie('deviceId', deviceId, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1년
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  /**
   * 두 디바이스 정보가 같은지 비교
   */
  static isSameDevice(device1: UserDevice, device2: UserDevice): boolean {
    return device1.browser === device2.browser && device1.os === device2.os && device1.device === device2.device;
  }
}
