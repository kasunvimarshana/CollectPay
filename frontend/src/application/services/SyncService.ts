/**
 * Synchronization Service
 * Handles offline/online data synchronization
 */

import apiClient from '../../infrastructure/api/apiClient';
import LocalStorageService, { PendingSync } from '../../infrastructure/storage/LocalStorageService';
import { API_ENDPOINTS } from '../../core/constants/api';

class SyncService {
  private isSyncing = false;

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    await LocalStorageService.initialize();
  }

  /**
   * Sync all pending changes
   */
  async syncPendingChanges(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      const pendingItems = await LocalStorageService.getPendingSyncItems();

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await LocalStorageService.markSynced(item.id!);
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          failedCount++;
        }
      }

      // Cleanup synced items
      if (syncedCount > 0) {
        await LocalStorageService.deleteSyncedItems();
      }

      return { success: true, synced: syncedCount, failed: failedCount };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: PendingSync): Promise<void> {
    const data = JSON.parse(item.data);
    const endpoint = this.getEndpoint(item.entity);

    switch (item.action) {
      case 'create':
        await apiClient.post(endpoint, data);
        break;
      case 'update':
        await apiClient.put(`${endpoint}/${data.id}`, data);
        break;
      case 'delete':
        await apiClient.delete(`${endpoint}/${data.id}`);
        break;
    }
  }

  /**
   * Get API endpoint for entity
   */
  private getEndpoint(entity: string): string {
    switch (entity) {
      case 'supplier':
        return API_ENDPOINTS.SUPPLIERS;
      case 'product':
        return API_ENDPOINTS.PRODUCTS;
      case 'collection':
        return API_ENDPOINTS.COLLECTIONS;
      case 'payment':
        return API_ENDPOINTS.PAYMENTS;
      default:
        throw new Error(`Unknown entity: ${entity}`);
    }
  }

  /**
   * Fetch and cache suppliers
   */
  async fetchAndCacheSuppliers(): Promise<void> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUPPLIERS);
      if (response.success && response.data) {
        const suppliers = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);
        
        if (suppliers.length > 0) {
          await LocalStorageService.cacheSuppliers(suppliers);
        }
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  /**
   * Fetch and cache products
   */
  async fetchAndCacheProducts(): Promise<void> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS);
      if (response.success && response.data) {
        const products = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);
        
        if (products.length > 0) {
          await LocalStorageService.cacheProducts(products);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Full sync - sync pending changes and fetch latest data
   */
  async fullSync(): Promise<{ success: boolean; message: string }> {
    try {
      // Sync pending changes first
      const syncResult = await this.syncPendingChanges();

      // Fetch and cache latest data
      await this.fetchAndCacheSuppliers();
      await this.fetchAndCacheProducts();

      return {
        success: true,
        message: `Synced ${syncResult.synced} items. ${syncResult.failed} failed.`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Sync failed',
      };
    }
  }

  /**
   * Check if there are pending changes
   */
  async hasPendingChanges(): Promise<boolean> {
    const pendingItems = await LocalStorageService.getPendingSyncItems();
    return pendingItems.length > 0;
  }
}

export default new SyncService();
