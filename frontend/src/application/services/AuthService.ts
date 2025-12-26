import { apiClient, ApiResponse } from '../../infrastructure/api/ApiClient';
import { SecureStorageService } from '../../infrastructure/storage/SecureStorageService';
import { User } from '../../domain/entities/User';

/**
 * Authentication Service
 * Handles user authentication and session management
 */
export class AuthService {
  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response: ApiResponse<{ token: string; user: User }> = await apiClient.post('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        await SecureStorageService.saveToken(response.data.token);
        await SecureStorageService.saveUser(response.data.user);
        apiClient.setToken(response.data.token);
        
        return { success: true, user: response.data.user };
      }

      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Register new user
   */
  static async register(name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response: ApiResponse<{ token: string; user: User }> = await apiClient.post('/auth/register', {
        name,
        email,
        password,
      });

      if (response.success && response.data) {
        await SecureStorageService.saveToken(response.data.token);
        await SecureStorageService.saveUser(response.data.user);
        apiClient.setToken(response.data.token);
        
        return { success: true, user: response.data.user };
      }

      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    await SecureStorageService.clearAll();
    apiClient.setToken(null);
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await SecureStorageService.getToken();
    return token !== null;
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    return await SecureStorageService.getUser();
  }

  /**
   * Initialize auth (restore session)
   */
  static async initializeAuth(): Promise<User | null> {
    const token = await SecureStorageService.getToken();
    if (token) {
      apiClient.setToken(token);
      const user = await SecureStorageService.getUser();
      return user;
    }
    return null;
  }
}
