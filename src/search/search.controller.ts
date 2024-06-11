import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  getResults(
    @Query('title') title: string,
    @Query('author') author: string,
    @Query('content') content: string,
    @Query('region') region: string,
  ) {
    return this.searchService.fetchResult(title, content, author, region);
  }
}
