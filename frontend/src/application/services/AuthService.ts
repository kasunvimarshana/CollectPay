/**
 * Authentication Service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { ApiResponse } from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS, TOKEN_STORAGE_KEY, TOKEN_EXPIRY_STORAGE_KEY, USER_STORAGE_KEY } from '../../core/constants/api';
import { User } from '../../domain/entities/User';
import Logger from '../../core/utils/Logger';

// Token refresh buffer - refresh 5 minutes before expiry
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

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
  private refreshPromise: Promise<AuthResponse> | null = null;

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
        // Store token and user data with expiry
        await this.storeAuthData(response.data.token, response.data.user, response.data.expires_in);
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
        // Store token and user data with expiry
        await this.storeAuthData(response.data.token, response.data.user, response.data.expires_in);
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
  private async storeAuthData(token: string, user: User, expiresIn?: number): Promise<void> {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    
    // Store token expiry time if provided
    if (expiresIn) {
      const expiryTime = Date.now() + (expiresIn * 1000); // Convert seconds to ms
      await AsyncStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, expiryTime.toString());
    }
  }

  /**
   * Clear authentication data
   */
  private async clearAuthData(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
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

  /**
   * Check if token is expired or about to expire
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY);
      if (!expiryStr) {
        // No expiry stored - assume expired for safety
        return true;
      }

      const expiryTime = parseInt(expiryStr, 10);
      const now = Date.now();
      
      // Consider expired if within buffer time
      return now >= (expiryTime - TOKEN_REFRESH_BUFFER_MS);
    } catch (error) {
      Logger.error('Check token expiry error', error, 'AuthService');
      return true; // Assume expired on error
    }
  }

  /**
   * Refresh authentication token
   * Uses a singleton pattern to prevent multiple simultaneous refresh calls
   */
  async refreshToken(): Promise<AuthResponse | null> {
    try {
      // If refresh is already in progress, return that promise
      if (this.refreshPromise) {
        return await this.refreshPromise;
      }

      // Start new refresh
      this.refreshPromise = this.performTokenRefresh();
      const result = await this.refreshPromise;
      
      return result;
    } catch (error) {
      Logger.error('Token refresh error', error, 'AuthService');
      throw error;
    } finally {
      // Clear the promise after completion
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<AuthResponse> {
    const response: ApiResponse<AuthResponse> = await apiClient.post(
      API_ENDPOINTS.REFRESH,
      {}
    );

    if (response.success && response.data) {
      // Store new token and user data with expiry
      await this.storeAuthData(response.data.token, response.data.user, response.data.expires_in);
      Logger.info('Token refreshed successfully', undefined, 'AuthService');
      return response.data;
    }

    throw new Error(response.message || 'Token refresh failed');
  }

  /**
   * Validate token and refresh if needed
   * Returns true if token is valid or successfully refreshed
   */
  async validateAndRefreshToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        return false;
      }

      const isExpired = await this.isTokenExpired();
      if (isExpired) {
        Logger.info('Token expired, attempting refresh', undefined, 'AuthService');
        try {
          await this.refreshToken();
          return true;
        } catch (error) {
          Logger.error('Token refresh failed', error, 'AuthService');
          // Clear auth data if refresh fails
          await this.clearAuthData();
          return false;
        }
      }

      return true;
    } catch (error) {
      Logger.error('Token validation error', error, 'AuthService');
      return false;
    }
  }
}

export default new AuthService();
