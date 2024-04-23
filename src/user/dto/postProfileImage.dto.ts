import { IsOptional, IsString } from 'class-validator';

export class PostProfileImageDto {
  @IsOptional()
  @IsString()
  imageUrl: string;
}
