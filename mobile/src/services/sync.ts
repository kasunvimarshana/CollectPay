import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { RootState } from '../store';
import { setOnlineStatus, setLastSyncTimestamp, incrementPendingSyncCount } from '../store/slices/appSlice';
import { startSync, syncSuccess, syncFailure, setConflicts } from '../store/slices/syncSlice';
import { setCollections, addCollection as addCollectionToStore } from '../store/slices/collectionsSlice';
import { setPayments, addPayment as addPaymentToStore } from '../store/slices/paymentsSlice';
import apiService from './api';

class SyncService {
  async performSync(
    deviceId: string,
    lastSyncTimestamp: string | null,
    collections: any[],
    payments: any[],
    dispatch: any
  ) {
    try {
      dispatch(startSync());

      const pendingCollections = collections.filter(c => c.sync_status === 'pending');
      const pendingPayments = payments.filter(p => p.sync_status === 'pending');

      const syncData = {
        device_id: deviceId,
        last_sync_timestamp: lastSyncTimestamp || undefined,
        collections: pendingCollections,
        payments: pendingPayments,
      };

      const result = await apiService.sync(syncData);

      if (result.success) {
        // Update local store with server data
        if (result.server_collections && result.server_collections.length > 0) {
          result.server_collections.forEach((collection: any) => {
            dispatch(addCollectionToStore(collection));
          });
        }

        if (result.server_payments && result.server_payments.length > 0) {
          result.server_payments.forEach((payment: any) => {
            dispatch(addPaymentToStore(payment));
          });
        }

        // Handle conflicts
        if (result.conflicts && result.conflicts.length > 0) {
          dispatch(setConflicts(result.conflicts));
        }

        dispatch(setLastSyncTimestamp(result.sync_timestamp));
        dispatch(syncSuccess());

        return { success: true, conflicts: result.conflicts || [] };
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (error: any) {
      dispatch(syncFailure(error.message || 'Sync failed'));
      return { success: false, error: error.message };
    }
  }
}

export const syncService = new SyncService();

export const useNetworkMonitoring = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(setOnlineStatus(state.isConnected ?? false));
    });

    return () => unsubscribe();
  }, [dispatch]);
};

export const useAutoSync = () => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: RootState) => state.app.isOnline);
  const deviceId = useSelector((state: RootState) => state.app.deviceId);
  const lastSyncTimestamp = useSelector((state: RootState) => state.app.lastSyncTimestamp);
  const collections = useSelector((state: RootState) => state.collections.items);
  const payments = useSelector((state: RootState) => state.payments.items);
  const isSyncing = useSelector((state: RootState) => state.sync.isSyncing);

  useEffect(() => {
    if (isOnline && !isSyncing && deviceId) {
      const hasPendingData = 
        collections.some(c => c.sync_status === 'pending') ||
        payments.some(p => p.sync_status === 'pending');

      if (hasPendingData) {
        syncService.performSync(deviceId, lastSyncTimestamp, collections, payments, dispatch);
      }
    }
  }, [isOnline, isSyncing, deviceId, collections, payments, lastSyncTimestamp, dispatch]);
};
