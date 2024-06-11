import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PostCoverImageDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  imageUrl: string;
}
