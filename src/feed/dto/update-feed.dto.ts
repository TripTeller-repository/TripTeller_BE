import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFeedDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  coverImage: string;

  @ApiProperty()
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty()
  @IsDate()
  requestPrivateAt: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  deletedAt: Date | null;
}
