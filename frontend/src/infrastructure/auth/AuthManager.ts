/**
 * Authentication Manager
 * 
 * Handles authentication state, token management, and secure storage.
 * Uses expo-secure-store for encrypted token storage.
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export class AuthManager {
  /**
   * Save authentication token securely
   */
  static async saveToken(token: string, expiresAt?: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (expiresAt) {
      await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiresAt);
    }
  }

  /**
   * Get authentication token
   */
  static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }

  /**
   * Check if token is expired
   */
  static async isTokenExpired(): Promise<boolean> {
    const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
    if (!expiryStr) {
      return false; // No expiry set, assume valid
    }
    
    const expiry = new Date(expiryStr);
    return expiry <= new Date();
  }

  /**
   * Save refresh token
   */
  static async saveRefreshToken(refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Get refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  /**
   * Save user data
   */
  static async saveUser(user: any): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data
   */
  static async getUser(): Promise<any | null> {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    if (!userStr) {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
      return false;
    }
    
    const isExpired = await this.isTokenExpired();
    return !isExpired;
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      // Make API call to refresh endpoint
      // This is a placeholder - actual implementation would call API
      // const response = await apiClient.post('/auth/refresh', { refreshToken });
      // await this.saveToken(response.data.token, response.data.expiresAt);
      // return response.data.token;
      
      // For now, return null
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  /**
   * Logout user and clear all auth data
   */
  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
  }

  /**
   * Clear all auth data (alias for logout)
   */
  static async clearAuthData(): Promise<void> {
    await this.logout();
  }
}
