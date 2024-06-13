import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: '검색' })
  getResults(
    @Query('title') title: string,
    @Query('author') author: string,
    @Query('content') content: string,
    @Query('region') region: string,
  ) {
    return this.searchService.fetchResult(title, content, author, region);
  }
}
