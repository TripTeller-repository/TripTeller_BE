import { UserInfoDto } from '../dto/user-info.dto';
import { User } from '../schemas/user.schema';

export interface IUserReader {
  findUserInfoById(userId: string): Promise<UserInfoDto>;
  findUserByEmail(email: string): Promise<User>;
  findUserById(id: string): Promise<User>;
  findAllUsers(): Promise<User[]>;
  findNickname(userId: string): Promise<{ nickname: string }>;
}
