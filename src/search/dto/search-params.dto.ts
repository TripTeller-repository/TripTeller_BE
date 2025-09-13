/**
 * 검색 파라미터 DTO
 * @description 검색할 조건을 담는 객체
 */

export interface SearchParams {
  /** 게시물 제목 */
  title?: string;
  /** 게시물 내용 */
  content?: string;
  /** 작성자 닉네임 */
  author?: string;
  /** 검색할 지역 */
  region?: string;
}
