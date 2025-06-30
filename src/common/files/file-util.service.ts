import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dayjs from 'dayjs';
import { S3Service } from './s3.service';

@Injectable()
export class FileUtilService {
  private readonly logger = new Logger(FileUtilService.name);

  constructor(private readonly s3Service: S3Service) {}

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
