import { useState, useEffect } from 'react';
import { SyncService, SyncState } from '../../infrastructure/sync/SyncService';

export function useSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSyncTime: null,
    pendingCount: 0,
    error: null,
  });

  useEffect(() => {
    const syncService = SyncService.getInstance();
    
    // Subscribe to sync state changes
    const unsubscribe = syncService.subscribe((state) => {
      setSyncState(state);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const triggerSync = async () => {
    const syncService = SyncService.getInstance();
    await syncService.sync();
  };

  const getPendingCount = async () => {
    const syncService = SyncService.getInstance();
    return await syncService.getPendingCount();
  };

  return {
    syncState,
    triggerSync,
    getPendingCount,
    isSyncing: syncState.status === 'syncing',
    lastSyncTime: syncState.lastSyncTime,
    pendingCount: syncState.pendingCount,
    syncError: syncState.error,
  };
}
