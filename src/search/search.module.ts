import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
