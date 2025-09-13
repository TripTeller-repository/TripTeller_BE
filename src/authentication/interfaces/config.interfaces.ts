// JWT 설정 타입 정의
export interface JwtConfig {
  access: {
    secretKey: string;
    expiresIn: string;
  };
  refresh: {
    secretKey: string;
    expiresIn: string;
  };
  temp: {
    secretKey: string;
    expiresIn: string;
  };
}

// 카카오 설정 타입 정의
export interface KakaoConfig {
  clientId: string;
  callbackUrl: string;
  redirectUri: string;
}
