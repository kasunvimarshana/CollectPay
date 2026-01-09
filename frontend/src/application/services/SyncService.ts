/**
 * Synchronization Service
 * Handles offline/online data synchronization with conflict resolution
 */

import apiClient from '../../infrastructure/api/apiClient';
import LocalStorageService, { PendingSync } from '../../infrastructure/storage/LocalStorageService';
import ConflictResolutionService from './ConflictResolutionService';
import { API_ENDPOINTS } from '../../core/constants/api';
import Logger from '../../core/utils/Logger';

class SyncService {
  private isSyncing = false;
  private syncAttempts: Map<number, number> = new Map();

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
          Logger.error(`Failed to sync item ${item.id}`, error, 'SyncService');
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
   * Sync a single item with conflict resolution
   */
  private async syncItem(item: PendingSync): Promise<void> {
    const data = JSON.parse(item.data);
    const endpoint = this.getEndpoint(item.entity);
    
    // Validate data before sync - pass action for proper validation
    const validation = ConflictResolutionService.validateSyncData(data, item.entity, item.action);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Prepare sync request with version info
    const syncData = ConflictResolutionService.prepareSyncRequest(data);
    
    try {
      let response;
      
      switch (item.action) {
        case 'create':
          response = await apiClient.post(endpoint, syncData);
          break;
        case 'update':
          response = await apiClient.put(`${endpoint}/${data.id}`, syncData);
          break;
        case 'delete':
          response = await apiClient.delete(`${endpoint}/${data.id}`);
          break;
      }
      
      // Check for version conflicts in response
      if (response && response.conflict) {
        await this.handleConflict(item, response);
      }
      
    } catch (error: any) {
      // Handle version conflicts
      if (error.response?.status === 409) {
        const serverData = error.response.data;
        const conflict = {
          localVersion: data.version || 1,
          serverVersion: serverData.version || 1,
          localData: data,
          serverData: serverData,
          entity: item.entity,
          entityId: data.id,
        };
        
        const resolution = ConflictResolutionService.resolveConflict(conflict);
        ConflictResolutionService.logConflict(conflict, resolution);
        
        if (resolution.action === 'use_server') {
          // Accept server data and update local cache
          await this.updateLocalCache(item.entity, resolution.resolvedData);
        } else if (resolution.action === 'retry') {
          throw new Error('Retry needed - version conflict');
        }
      } else {
        // Check if should retry
        const attemptCount = this.syncAttempts.get(item.id!) || 0;
        if (ConflictResolutionService.shouldRetry(attemptCount, error)) {
          this.syncAttempts.set(item.id!, attemptCount + 1);
          const delay = ConflictResolutionService.getRetryDelay(attemptCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.syncItem(item); // Retry
        }
        throw error;
      }
    }
  }
  
  /**
   * Handle conflict resolution
   */
  private async handleConflict(item: PendingSync, response: any): Promise<void> {
    const data = JSON.parse(item.data);
    const conflict = {
      localVersion: data.version || 1,
      serverVersion: response.data?.version || 1,
      localData: data,
      serverData: response.data,
      entity: item.entity,
      entityId: data.id,
    };
    
    const resolution = ConflictResolutionService.resolveConflict(conflict);
    ConflictResolutionService.logConflict(conflict, resolution);
    
    // Always use server data
    if (resolution.resolvedData) {
      await this.updateLocalCache(item.entity, resolution.resolvedData);
    }
  }
  
  /**
   * Update local cache with server data
   */
  private async updateLocalCache(entity: string, data: any): Promise<void> {
    switch (entity) {
      case 'supplier':
        await LocalStorageService.cacheSuppliers([data]);
        break;
      case 'product':
        await LocalStorageService.cacheProducts([data]);
        break;
      case 'rate':
        await LocalStorageService.cacheRates([data]);
        break;
      case 'collection':
        await LocalStorageService.cacheCollections([data]);
        break;
      case 'payment':
        await LocalStorageService.cachePayments([data]);
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
      case 'rate':
        return API_ENDPOINTS.RATES;
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
      const response = await apiClient.get<any>(API_ENDPOINTS.SUPPLIERS);
      if (response.success && response.data) {
        const suppliers = Array.isArray(response.data) 
          ? response.data 
          : ((response.data as any).data && Array.isArray((response.data as any).data) ? (response.data as any).data : []);
        
        if (suppliers.length > 0) {
          await LocalStorageService.cacheSuppliers(suppliers);
        }
      }
    } catch (error) {
      Logger.error('Error fetching suppliers', error, 'SyncService');
      throw error;
    }
  }

  /**
   * Fetch and cache products
   */
  async fetchAndCacheProducts(): Promise<void> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS);
      if (response.success && response.data) {
        const products = Array.isArray(response.data) 
          ? response.data 
          : ((response.data as any).data && Array.isArray((response.data as any).data) ? (response.data as any).data : []);
        
        if (products.length > 0) {
          await LocalStorageService.cacheProducts(products);
        }
      }
    } catch (error) {
      Logger.error('Error fetching products', error, 'SyncService');
      throw error;
    }
  }

  /**
   * Fetch and cache rates
   */
  async fetchAndCacheRates(): Promise<void> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.RATES);
      if (response.success && response.data) {
        const rates = Array.isArray(response.data) 
          ? response.data 
          : ((response.data as any).data && Array.isArray((response.data as any).data) ? (response.data as any).data : []);
        
        if (rates.length > 0) {
          await LocalStorageService.cacheRates(rates);
        }
      }
    } catch (error) {
      Logger.error('Error fetching rates', error, 'SyncService');
      throw error;
    }
  }

  /**
   * Fetch and cache collections
   */
  async fetchAndCacheCollections(): Promise<void> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.COLLECTIONS);
      if (response.success && response.data) {
        const collections = Array.isArray(response.data) 
          ? response.data 
          : ((response.data as any).data && Array.isArray((response.data as any).data) ? (response.data as any).data : []);
        
        if (collections.length > 0) {
          await LocalStorageService.cacheCollections(collections);
        }
      }
    } catch (error) {
      Logger.error('Error fetching collections', error, 'SyncService');
      throw error;
    }
  }

  /**
   * Fetch and cache payments
   */
  async fetchAndCachePayments(): Promise<void> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.PAYMENTS);
      if (response.success && response.data) {
        const payments = Array.isArray(response.data) 
          ? response.data 
          : ((response.data as any).data && Array.isArray((response.data as any).data) ? (response.data as any).data : []);
        
        if (payments.length > 0) {
          await LocalStorageService.cachePayments(payments);
        }
      }
    } catch (error) {
      Logger.error('Error fetching payments', error, 'SyncService');
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
      await this.fetchAndCacheRates();
      await this.fetchAndCacheCollections();
      await this.fetchAndCachePayments();

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
