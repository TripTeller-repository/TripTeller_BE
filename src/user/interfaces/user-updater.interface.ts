import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../schemas/user.schema';

export interface IUserUpdater {
  updateNicknameByEmail(email: string, updateUserDto: UpdateUserDto): Promise<User>;
  updateNickNameById(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  updateProfileImageById(userId: string, imageUrl: string): Promise<User>;
}
