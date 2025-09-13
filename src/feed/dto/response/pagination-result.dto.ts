/**
 * 게시물 목록 페이지네이션 응답 형식
 */
export interface PaginationResult {
  /** 응답 성공 여부 */
  success: boolean;

  /** 게시물 목록과 메타데이터 */
  feeds: {
    /** 페이징 메타데이터 */
    metadata: {
      /** 전체 게시물 수 */
      totalCount: number;

      /** 현재 페이지 번호 */
      pageNumber: number;

      /** 페이지당 게시물 수 */
      pageSize: number;
    };

    /** 게시물 데이터 배열 */
    data: any[];
  };
}
