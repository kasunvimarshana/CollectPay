// Secure storage for sensitive data
import * as SecureStore from 'expo-secure-store';

class SecureStorage {
  async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      throw error;
    }
  }

  async getItem(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
    }
  }

  // Auth token methods
  async setAuthToken(token) {
    await this.setItem('auth_token', token);
  }

  async getAuthToken() {
    return await this.getItem('auth_token');
  }

  async removeAuthToken() {
    await this.removeItem('auth_token');
  }

  // User data methods
  async setUserData(userData) {
    await this.setItem('user_data', JSON.stringify(userData));
  }

  async getUserData() {
    const data = await this.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }

  async removeUserData() {
    await this.removeItem('user_data');
  }

  // Device ID
  async setDeviceId(deviceId) {
    await this.setItem('device_id', deviceId);
  }

  async getDeviceId() {
    return await this.getItem('device_id');
  }

  // Clear all auth data
  async clearAuth() {
    await this.removeAuthToken();
    await this.removeUserData();
  }
}

export default new SecureStorage();
