import { RegionName } from '@travel-plan/region-name.enum';

/**
 * 게시물 가공 후 클라이언트에 전달할 데이터 구조
 */
export interface ExtractedFeed {
  /** 게시물 ID */
  feedId: string;

  /** 연결된 여행 계획 ID */
  travelPlanId: string;

  /** 게시물 작성자 ID */
  userId: string;

  /** 게시물 생성일 */
  createdAt: Date;

  /** 공개 여부 */
  isPublic: boolean;

  /** 좋아요 수 */
  likeCount: number;

  /** 게시물 제목 */
  title: string;

  /** 여행 지역 */
  region: RegionName;

  /** 여행 시작일 */
  startDate: Date;

  /** 여행 종료일 */
  endDate: Date;

  /** 썸네일 이미지 URL (옵션) */
  thumbnailUrl: string | null;

  /** 커버 이미지 URL */
  coverImage: string;

  /** 사용자의 스크랩 여부 */
  isScrapped: boolean;
}
