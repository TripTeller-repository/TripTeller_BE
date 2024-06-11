/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: {
      userId: string;
      authProvider: string;
    };
  }
}
