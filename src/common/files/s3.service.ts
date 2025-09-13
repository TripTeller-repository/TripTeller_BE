import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

/**
 * AWS S3 관련 기능을 담당하는 서비스
 * - S3 클라이언트 초기화 및 반환
 * - 버킷 이름 조회
 */
@Injectable()
export class S3Service {
  private s3Client: S3Client | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * AWS S3 클라이언트를 생성하거나 반환
   * 내부적으로 한 번만 초기화
   *
   * @returns {S3Client} - 초기화된 S3 클라이언트 인스턴스
   */
  getS3Client(): S3Client {
    if (!this.s3Client) {
      const accessKeyId = this.configService.get<string>('aws.s3.accessKeyId');
      const secretAccessKey = this.configService.get<string>('aws.s3.secretAccessKey');
      const region = this.configService.get<string>('aws.s3.region');

      const s3Config: S3ClientConfig = {
        credentials: { accessKeyId, secretAccessKey },
        region,
      };

      this.s3Client = new S3Client(s3Config);
      this.logger.log('S3 client initialized', { service: 'S3Service' });
    }

    return this.s3Client;
  }

  /**
   * 환경변수에서 S3 버킷 이름을 가져옴
   *
   * @returns {string} - S3 버킷 이름
   */
  getBucketName(): string {
    return this.configService.get<string>('aws.s3.bucketName');
  }

  /**
   * 환경변수에서 S3 이미지 디렉토리를 가져옴
   *
   * @returns {string} - S3 이미지 디렉토리
   */
  getImgDirectory(): string {
    return this.configService.get<string>('aws.s3.imgDirectory');
  }
}
