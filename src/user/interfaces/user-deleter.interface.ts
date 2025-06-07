import { User } from '../schemas/user.schema';

export interface IUserDeleter {
  deleteUserByEmail(email: string, deletedAt: Date): Promise<User>;
  deleteUserById(id: string, deletedAt: Date): Promise<User>;
}
