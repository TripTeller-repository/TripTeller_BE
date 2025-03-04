import 'ioredis';

declare module 'ioredis' {
  interface Redis {
    exists(key: string): Promise<number>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode?: string, duration?: number): Promise<string>;
    sadd(key: string, ...members: string[]): Promise<number>;
    srem(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    del(key: string): Promise<number>;
    pipeline(): Redis.Pipeline;
  }
}
