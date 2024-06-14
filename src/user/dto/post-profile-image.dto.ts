import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PostProfileImageDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  imageUrl: string;
}
