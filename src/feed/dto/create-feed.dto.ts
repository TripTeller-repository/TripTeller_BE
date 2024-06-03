import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFeedDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  coverImage: string;

  @IsBoolean()
  isPublic: boolean;

  @IsDate()
  requestPrivateAt: Date;

  @IsOptional()
  @IsDate()
  deletedAt: Date | null;
}
