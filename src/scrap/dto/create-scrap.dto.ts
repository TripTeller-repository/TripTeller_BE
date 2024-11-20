import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateScrapDto {
  @ApiProperty({
    description: '게시물 고유 ID',
    example: '507f191e810c19729de860ea',
  })
  @IsNotEmpty()
  @IsString()
  feedId: string;
}
