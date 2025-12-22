import { database } from './database';
import ApiService from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectionModel } from '../models/Collection';
import { PaymentModel } from '../models/Payment';

const LAST_SYNC_KEY = 'last_sync_timestamp';

export interface CollectionServerData {
  id: number;
  client_id: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
  metadata?: any;
  version: number;
}

export interface PaymentServerData {
  id: number;
  client_id: string;
  amount: number;
  payment_type: string;
  notes?: string;
  metadata?: any;
  version: number;
}

export interface SyncConflict {
  type: 'collection' | 'payment';
  clientId: string;
  message: string;
  serverData?: CollectionServerData | PaymentServerData;
}

export interface SyncResult {
  success: boolean;
  error?: string;
  conflicts?: SyncConflict[];
  created?: number;
  updated?: number;
}

class SyncService {
  private isSyncing = false;

  /**
   * Sync all pending data with server
   */
  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, error: 'Sync already in progress' };
    }

    const conflicts: SyncConflict[] = [];
    let totalCreated = 0;
    let totalUpdated = 0;

    try {
      this.isSyncing = true;

      // Check if online
      const token = await ApiService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      // Sync collections
      const collectionResult = await this.syncCollections();
      conflicts.push(...collectionResult.conflicts);
      totalCreated += collectionResult.created;
      totalUpdated += collectionResult.updated;

      // Sync payments
      const paymentResult = await this.syncPayments();
      conflicts.push(...paymentResult.conflicts);
      totalCreated += paymentResult.created;
      totalUpdated += paymentResult.updated;

      // Pull updates from server
      await this.pullUpdates();

      // Update last sync timestamp
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      return {
        success: true,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        created: totalCreated,
        updated: totalUpdated,
      };
    } catch (error: any) {
      console.error('Sync error:', error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync collections to server
   */
  private async syncCollections(): Promise<{
    conflicts: SyncConflict[];
    created: number;
    updated: number;
  }> {
    const conflicts: SyncConflict[] = [];
    let created = 0;
    let updated = 0;

    const collectionsToSync = await database
      .get<CollectionModel>('collections')
      .query()
      .fetch();

    const unsyncedCollections = collectionsToSync.filter(
      (c) => !c.syncedAt || c.updatedAt > c.syncedAt
    );

    if (unsyncedCollections.length === 0) {
      return { conflicts, created, updated };
    }

    const collectionsData = unsyncedCollections.map((c) => ({
      client_id: c.clientId,
      supplier_id: parseInt(c.supplierId),
      product_id: parseInt(c.productId),
      quantity: c.quantity,
      unit: c.unit,
      rate: c.rate,
      amount: c.amount,
      collection_date: c.collectionDate.toISOString(),
      notes: c.notes,
      metadata: c.metadata,
      version: c.version,
    }));

    const response = await ApiService.syncCollections(collectionsData);

    // Process sync results
    await database.write(async () => {
      for (const result of response.results) {
        const collection = unsyncedCollections.find(
          (c) => c.clientId === result.client_id
        );
        
        if (collection) {
          if (result.status === 'created') {
            created++;
            await collection.update((c) => {
              c.serverId = result.id;
              c.syncedAt = new Date();
            });
          } else if (result.status === 'updated') {
            updated++;
            await collection.update((c) => {
              c.serverId = result.id;
              c.syncedAt = new Date();
            });
          } else if (result.status === 'conflict') {
            // Track conflict for user notification
            conflicts.push({
              type: 'collection',
              clientId: result.client_id,
              message: result.message || 'Server has a newer version',
              serverData: result.server_data,
            });
            // Server version wins - update local with server data
            if (result.server_data) {
              await collection.update((c) => {
                c.serverId = result.server_data.id;
                c.quantity = result.server_data.quantity;
                c.rate = result.server_data.rate;
                c.amount = result.server_data.amount;
                c.notes = result.server_data.notes;
                c.metadata = result.server_data.metadata;
                c.version = result.server_data.version;
                c.syncedAt = new Date();
              });
            }
          }
        }
      }
    });

    return { conflicts, created, updated };
  }

  /**
   * Sync payments to server
   */
  private async syncPayments(): Promise<{
    conflicts: SyncConflict[];
    created: number;
    updated: number;
  }> {
    const conflicts: SyncConflict[] = [];
    let created = 0;
    let updated = 0;

    const paymentsToSync = await database
      .get<PaymentModel>('payments')
      .query()
      .fetch();

    const unsyncedPayments = paymentsToSync.filter(
      (p) => !p.syncedAt || p.updatedAt > p.syncedAt
    );

    if (unsyncedPayments.length === 0) {
      return { conflicts, created, updated };
    }

    const paymentsData = unsyncedPayments.map((p) => ({
      client_id: p.clientId,
      supplier_id: parseInt(p.supplierId),
      collection_id: p.collectionId ? parseInt(p.collectionId) : undefined,
      payment_type: p.paymentType,
      amount: p.amount,
      payment_date: p.paymentDate.toISOString(),
      payment_method: p.paymentMethod,
      reference_number: p.referenceNumber,
      notes: p.notes,
      metadata: p.metadata,
      version: p.version,
    }));

    const response = await ApiService.syncPayments(paymentsData);

    // Process sync results
    await database.write(async () => {
      for (const result of response.results) {
        const payment = unsyncedPayments.find(
          (p) => p.clientId === result.client_id
        );
        
        if (payment) {
          if (result.status === 'created') {
            created++;
            await payment.update((p) => {
              p.serverId = result.id;
              p.syncedAt = new Date();
            });
          } else if (result.status === 'updated') {
            updated++;
            await payment.update((p) => {
              p.serverId = result.id;
              p.syncedAt = new Date();
            });
          } else if (result.status === 'conflict') {
            // Track conflict for user notification
            conflicts.push({
              type: 'payment',
              clientId: result.client_id,
              message: result.message || 'Server has a newer version',
              serverData: result.server_data,
            });
            // Server version wins - update local with server data
            if (result.server_data) {
              await payment.update((p) => {
                p.serverId = result.server_data.id;
                p.amount = result.server_data.amount;
                p.paymentType = result.server_data.payment_type;
                p.notes = result.server_data.notes;
                p.metadata = result.server_data.metadata;
                p.version = result.server_data.version;
                p.syncedAt = new Date();
              });
            }
          }
        }
      }
    });

    return { conflicts, created, updated };
  }

  /**
   * Pull updates from server
   */
  private async pullUpdates() {
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    
    if (!lastSync) {
      // First sync - don't pull updates
      return;
    }

    const updates = await ApiService.getUpdates(lastSync);

    // Update local database with server data
    await database.write(async () => {
      // Process collection updates
      for (const serverCollection of updates.collections) {
        const existingCollection = await database
          .get<CollectionModel>('collections')
          .query()
          .where('client_id', serverCollection.client_id)
          .fetch();

        if (existingCollection.length > 0) {
          // Update existing
          await existingCollection[0].update((c) => {
            c.serverId = serverCollection.id;
            c.quantity = serverCollection.quantity;
            c.rate = serverCollection.rate;
            c.amount = serverCollection.amount;
            c.notes = serverCollection.notes;
            c.metadata = serverCollection.metadata;
            c.version = serverCollection.version;
            c.syncedAt = new Date();
          });
        }
      }

      // Process payment updates
      for (const serverPayment of updates.payments) {
        const existingPayment = await database
          .get<PaymentModel>('payments')
          .query()
          .where('client_id', serverPayment.client_id)
          .fetch();

        if (existingPayment.length > 0) {
          // Update existing
          await existingPayment[0].update((p) => {
            p.serverId = serverPayment.id;
            p.amount = serverPayment.amount;
            p.paymentType = serverPayment.payment_type;
            p.notes = serverPayment.notes;
            p.metadata = serverPayment.metadata;
            p.version = serverPayment.version;
            p.syncedAt = new Date();
          });
        }
      }
    });
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<string | null> {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  }
}

export default new SyncService();
