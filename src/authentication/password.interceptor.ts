import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 응답에서 비밀번호 필드를 제거하는 인터셉터
 */
@Injectable()
export class PasswordSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 응답 데이터가 배열인 경우
        if (Array.isArray(data)) {
          return data.map((item) => this.removePassword(item));
        }

        // 단일 객체인 경우
        return this.removePassword(data);
      }),
    );
  }

  private removePassword(data: any): any {
    // null이나 undefined인 경우 그대로 반환
    if (!data) return data;

    // 객체가 아닌 경우 그대로 반환
    if (typeof data !== 'object') return data;

    // 비밀번호 필드 삭제
    if (data.password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = data;
      return rest;
    }

    // 중첩된 객체의 경우 재귀적으로 처리
    if (data.user) {
      data.user = this.removePassword(data.user);
    }

    return data;
  }
}
