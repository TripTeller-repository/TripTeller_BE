import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dayjs from 'dayjs';
import { S3Service } from './s3.service';

/**
 * 파일 관련 유틸리티 기능을 제공하는 서비스
 * - S3 Presigned URL 생성
 * - 파일 확장자 추출
 * - 유닉스 타임 기반 파일명 생성
 */
@Injectable()
export class FileUtilService {
  private readonly logger = new Logger(FileUtilService.name);

  constructor(private readonly s3Service: S3Service) {}

  /**
   * 지정한 파일 경로에 대해 S3 Presigned URL을 생성
   *
   * @param filePath - S3에 업로드할 파일 경로 (Key)
   * @param expiresIn - URL 유효 시간 (초), 기본값: 120초
   * @returns 생성된 서명된 URL
   * @throws {Error} URL 생성 실패 시 예외 발생
   */
  async createSignedUrl(filePath: string, expiresIn = 120): Promise<string> {
    try {
      const s3Client = this.s3Service.getS3Client();
      const bucketName = this.s3Service.getBucketName();

      const command = new PutObjectCommand({ Bucket: bucketName, Key: filePath });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

      this.logger.log(`Signed URL created for: ${filePath}`);
      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to create signed URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * 파일명에서 확장자를 추출
   *
   * @param fileName - 대상 파일명 (예: image.png)
   * @returns 확장자 문자열 (예: "png")
   * @throws {Error} 유효하지 않은 파일명 또는 확장자가 없는 경우
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
   * 유닉스 타임스탬프 기반의 고유한 파일명을 생성
   *
   * @param fileName - 원본 파일명
   * @param prefix - (선택) 파일명 앞에 붙일 접두사
   * @returns 생성된 파일명 (예: "prefix_1624356789012.png" 또는 "1624356789012.png")
   * @throws {Error} 확장자 추출 실패 시 예외 발생
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
