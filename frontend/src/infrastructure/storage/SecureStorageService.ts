import * as SecureStore from 'expo-secure-store';

/**
 * Secure Storage Service
 * Manages secure storage of sensitive data like tokens
 */
export class SecureStorageService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  /**
   * Save authentication token
   */
  static async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.TOKEN_KEY, token);
  }

  /**
   * Get authentication token
   */
  static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.TOKEN_KEY);
  }

  /**
   * Remove authentication token
   */
  static async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
  }

  /**
   * Save user data
   */
  static async saveUser(user: any): Promise<void> {
    await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data
   */
  static async getUser(): Promise<any | null> {
    const userData = await SecureStore.getItemAsync(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Remove user data
   */
  static async removeUser(): Promise<void> {
    await SecureStore.deleteItemAsync(this.USER_KEY);
  }

  /**
   * Clear all secure storage
   */
  static async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  }
}
