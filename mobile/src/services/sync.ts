import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { RootState } from '../store';
import { setOnlineStatus, setLastSyncTimestamp, incrementPendingSyncCount } from '../store/slices/appSlice';
import { startSync, syncSuccess, syncFailure, setConflicts } from '../store/slices/syncSlice';
import { setCollections, addCollection as addCollectionToStore, updateCollection } from '../store/slices/collectionsSlice';
import { setPayments, addPayment as addPaymentToStore, updatePayment } from '../store/slices/paymentsSlice';
import { setProducts } from '../store/slices/productsSlice';
import { setSuppliers } from '../store/slices/suppliersSlice';
import apiService from './api';
import { dataValidator } from '../utils/validator';
import { errorHandler } from '../utils/errorHandler';

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

      // Filter pending items
      const pendingCollections = collections.filter(c => c.sync_status === 'pending');
      const pendingPayments = payments.filter(p => p.sync_status === 'pending');

      // Validate data before sync
      const validCollections = pendingCollections.filter(collection => {
        const validation = dataValidator.validateCollection(collection);
        if (!validation.valid) {
          errorHandler.logError(validation.errors, 'Collection validation');
          return false;
        }
        return true;
      });

      const validPayments = pendingPayments.filter(payment => {
        const validation = dataValidator.validatePayment(payment);
        if (!validation.valid) {
          errorHandler.logError(validation.errors, 'Payment validation');
          return false;
        }
        return true;
      });

      const syncData = {
        device_id: deviceId,
        last_sync_timestamp: lastSyncTimestamp || undefined,
        collections: validCollections,
        payments: validPayments,
      };

      const result = await apiService.sync(syncData);

      if (result.success) {
        // Mark synced items
        validCollections.forEach(collection => {
          dispatch(updateCollection({
            id: collection.id,
            changes: { sync_status: 'synced' }
          }));
        });

        validPayments.forEach(payment => {
          dispatch(updatePayment({
            id: payment.id,
            changes: { sync_status: 'synced' }
          }));
        });

        // Fetch updated products with current rates
        try {
          const productsResponse = await apiService.getProducts();
          if (productsResponse.data) {
            dispatch(setProducts(productsResponse.data));
          }
        } catch (error) {
          errorHandler.logError(error, 'Fetch products during sync');
        }

        // Fetch updated suppliers
        try {
          const suppliersResponse = await apiService.getSuppliers();
          if (suppliersResponse.data) {
            dispatch(setSuppliers(suppliersResponse.data));
          }
        } catch (error) {
          errorHandler.logError(error, 'Fetch suppliers during sync');
        }

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

        return { 
          success: true, 
          conflicts: result.conflicts || [],
          syncedCollections: validCollections.length,
          syncedPayments: validPayments.length,
        };
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (error: any) {
      errorHandler.logError(error, 'Sync');
      const appError = errorHandler.parseApiError(error);
      dispatch(syncFailure(appError.message));
      return { success: false, error: appError.message };
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
