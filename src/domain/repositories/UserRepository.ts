import type { User, UserId } from "../models/User";

export interface UserRepository {
  init(): Promise<void>;
  list(): Promise<User[]>;
  get(id: UserId): Promise<User | null>;
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}
