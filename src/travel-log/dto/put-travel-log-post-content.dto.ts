import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PutTravelLogPostContentDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  postContent: string;
}
