/**
 * useNetworkStatus Hook
 * Monitors network connectivity and provides sync status
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import SyncService from '../services/SyncService';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  canSync: boolean;
}

export interface SyncStatus {
  isSyncing: boolean;
  hasPendingChanges: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isInternetReachable: null,
    type: null,
    canSync: false,
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    hasPendingChanges: false,
    lastSyncTime: null,
    syncError: null,
  });

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const canSync = state.isConnected === true && state.isInternetReachable === true;
      
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        canSync,
      });

      // Auto-sync when connection is restored
      if (canSync && !syncStatus.isSyncing) {
        checkAndSync();
      }
    });

    // Initial check
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        canSync: state.isConnected === true && state.isInternetReachable === true,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Check for pending changes and sync if necessary
   */
  const checkAndSync = async () => {
    try {
      const hasPending = await SyncService.hasPendingChanges();
      setSyncStatus(prev => ({ ...prev, hasPendingChanges: hasPending }));

      if (hasPending && networkStatus.canSync) {
        await performSync();
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  };

  /**
   * Perform full synchronization
   */
  const performSync = async (): Promise<{ success: boolean; message: string }> => {
    if (!networkStatus.canSync) {
      return {
        success: false,
        message: 'No internet connection',
      };
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const result = await SyncService.fullSync();
      
      setSyncStatus({
        isSyncing: false,
        hasPendingChanges: false,
        lastSyncTime: new Date(),
        syncError: result.success ? null : result.message,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Sync failed';
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  /**
   * Manually trigger sync
   */
  const sync = async () => {
    return await performSync();
  };

  /**
   * Clear sync error
   */
  const clearSyncError = () => {
    setSyncStatus(prev => ({ ...prev, syncError: null }));
  };

  /**
   * Get sync status message for UI
   */
  const getSyncStatusMessage = (): string => {
    if (syncStatus.isSyncing) {
      return 'Syncing...';
    }
    
    if (syncStatus.syncError) {
      return `Sync error: ${syncStatus.syncError}`;
    }
    
    if (syncStatus.hasPendingChanges) {
      return `${networkStatus.canSync ? 'Ready to sync' : 'Offline - pending sync'}`;
    }
    
    if (syncStatus.lastSyncTime) {
      const minutes = Math.floor((Date.now() - syncStatus.lastSyncTime.getTime()) / 60000);
      if (minutes < 1) return 'Just synced';
      if (minutes < 60) return `Synced ${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `Synced ${hours}h ago`;
    }
    
    return 'Not synced yet';
  };

  /**
   * Get status icon name (valid Ionicons name)
   */
  const getStatusIcon = (): 'sync' | 'alert-circle' | 'cloud-upload' | 'cloud-offline' | 'cloud-done' => {
    if (syncStatus.isSyncing) return 'sync';
    if (syncStatus.syncError) return 'alert-circle';
    if (syncStatus.hasPendingChanges) return 'cloud-upload';
    if (!networkStatus.canSync) return 'cloud-offline';
    return 'cloud-done';
  };

  return {
    networkStatus,
    syncStatus,
    sync,
    clearSyncError,
    getSyncStatusMessage,
    getStatusIcon,
  };
};
