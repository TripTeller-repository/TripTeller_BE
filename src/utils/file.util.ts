import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dayjs from 'dayjs';

/**
 * S3 설정 및 클라이언트 관리
 */
@Injectable()
export class S3Service {
  private s3Client: S3Client | null = null;
  private readonly logger = new Logger(S3Service.name);

  private getS3Config() {
    const config = {
      accessKeyId: process.env.AWS_S3_ACCESSKEYID,
      secretAccessKey: process.env.AWS_S3_SECRETACCESSKEY,
      region: process.env.AWS_S3_REGION,
      bucketName: process.env.AWS_S3_BUCKET_NAME,
    };

    const missingVars = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing AWS S3 environment variables: ${missingVars.join(', ')}`);
    }

    return config;
  }

  getS3Client(): S3Client {
    if (!this.s3Client) {
      const config = this.getS3Config();

      const s3Config: S3ClientConfig = {
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        region: config.region,
      };

      this.s3Client = new S3Client(s3Config);
      this.logger.log('S3 client initialized');
    }

    return this.s3Client;
  }

  getBucketName(): string {
    return this.getS3Config().bucketName;
  }
}

/**
 * 파일 유틸리티 서비스
 */
@Injectable()
export class FileUtilService {
  private readonly logger = new Logger(FileUtilService.name);

  constructor(private readonly s3Service: S3Service) {}

  /**
   * Signed URL 생성
   */
  async createSignedUrl(filePath: string, expiresIn: number = 120): Promise<string> {
    try {
      const s3Client = this.s3Service.getS3Client();
      const bucketName = this.s3Service.getBucketName();

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      this.logger.log(`Signed URL created for: ${filePath}`);

      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to create signed URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * 파일 확장자 추출
   */
  createFileExtension(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid file name');
    }

    const parts = fileName.split('.');
    if (parts.length < 2) {
      throw new Error('File must have extension');
    }

    return parts.pop()!.toLowerCase();
  }

  /**
   * Unix 타임스탬프 파일명 생성
   */
  createFileUnixName(fileName: string, prefix?: string): string {
    const extension = this.createFileExtension(fileName);
    const timestamp = dayjs().valueOf();

    if (prefix) {
      const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_');
      return `${cleanPrefix}_${timestamp}.${extension}`;
    }

    return `${timestamp}.${extension}`;
  }
}

// 기존 호환성을 위한 함수들 (기존 코드가 계속 작동하도록)
const s3Service = new S3Service();
const fileUtilService = new FileUtilService(s3Service);

export const setS3Client = () => {
  return s3Service.getS3Client();
};

export const createSignedUrl = async (filePath: string) => {
  return fileUtilService.createSignedUrl(filePath);
};

export const createFileExtension = (fileName: string) => {
  return fileUtilService.createFileExtension(fileName);
};

export const createFileUnixName = (fileName: string, prefix?: string) => {
  return fileUtilService.createFileUnixName(fileName, prefix);
};
