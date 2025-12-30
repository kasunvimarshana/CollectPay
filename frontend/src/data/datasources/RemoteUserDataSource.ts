/**
 * Remote User Data Source
 * Handles API communication for user operations
 */

import { User } from '../../domain/entities/User';
import { HttpClient } from './HttpClient';

export class RemoteUserDataSource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new user
   */
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return await this.httpClient.post<User>('/users', data);
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    return await this.httpClient.get<User>(`/users/${id}`);
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User> {
    return await this.httpClient.get<User>(`/users/email/${email}`);
  }

  /**
   * Get all users
   */
  async getAll(page: number = 1, limit: number = 20): Promise<User[]> {
    return await this.httpClient.get<User[]>(`/users?page=${page}&limit=${limit}`);
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return await this.httpClient.put<User>(`/users/${id}`, data);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    await this.httpClient.delete(`/users/${id}`);
    return true;
  }

  /**
   * Login
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return await this.httpClient.post('/auth/login', { email, password });
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.httpClient.post('/auth/logout', {});
  }
}
