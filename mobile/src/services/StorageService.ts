import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Collection, Payment, Rate, SyncQueueItem } from "../types";

const STORAGE_KEYS = {
  COLLECTIONS: "collections",
  PAYMENTS: "payments",
  RATES: "rates",
  SYNC_QUEUE: "sync_queue",
  LAST_SYNC: "last_sync",
  AUTH_TOKEN: "auth_token",
  USER: "user",
  DEVICE_ID: "device_id",
  SYNC_STATUS: "sync_status",
};

export class StorageService {
  /**
   * Initialize device ID if not exists.
   */
  static async initializeDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
      // Generate device ID using timestamp + random
      deviceId = `device_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }

    return deviceId;
  }

  /**
   * Get stored device ID.
   */
  static async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
      return this.initializeDeviceId();
    }

    return deviceId;
  }

  // Secure storage for sensitive data
  static async setSecure(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      // Fallback to regular storage if secure store fails
      await AsyncStorage.setItem(key, value);
    }
  }

  static async getSecure(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return await AsyncStorage.getItem(key);
    }
  }

  static async deleteSecure(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      await AsyncStorage.removeItem(key);
    }
  }

  // Regular storage
  static async set(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  static async get<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  static async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  // Auth
  static async saveAuthToken(token: string): Promise<void> {
    await this.setSecure(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  static async getAuthToken(): Promise<string | null> {
    return await this.getSecure(STORAGE_KEYS.AUTH_TOKEN);
  }

  static async clearAuth(): Promise<void> {
    await this.deleteSecure(STORAGE_KEYS.AUTH_TOKEN);
    await this.remove(STORAGE_KEYS.USER);
  }

  static async saveUser(user: any): Promise<void> {
    await this.set(STORAGE_KEYS.USER, user);
  }

  static async getUser(): Promise<any> {
    return await this.get(STORAGE_KEYS.USER);
  }

  // Device ID
  static async getDeviceId(): Promise<string> {
    let deviceId = await this.get<string>(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      await this.set(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  }

  // Collections
  static async saveCollections(collections: Collection[]): Promise<void> {
    await this.set(STORAGE_KEYS.COLLECTIONS, collections);
  }

  static async getCollections(): Promise<Collection[]> {
    return (await this.get<Collection[]>(STORAGE_KEYS.COLLECTIONS)) || [];
  }

  static async addCollection(collection: Collection): Promise<void> {
    const collections = await this.getCollections();
    const index = collections.findIndex((c) => c.uuid === collection.uuid);
    if (index >= 0) {
      collections[index] = collection;
    } else {
      collections.push(collection);
    }
    await this.saveCollections(collections);
  }

  // Payments
  static async savePayments(payments: Payment[]): Promise<void> {
    await this.set(STORAGE_KEYS.PAYMENTS, payments);
  }

  static async getPayments(): Promise<Payment[]> {
    return (await this.get<Payment[]>(STORAGE_KEYS.PAYMENTS)) || [];
  }

  static async addPayment(payment: Payment): Promise<void> {
    const payments = await this.getPayments();
    const index = payments.findIndex((p) => p.uuid === payment.uuid);
    if (index >= 0) {
      payments[index] = payment;
    } else {
      payments.push(payment);
    }
    await this.savePayments(payments);
  }

  // Rates
  static async saveRates(rates: Rate[]): Promise<void> {
    await this.set(STORAGE_KEYS.RATES, rates);
  }

  static async getRates(): Promise<Rate[]> {
    return (await this.get<Rate[]>(STORAGE_KEYS.RATES)) || [];
  }

  static async addRate(rate: Rate): Promise<void> {
    const rates = await this.getRates();
    const index = rates.findIndex((r) => r.uuid === rate.uuid);
    if (index >= 0) {
      rates[index] = rate;
    } else {
      rates.push(rate);
    }
    await this.saveRates(rates);
  }

  // Sync Queue
  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    return (await this.get<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE)) || [];
  }

  static async saveSyncQueue(queue: SyncQueueItem[]): Promise<void> {
    await this.set(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  static async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push(item);
    await this.saveSyncQueue(queue);
  }

  static async removeFromSyncQueue(uuid: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter((item) => item.uuid !== uuid);
    await this.saveSyncQueue(filtered);
  }

  // Last Sync Time
  static async saveLastSync(timestamp: string): Promise<void> {
    await this.set(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  static async getLastSync(): Promise<string | null> {
    return await this.get<string>(STORAGE_KEYS.LAST_SYNC);
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    await AsyncStorage.clear();
    await this.deleteSecure(STORAGE_KEYS.AUTH_TOKEN);
  }
}
