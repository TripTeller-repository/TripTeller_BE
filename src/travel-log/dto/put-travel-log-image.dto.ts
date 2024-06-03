import { IsOptional, IsString } from 'class-validator';

export class PutTravelLogImageDto {
  @IsString()
  @IsOptional()
  imageUrl: string;
}
