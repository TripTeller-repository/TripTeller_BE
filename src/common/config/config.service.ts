export const configuration = () => ({
  // 기본 설정
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongoUri: process.env.MONGODB_URL,
  databaseHost: process.env.DATABASE_HOST,
  cookieDomain: process.env.COOKIE_DOMAIN,
  allowedOrigins:
    process.env.NODE_ENV === 'development'
      ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5500', 'http://127.0.0.1:5500']
      : ['https://trip-teller.com', 'https://www.trip-teller.com'],

  // 카카오 로그인 설정
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID,
    callbackUrl: process.env.KAKAO_CALLBACK_URL,
    redirectUri: process.env.KAKAO_REDIRECT_URI,
  },

  // JWT 설정
  jwt: {
    access: {
      secretKey: process.env.JWT_ACCESS_SECRET,
      expiresIn: '10m',
    },
    refresh: {
      secretKey: process.env.JWT_REFRESH_SECRET,
      expiresIn: '1h',
    },
    temp: {
      secretKey: process.env.JWT_TEMP_SECRET,
      expiresIn: '10m',
    },
  },

  // 슬랙 웹훅
  slackWebHookUrl: process.env.SLACK_WEBHOOK_URL,

  // AWS S3 설정
  aws: {
    s3: {
      accessKeyId: process.env.AWS_S3_ACCESSKEYID,
      secretAccessKey: process.env.AWS_S3_SECRETACCESSKEY,
      region: process.env.AWS_S3_REGION,
      bucketName: process.env.AWS_S3_BUCKET_NAME,
      imgDirectory: process.env.AWS_S3_IMG_DIRECTORY,
    },
  },
});
