/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import { IUser } from './user.interface';

declare module 'express' {
  export interface Request {
    user?: IUser;
  }
}
