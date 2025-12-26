import { useEffect, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncOfflineOperations, getSyncQueueCount } from '../utils/syncManager';

/**
 * Hook to automatically sync when network is restored
 */
export function useAutoSync(onSyncComplete?: (successful: number, failed: number, conflicts: number) => void) {
  const { isConnected } = useNetworkStatus();
  const wasOffline = useRef(false);
  const isSyncing = useRef(false);

  useEffect(() => {
    const handleNetworkChange = async () => {
      // Network just came back online and we have pending operations
      if (isConnected && wasOffline.current && !isSyncing.current) {
        const queueCount = await getSyncQueueCount();
        
        if (queueCount > 0) {
          console.log('Network restored, starting auto-sync...');
          isSyncing.current = true;
          
          try {
            await syncOfflineOperations(
              undefined, // No progress callback for auto-sync
              (successful, failed, conflicts) => {
                isSyncing.current = false;
                console.log(`Auto-sync complete: ${successful} success, ${failed} failed, ${conflicts} conflicts`);
                onSyncComplete?.(successful, failed, conflicts);
              }
            );
          } catch (error) {
            isSyncing.current = false;
            console.error('Auto-sync error:', error);
          }
        }
      }

      // Track offline state
      wasOffline.current = !isConnected;
    };

    handleNetworkChange();
  }, [isConnected, onSyncComplete]);
}
