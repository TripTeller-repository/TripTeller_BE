import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateScrapDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  feedId: string;
}
