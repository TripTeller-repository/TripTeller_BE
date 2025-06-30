import { Module } from '@nestjs/common';
import { FileUtilService } from './file-util.service';
import { S3Service } from './s3.service';

@Module({
  providers: [S3Service, FileUtilService],
  exports: [S3Service, FileUtilService],
})
export class FileModule {}
