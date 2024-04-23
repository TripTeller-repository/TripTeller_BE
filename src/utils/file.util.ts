import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dayjs from 'dayjs';

////// S3 클라이언트 설정 함수 //////
export const setS3Client = () => {
  // S3 클라이언트 구성
  const config: S3ClientConfig = {
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESSKEYID, // AWS ACCESS KEY ID
      secretAccessKey: process.env.AWS_S3_SECRETACCESSKEY, // AWS SECRET ACCESS KEY
    },
    region: process.env.AWS_S3_REGION, // AWS 지역
  };

  // S3 클라이언트 반환
  return new S3Client(config);
};

////// signedURL 생성 함수 //////
export const createSignedUrl = async (filePath) => {
  // PutObjectCommand 생성
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME, // 버킷 이름
    Key: filePath, // 파일 경로
  });

  // S3 클라이언트 설정
  const s3Client = setS3Client();

  // signedURL 받아온 후 반환
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 2 });

  return signedUrl;
};

////// 파일 확장자 생성 함수 //////
export const createFileExtension = (fileName: string) => {
  const fileNameList = fileName.split('.');
  return fileNameList.pop();
};

////// 파일 Unix 이름 생성 함수 //////
// 파일 이름이 중복되는 경우를 방지하기 위함.
export const createFileUnixName = (fileName: string, prefix?: string) => {
  const extension = createFileExtension(fileName); // 파일 확장자 추출
  const unixNumber = dayjs().valueOf(); // 현재 Unix 시간 가져오기

  // 접두사가 있는 경우
  if (prefix) {
    // 접두사와 Unix 시간을 조합하여 파일 이름 생성
    return `${prefix}_${unixNumber}.${extension}`;
  } else {
    // Unix 시간을 파일 이름으로 사용
    return `${unixNumber}.${extension}`;
  }
};
