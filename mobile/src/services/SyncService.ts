import { apiService } from './ApiService';
import { StorageService } from './StorageService';
import { Collection, Payment, Rate, SyncQueueItem, SyncConflict } from '../types';

export class SyncService {
  private isSyncing = false;

  /**
   * Perform a full synchronization (pull from server, push local changes)
   */
  async performSync(): Promise<{ success: boolean; conflicts: SyncConflict[] }> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: false, conflicts: [] };
    }

    this.isSyncing = true;
    const conflicts: SyncConflict[] = [];

    try {
      // Check if online
      const isOnline = await apiService.isOnline();
      if (!isOnline) {
        console.log('Device is offline, skipping sync');
        return { success: false, conflicts: [] };
      }

      // Step 1: Pull data from server
      await this.pullFromServer();

      // Step 2: Push pending local changes
      const pushResult = await this.pushToServer();
      if (pushResult.conflicts) {
        conflicts.push(...pushResult.conflicts);
      }

      // Step 3: Update last sync time
      await StorageService.saveLastSync(new Date().toISOString());

      this.isSyncing = false;
      return { success: true, conflicts };
    } catch (error) {
      console.error('Sync error:', error);
      this.isSyncing = false;
      return { success: false, conflicts };
    }
  }

  /**
   * Pull data from server and update local storage
   */
  async pullFromServer(): Promise<void> {
    try {
      const lastSync = await StorageService.getLastSync();
      const response = await apiService.syncPull(lastSync || undefined);

      // Update local storage with server data
      if (response.data.collections) {
        const localCollections = await StorageService.getCollections();
        const merged = this.mergeData(localCollections, response.data.collections, 'uuid');
        await StorageService.saveCollections(merged);
      }

      if (response.data.payments) {
        const localPayments = await StorageService.getPayments();
        const merged = this.mergeData(localPayments, response.data.payments, 'uuid');
        await StorageService.savePayments(merged);
      }

      if (response.data.rates) {
        const localRates = await StorageService.getRates();
        const merged = this.mergeData(localRates, response.data.rates, 'uuid');
        await StorageService.saveRates(merged);
      }

      console.log('Pull completed successfully');
    } catch (error) {
      console.error('Pull error:', error);
      throw error;
    }
  }

  /**
   * Push pending local changes to server
   */
  async pushToServer(): Promise<{ success: boolean; conflicts: SyncConflict[] }> {
    const conflicts: SyncConflict[] = [];

    try {
      const queue = await StorageService.getSyncQueue();
      
      if (queue.length === 0) {
        console.log('No pending changes to push');
        return { success: true, conflicts: [] };
      }

      // Group queue items by entity type
      const groupedData: any = {
        collections: [],
        payments: [],
        rates: [],
      };

      for (const item of queue) {
        if (item.status === 'pending') {
          groupedData[`${item.entity_type}s`].push(item.data);
        }
      }

      // Push to server
      const response = await apiService.syncPush(groupedData);

      // Process results
      if (response.results.conflicts && response.results.conflicts.length > 0) {
        conflicts.push(...response.results.conflicts);
      }

      // Remove successfully synced items from queue
      for (const item of queue) {
        const wasSuccessful = this.checkIfSynced(item, response.results);
        if (wasSuccessful) {
          await StorageService.removeFromSyncQueue(item.uuid);
        }
      }

      console.log('Push completed successfully');
      return { success: true, conflicts };
    } catch (error) {
      console.error('Push error:', error);
      return { success: false, conflicts };
    }
  }

  /**
   * Add an item to the sync queue (for offline operations)
   */
  async addToQueue(
    entityType: 'collection' | 'payment' | 'rate',
    entityUuid: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    const deviceId = await StorageService.getDeviceId();
    
    const queueItem: SyncQueueItem = {
      uuid: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entity_type: entityType,
      entity_uuid: entityUuid,
      operation,
      data,
      status: 'pending',
      retry_count: 0,
      device_id: deviceId,
      created_at: new Date().toISOString(),
    };

    await StorageService.addToSyncQueue(queueItem);
  }

  /**
   * Create a collection (offline-first)
   */
  async createCollection(collection: Partial<Collection>): Promise<Collection> {
    const deviceId = await StorageService.getDeviceId();
    const user = await StorageService.getUser();
    
    const newCollection: Collection = {
      uuid: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: collection.name!,
      description: collection.description,
      created_by: user.id,
      status: collection.status || 'active',
      metadata: collection.metadata,
      version: 1,
      device_id: deviceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save locally
    await StorageService.addCollection(newCollection);

    // Add to sync queue
    await this.addToQueue('collection', newCollection.uuid, 'create', newCollection);

    // Try to sync immediately if online
    const isOnline = await apiService.isOnline();
    if (isOnline) {
      this.performSync().catch(console.error);
    }

    return newCollection;
  }

  /**
   * Create a payment (offline-first)
   */
  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const deviceId = await StorageService.getDeviceId();
    const user = await StorageService.getUser();
    
    const newPayment: Payment = {
      uuid: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payment_reference: `PAY-${Date.now()}`,
      collection_id: payment.collection_id!,
      rate_id: payment.rate_id,
      payer_id: payment.payer_id || user.id,
      amount: payment.amount!,
      currency: payment.currency || 'USD',
      status: 'pending',
      payment_method: payment.payment_method!,
      notes: payment.notes,
      payment_date: payment.payment_date || new Date().toISOString(),
      is_automated: payment.is_automated || false,
      metadata: payment.metadata,
      version: 1,
      created_by: user.id,
      device_id: deviceId,
      idempotency_key: `${deviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save locally
    await StorageService.addPayment(newPayment);

    // Add to sync queue
    await this.addToQueue('payment', newPayment.uuid, 'create', newPayment);

    // Try to sync immediately if online
    const isOnline = await apiService.isOnline();
    if (isOnline) {
      this.performSync().catch(console.error);
    }

    return newPayment;
  }

  /**
   * Merge server data with local data
   */
  private mergeData(local: any[], server: any[], keyField: string): any[] {
    const merged = [...local];

    for (const serverItem of server) {
      const localIndex = merged.findIndex((item) => item[keyField] === serverItem[keyField]);
      
      if (localIndex >= 0) {
        // Update if server version is newer
        if (serverItem.version >= merged[localIndex].version) {
          merged[localIndex] = serverItem;
        }
      } else {
        // Add new item
        merged.push(serverItem);
      }
    }

    return merged;
  }

  /**
   * Check if an item was successfully synced
   */
  private checkIfSynced(item: SyncQueueItem, results: any): boolean {
    const entityResults = results[`${item.entity_type}s`] || [];
    const result = entityResults.find((r: any) => r.uuid === item.entity_uuid);
    
    return result && (result.status === 'created' || result.status === 'updated' || result.status === 'exists');
  }

  /**
   * Resolve a conflict by choosing server or client version
   */
  async resolveConflict(
    conflict: SyncConflict,
    resolution: 'server_wins' | 'client_wins' | 'merge',
    mergedData?: any
  ): Promise<void> {
    const conflicts = [{
      uuid: conflict.uuid,
      entity_type: conflict.entity_type,
      resolution,
      merged_data: mergedData,
    }];

    await apiService.resolveConflicts(conflicts);
    
    // Re-sync to get the resolved data
    await this.pullFromServer();
  }
}

export const syncService = new SyncService();
