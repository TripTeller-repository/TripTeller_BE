import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PutTravelLogPostContentDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  postContent: string;
}
