import { IsOptional, IsString } from 'class-validator';

export class PostCoverImageDto {
  @IsOptional()
  @IsString()
  imageUrl: string;
}
