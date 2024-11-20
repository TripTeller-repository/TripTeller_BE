import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ 
    summary: '검색', 
    description: '제목, 내용, 작성자, 지역을 기반으로 검색을 수행한다. 검색된 결과는 공개된 게시물만 조회된다.'
  })
  @ApiQuery({
    name: 'title',
    description: '검색할 게시물의 제목',
    required: false,
    type: String,
    example: '여행',
  })
  @ApiQuery({
    name: 'author',
    description: '검색할 게시물의 작성자 (회원 닉네임)',
    required: false,
    type: String,
    example: '홍길동',
  })
  @ApiQuery({
    name: 'content',
    description: '검색할 게시물의 내용',
    required: false,
    type: String,
    example: '경주 여행',
  })
  @ApiQuery({
    name: 'region',
    description: '검색할 지역 (ex: 서울, 부산)',
    required: false,
    type: String,
    example: '서울',
  })
  @ApiResponse({
    status: 200,
    description: '검색 결과를 반환합니다.',
    schema: {
      example: [
        {
          feedId: '507f191e810c19729de860ea',
          title: '경주 여행 나들이~',
          content: '수학여행으로만 갔던 경주! 이번에 가니...',
          createdAt: '2024-11-01T08:00:00Z',
          likeCount: 23,
          isPublic: true,
          region: '서울',
          coverImage: 'https://my-bucket.s3.us-west-2.amazonaws.com/travel-log-image.jpg',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (예: 잘못된 쿼리 파라미터)',
  })
  @ApiResponse({
    status: 404,
    description: '검색된 결과가 없습니다.',
  })
  getResults(
    @Query('title') title: string,
    @Query('author') author: string,
    @Query('content') content: string,
    @Query('region') region: string,
  ) {
    return this.searchService.fetchResult(title, content, author, region);
  }
}
