import { SearchParams } from '../dto/search-params.dto';
import Feed from '@feed/feed.schema';

/**
 * 피드 검색 Strategy Interface
 * @description 다양한 조건별 피드 검색 전략을 정의
 */
export interface FeedSearchStrategy {
  /** 해당 전략이 파라미터에 적합한지 여부 판단 */
  isApplicable(params: SearchParams): boolean;
  /** 적합 -> 주어진 파라미터로 피드를 검색 */
  search(params: SearchParams): Promise<Feed[]>;
}
