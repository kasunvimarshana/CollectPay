import React, { createContext, useState, useEffect, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncApi } from '../api';
import { getDatabase } from '../database/init';

const NetworkContext = createContext({});

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInternetReachable, setIsInternetReachable] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    conflicts: 0,
    failed: 0,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);

      // Auto-sync when connection is restored
      if (state.isConnected && state.isInternetReachable && !isSyncing) {
        syncData();
      }
    });

    // Check sync status periodically
    const interval = setInterval(() => {
      if (isConnected && isInternetReachable) {
        checkSyncStatus();
      }
    }, 60000); // Check every minute

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isConnected, isInternetReachable, isSyncing]);

  const checkSyncStatus = async () => {
    try {
      const response = await syncApi.getStatus();
      setSyncStatus(response.data);
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  };

  const syncData = async () => {
    if (isSyncing || !isConnected || !isInternetReachable) {
      return;
    }

    setIsSyncing(true);

    try {
      const db = await getDatabase();

      // Get pending sync items
      const syncQueue = await db.getAllAsync(
        'SELECT * FROM sync_queue WHERE status = ? ORDER BY created_at ASC',
        ['pending']
      );

      if (syncQueue.length === 0) {
        console.log('No items to sync');
        setIsSyncing(false);
        return;
      }

      // Prepare items for push
      const items = syncQueue.map(item => ({
        client_uuid: item.client_uuid,
        entity_type: item.entity_type,
        operation: item.operation,
        data: JSON.parse(item.data),
      }));

      // Push to server
      const response = await syncApi.push(items);
      const results = response.data.results;

      // Update local database based on results
      for (const result of results) {
        if (result.status === 'success') {
          // Mark as synced
          await db.runAsync(
            'UPDATE sync_queue SET status = ?, synced_at = ? WHERE client_uuid = ?',
            ['completed', new Date().toISOString(), result.client_uuid]
          );

          // Update entity with server ID
          const queueItem = syncQueue.find(i => i.client_uuid === result.client_uuid);
          if (queueItem && result.entity_id) {
            await db.runAsync(
              `UPDATE ${queueItem.entity_type}s SET server_id = ?, is_synced = 1, synced_at = ? WHERE id = ?`,
              [result.entity_id, new Date().toISOString(), queueItem.entity_id]
            );
          }
        } else if (result.status === 'conflict') {
          await db.runAsync(
            'UPDATE sync_queue SET status = ? WHERE client_uuid = ?',
            ['conflict', result.client_uuid]
          );
        } else if (result.status === 'failed') {
          await db.runAsync(
            'UPDATE sync_queue SET status = ?, error_message = ?, retry_count = retry_count + 1 WHERE client_uuid = ?',
            ['failed', result.message, result.client_uuid]
          );
        }
      }

      // Pull updates from server
      await pullUpdates();

      // Update sync status
      await checkSyncStatus();

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pullUpdates = async () => {
    try {
      const lastSync = await AsyncStorage.getItem('last_sync_time');
      const response = await syncApi.pull(lastSync);
      const { collections, payments, suppliers, product_rates, sync_time } = response.data;

      const db = await getDatabase();

      // Update suppliers
      for (const supplier of suppliers) {
        await db.runAsync(
          `INSERT OR REPLACE INTO suppliers 
          (server_id, code, name, email, phone, address, village, district, is_active, is_synced, synced_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
          [
            supplier.id,
            supplier.code,
            supplier.name,
            supplier.email,
            supplier.phone,
            supplier.address,
            supplier.village,
            supplier.district,
            supplier.is_active ? 1 : 0,
            new Date().toISOString(),
            new Date().toISOString(),
          ]
        );
      }

      // Update product rates
      for (const rate of product_rates) {
        await db.runAsync(
          `INSERT OR REPLACE INTO product_rates 
          (server_id, product_id, rate, unit, effective_from, effective_to, is_current)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            rate.id,
            rate.product_id,
            rate.rate,
            rate.unit,
            rate.effective_from,
            rate.effective_to,
            rate.is_current ? 1 : 0,
          ]
        );
      }

      // Save last sync time
      await AsyncStorage.setItem('last_sync_time', sync_time);

      console.log('Pull updates completed');
    } catch (error) {
      console.error('Pull updates error:', error);
    }
  };

  const value = {
    isConnected,
    isInternetReachable,
    isSyncing,
    syncStatus,
    syncData,
    pullUpdates,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};

export default NetworkContext;
