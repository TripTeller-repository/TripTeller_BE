import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client | null = null;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {}

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

  getBucketName(): string {
    return this.configService.get<string>('awsS3BucketName');
  }
}
