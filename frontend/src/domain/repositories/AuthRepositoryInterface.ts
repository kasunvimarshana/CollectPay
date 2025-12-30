import { User, AuthResponse } from '../entities/User';

/**
 * Authentication Repository Interface
 * 
 * Defines the contract for authentication operations.
 */
export interface AuthRepositoryInterface {
  /**
   * Register a new user
   */
  register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    roles?: string[]
  ): Promise<AuthResponse>;

  /**
   * Login with email and password
   */
  login(email: string, password: string): Promise<AuthResponse>;

  /**
   * Logout the current user
   */
  logout(): Promise<void>;

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Promise<User>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;
}
