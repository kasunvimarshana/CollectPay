import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Offline Storage Manager
 * 
 * Handles local data storage for offline support.
 * Provides methods for storing and retrieving data when offline.
 */
class OfflineStorageManager {
  /**
   * Save data to storage
   */
  async save<T>(key: string, data: T): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get data from storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (jsonData === null) {
        return null;
      }
      return JSON.parse(jsonData) as T;
    } catch (error) {
      console.error(`Failed to get data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove data from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Get all keys from storage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Check if a key exists
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Failed to check key ${key}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();
