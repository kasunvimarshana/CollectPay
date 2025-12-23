import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export class SecureStorageService {
  private static instance: SecureStorageService;

  private constructor() {}

  public static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  public async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Secure storage set error:', error);
      throw error;
    }
  }

  public async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Secure storage remove error:', error);
      throw error;
    }
  }

  public async setToken(token: string): Promise<void> {
    await this.setItem('auth_token', token);
  }

  public async getToken(): Promise<string | null> {
    return await this.getItem('auth_token');
  }

  public async removeToken(): Promise<void> {
    await this.removeItem('auth_token');
  }

  public async setUser(user: any): Promise<void> {
    await this.setItem('user_data', JSON.stringify(user));
  }

  public async getUser(): Promise<any | null> {
    const userData = await this.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  public async removeUser(): Promise<void> {
    await this.removeItem('user_data');
  }

  public async setDeviceId(): Promise<string> {
    let deviceId = await this.getItem('device_id');
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await this.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  public async getDeviceId(): Promise<string | null> {
    return await this.getItem('device_id');
  }

  public async clear(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  }
}
