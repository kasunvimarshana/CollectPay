import { AuthRepositoryInterface } from '../../domain/repositories/AuthRepositoryInterface';
import { User, AuthResponse } from '../../domain/entities/User';
import { apiClient } from '../../core/network/ApiClient';
import { API_ENDPOINTS } from '../../core/constants/api';

/**
 * Auth Repository Implementation
 * 
 * Implements authentication operations using the API client.
 */
export class AuthRepository implements AuthRepositoryInterface {
  async register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    roles?: string[]
  ): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      roles: roles || ['collector'],
    });

    // Save token
    if (response.token) {
      await apiClient.setAuthToken(response.token);
    }

    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    // Save token
    if (response.token) {
      await apiClient.setAuthToken(response.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    await apiClient.clearAuthToken();
  }

  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
}
