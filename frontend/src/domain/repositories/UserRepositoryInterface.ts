/**
 * User Repository Interface
 * Defines the contract for user data operations
 */

import { User } from '../entities/User';

export interface UserRepositoryInterface {
  /**
   * Create a new user
   */
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;

  /**
   * Get user by ID
   */
  getById(id: string): Promise<User | null>;

  /**
   * Get user by email
   */
  getByEmail(email: string): Promise<User | null>;

  /**
   * Get all users with pagination
   */
  getAll(page?: number, limit?: number): Promise<User[]>;

  /**
   * Update existing user
   */
  update(id: string, user: Partial<User>): Promise<User>;

  /**
   * Delete user by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if user exists by email
   */
  existsByEmail(email: string): Promise<boolean>;
}
