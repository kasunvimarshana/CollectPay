/**
 * Authentication Service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { ApiResponse } from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../../core/constants/api';
import { User } from '../../domain/entities/User';
import Logger from '../../core/utils/Logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: ApiResponse<AuthResponse> = await apiClient.post(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        // Store token and user data
        await this.storeAuthData(response.data.token, response.data.user);
        return response.data;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: ApiResponse<AuthResponse> = await apiClient.post(
        API_ENDPOINTS.REGISTER,
        data
      );

      if (response.success && response.data) {
        // Store token and user data
        await this.storeAuthData(response.data.token, response.data.user);
        return response.data;
      }

      throw new Error(response.message || 'Registration failed');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Logout user
   * Ensures complete cleanup of authentication state even if API call fails
   */
  async logout(): Promise<void> {
    try {
      // Attempt to notify the server about logout
      // This will invalidate the token on the server side
      await apiClient.post(API_ENDPOINTS.LOGOUT, {});
    } catch (error: any) {
      // Log the error but continue with local cleanup
      // Network failures or token issues shouldn't prevent local logout
      Logger.error('Logout API error', error?.message || error, 'AuthService');
      
      // Only throw if it's a critical error that prevents cleanup
      // For most cases, we proceed with local cleanup regardless
    } finally {
      // Always clear local authentication data
      // This is crucial for security - local data must be cleared
      await this.clearAuthData();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response: ApiResponse<User> = await apiClient.get(API_ENDPOINTS.ME);

      if (response.success && response.data) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
        return response.data;
      }

      return null;
    } catch (error) {
      Logger.error('Get current user error', error, 'AuthService');
      return null;
    }
  }

  /**
   * Store authentication data
   */
  private async storeAuthData(token: string, user: User): Promise<void> {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Clear authentication data
   */
  private async clearAuthData(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    return !!token;
  }

  /**
   * Get stored user
   */
  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      Logger.error('Get stored user error', error, 'AuthService');
      return null;
    }
  }
}

export default new AuthService();
