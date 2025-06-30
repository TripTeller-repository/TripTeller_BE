import { Injectable } from '@nestjs/common';
import { FeedSearchStrategy } from './strategies/feed-search.strategy';
import { SearchParams } from './dto/search-params.dto';

@Injectable()
export class SearchStrategyFactory {
  constructor(private readonly strategies: FeedSearchStrategy[]) {}

  /** 검색 조건에 적합한 전략만 반환 */
  getApplicableStrategies(params: SearchParams): FeedSearchStrategy[] {
    return this.strategies.filter((s) => s.isApplicable(params));
  }
}
