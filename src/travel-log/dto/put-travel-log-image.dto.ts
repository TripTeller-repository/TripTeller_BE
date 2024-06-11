import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PutTravelLogImageDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  imageUrl: string;
}
