import { IsNotEmpty, IsString } from 'class-validator';

export class CreateScrapDto {
  @IsNotEmpty()
  @IsString()
  feedId: string;
}
