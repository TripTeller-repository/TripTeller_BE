export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongoUri: process.env.MONGODB_URL,
  allowedOrigins:
    process.env.NODE_ENV === 'development'
      ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5500', 'http://127.0.0.1:5500']
      : ['https://trip-teller.com', 'https://www.trip-teller.com'],

  // 카카오 로그인
  kakaoClientId: process.env.KAKAO_CLIENT_ID,
  kakaoCallbackUrl: process.env.KAKAO_CALLBACK_URL,
  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI,

  // 서버 비밀키
  secretKey: process.env.SECRET_KEY,

  // 슬랙 웹훅
  slackWebHookUrl: process.env.SLACK_WEBHOOK_URL,

  // AWS S3
  awsS3AccessKeyId: process.env.AWS_S3_ACCESSKEYID,
  awsS3SecretAccessKey: process.env.AWS_S3_SECRETACCESSKEY,
  awsS3Region: process.env.AWS_S3_REGION,
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
  awsS3ImgDirectory: process.env.AWS_S3_IMG_DIRECTORY,

  // 기타
  databaseHost: process.env.DATABASE_HOST,
  cookieDomain: process.env.COOKIE_DOMAIN,
});
