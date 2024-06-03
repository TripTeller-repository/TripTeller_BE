import { Controller } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  //   @Get()
  //   searchByCriteria(
  //     @Query('region') region: string,
  //     @Query('title') title: string,
  //     @Query('author') author: string,
  //     @Query('content') content: string,
  //   ) {
  //     if (region) {
  //       // 지역
  //       return this.searchService.searchByRegion(region);
  //     } else if (title) {
  //       // 피드 제목
  //       return this.searchService.searchByTitle(title);
  //     } else if (author) {
  //       // 피드 작성자
  //       return this.searchService.searchByAuthor(author);
  //     } else if (content) {
  //       // 피드 내용
  //       return this.searchService.searchByContent(content);
  //     } else {
  //       return '알맞은 검색어를 입력해주세요.';
  //     }
  //   }
}
