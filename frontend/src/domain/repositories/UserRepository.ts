import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

/**
 * User Repository Interface
 * 
 * Defines contract for user data operations.
 * Implementations can be API-based or local database.
 */
export interface UserRepository {
  getAll(page?: number, perPage?: number): Promise<User[]>;
  getById(id: number): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: number, data: UpdateUserDTO): Promise<User>;
  delete(id: number): Promise<boolean>;
}
