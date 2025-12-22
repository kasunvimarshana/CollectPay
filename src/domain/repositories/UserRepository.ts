import {User, UserId} from '../entities/User';

export interface UserRepository {
  getAll(onChange?: (users: User[]) => void): Promise<User[]>;
  getById(id: UserId): Promise<User | undefined>;
  create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
  ): Promise<User>;
  update(
    id: UserId,
    changes: Partial<Omit<User, 'id' | 'createdAt'>>,
  ): Promise<User>;
  delete(id: UserId): Promise<void>;
}
