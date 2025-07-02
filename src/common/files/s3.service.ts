import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

/**
 * AWS S3 관련 기능을 담당하는 서비스
 * - S3 클라이언트 초기화 및 반환
 * - 버킷 이름 조회
 */
@Injectable()
export class S3Service {
  private s3Client: S3Client | null = null;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * AWS S3 클라이언트를 생성하거나 반환
   * 내부적으로 한 번만 초기화
   *
   * @returns {S3Client} - 초기화된 S3 클라이언트 인스턴스
   */
  getS3Client(): S3Client {
    if (!this.s3Client) {
      const accessKeyId = this.configService.get<string>('awsS3AccessKeyId');
      const secretAccessKey = this.configService.get<string>('awsS3SecretAccessKey');
      const region = this.configService.get<string>('awsS3Region');

      const s3Config: S3ClientConfig = {
        credentials: { accessKeyId, secretAccessKey },
        region,
      };

      this.s3Client = new S3Client(s3Config);
      this.logger.log('S3 client initialized');
    }

    return this.s3Client;
  }

  /**
   * 환경변수에서 S3 버킷 이름을 가져옴
   *
   * @returns {string} - S3 버킷 이름
   */
  getBucketName(): string {
    return this.configService.get<string>('awsS3BucketName');
  }
}
