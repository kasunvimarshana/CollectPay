import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SyncService, { SyncStatus, SyncResult } from '../../infrastructure/sync/SyncService';
import DatabaseService from '../../infrastructure/storage/DatabaseService';

interface SyncContextType {
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  isOnline: boolean;
  performSync: () => Promise<SyncResult>;
  initializeOfflineStorage: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle' });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Initialize database and sync service
    const init = async () => {
      try {
        await DatabaseService.init();
        await SyncService.init();
        setInitialized(true);

        // Add sync status listener
        SyncService.addListener((status) => {
          setSyncStatus(status);
          if (status.status === 'completed') {
            setLastSyncTime(new Date());
          }
        });

        // Check online status
        const online = await SyncService.isOnline();
        setIsOnline(online);

        // Perform initial sync if online
        if (online) {
          await performSync();
        }
      } catch (error) {
        console.error('Failed to initialize sync:', error);
      }
    };

    init();

    return () => {
      // Cleanup
      DatabaseService.close();
    };
  }, []);

  const performSync = async (): Promise<SyncResult> => {
    try {
      const result = await SyncService.performSync();
      if (result.success) {
        setLastSyncTime(new Date());
      }
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const initializeOfflineStorage = async (): Promise<void> => {
    if (!initialized) {
      await DatabaseService.init();
      setInitialized(true);
    }
  };

  const value: SyncContextType = {
    syncStatus,
    lastSyncTime,
    isOnline,
    performSync,
    initializeOfflineStorage,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
