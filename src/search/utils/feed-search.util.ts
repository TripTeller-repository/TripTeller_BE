/**
 * 피드 검색 유틸 함수
 * @description 정규식 생성, 중복 제거, 공개 여부 필터링 기능 제공
 */
export class FeedSearchUtil {
  /** 입력 문자열을 정규식으로 변환 */
  static createRegex(value?: string): RegExp {
    if (!value) return /.*/gi;
    return new RegExp(`.*${value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}.*`, 'gi');
  }

  /** 중복 피드를 제거 */
  static removeDuplicates(feeds: any[]): any[] {
    const seen = new Map();
    feeds.forEach((feed) => seen.set(feed._id.toString(), feed));
    return Array.from(seen.values());
  }

  /** 공개된 피드만 필터링 */
  static filterPublicOnly(feeds: any[]): any[] {
    return feeds.filter((f) => f.isPublic);
  }
}
