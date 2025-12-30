/**
 * Local Database Service
 * Provides a simple key-value storage for offline data using AsyncStorage
 * For production, consider using WatermelonDB or SQLite for better performance
 * Following Clean Architecture - Infrastructure Layer
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_PREFIX = '@fieldpay_db:';

export class LocalDatabaseService {
  /**
   * Save data to local database
   */
  public async save<T>(collection: string, id: string, data: T): Promise<void> {
    try {
      const key = this.getKey(collection, id);
      const jsonData = JSON.stringify({
        ...data,
        _id: id,
        _collection: collection,
        _savedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error saving to ${collection}:`, errorMessage, error);
      throw new Error(`Failed to save ${collection} with id ${id}: ${errorMessage}`);
    }
  }

  /**
   * Get data from local database
   */
  public async get<T>(collection: string, id: string): Promise<T | null> {
    try {
      const key = this.getKey(collection, id);
      const jsonData = await AsyncStorage.getItem(key);
      
      if (!jsonData) {
        return null;
      }

      const data = JSON.parse(jsonData);
      return data as T;
    } catch (error) {
      console.error(`Error getting from ${collection}:`, error);
      return null;
    }
  }

  /**
   * Get all data from a collection
   */
  public async getAll<T>(collection: string): Promise<T[]> {
    try {
      const prefix = this.getCollectionPrefix(collection);
      const allKeys = await AsyncStorage.getAllKeys();
      const collectionKeys = allKeys.filter(key => key.startsWith(prefix));

      if (collectionKeys.length === 0) {
        return [];
      }

      const items = await AsyncStorage.multiGet(collectionKeys);
      const results: T[] = [];

      items.forEach(([key, value]) => {
        if (value) {
          try {
            const data = JSON.parse(value);
            results.push(data as T);
          } catch (error) {
            console.error(`Error parsing item ${key}:`, error);
          }
        }
      });

      return results;
    } catch (error) {
      console.error(`Error getting all from ${collection}:`, error);
      return [];
    }
  }

  /**
   * Update data in local database
   */
  public async update<T>(collection: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const existing = await this.get<T>(collection, id);
      
      if (!existing) {
        throw new Error(`Item ${id} not found in ${collection}`);
      }

      const updated = {
        ...existing,
        ...data,
        _updatedAt: new Date().toISOString(),
      };

      await this.save(collection, id, updated);
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Delete data from local database
   */
  public async delete(collection: string, id: string): Promise<void> {
    try {
      const key = this.getKey(collection, id);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error deleting from ${collection}:`, error);
      throw new Error(`Failed to delete ${collection} with id ${id}`);
    }
  }

  /**
   * Clear entire collection
   */
  public async clearCollection(collection: string): Promise<void> {
    try {
      const prefix = this.getCollectionPrefix(collection);
      const allKeys = await AsyncStorage.getAllKeys();
      const collectionKeys = allKeys.filter(key => key.startsWith(prefix));

      if (collectionKeys.length > 0) {
        await AsyncStorage.multiRemove(collectionKeys);
      }
    } catch (error) {
      console.error(`Error clearing collection ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Check if item exists
   */
  public async exists(collection: string, id: string): Promise<boolean> {
    const key = this.getKey(collection, id);
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  }

  /**
   * Query collection with filter
   */
  public async query<T>(
    collection: string,
    filter: (item: T) => boolean
  ): Promise<T[]> {
    const allItems = await this.getAll<T>(collection);
    return allItems.filter(filter);
  }

  /**
   * Get collection size
   */
  public async getCollectionSize(collection: string): Promise<number> {
    const prefix = this.getCollectionPrefix(collection);
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter(key => key.startsWith(prefix)).length;
  }

  private getKey(collection: string, id: string): string {
    return `${DB_PREFIX}${collection}:${id}`;
  }

  private getCollectionPrefix(collection: string): string {
    return `${DB_PREFIX}${collection}:`;
  }
}

// Singleton instance
export const localDatabase = new LocalDatabaseService();
