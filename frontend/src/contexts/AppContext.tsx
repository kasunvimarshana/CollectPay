import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import databaseService from '../services/database';
import networkService, { NetworkStatus } from '../services/network';
import syncService, { SyncStatus, SyncResult } from '../services/sync';
import apiService from '../services/api';
import { User } from '../types';

interface AppContextType {
  isInitialized: boolean;
  user: User | null;
  networkStatus: NetworkStatus;
  syncStatus: SyncStatus;
  lastSyncResult: SyncResult | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  triggerSync: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isInternetReachable: null,
    type: null,
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    initialize();

    return () => {
      cleanup();
    };
  }, []);

  const initialize = async () => {
    try {
      // Initialize database
      await databaseService.initialize();

      // Initialize network monitoring
      networkService.initialize();
      setNetworkStatus(networkService.getStatus());

      // Subscribe to network changes
      const unsubscribeNetwork = networkService.addListener((status) => {
        setNetworkStatus(status);
      });

      // Subscribe to sync status changes
      const unsubscribeSync = syncService.addListener((status, result) => {
        setSyncStatus(status);
        if (result) {
          setLastSyncResult(result);
        }
      });

      // Enable auto-sync
      syncService.enableAutoSync(true);

      // Check if user is already logged in
      const token = await apiService.getToken();
      if (token) {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);

          // Trigger initial sync if online
          if (networkService.isOnline()) {
            syncService.sync();
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          // Token might be expired, clear it
          await apiService.clearAuth();
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsInitialized(true); // Still mark as initialized to show error state
    }
  };

  const cleanup = () => {
    networkService.cleanup();
    syncService.enableAutoSync(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const authResponse = await apiService.login(email, password);
      setUser(authResponse.user);

      // Trigger sync after successful login
      if (networkService.isOnline()) {
        await syncService.sync();
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      // Clear local database could be added here if needed
    }
  };

  const triggerSync = async () => {
    if (networkService.isOnline() && !syncService.isSyncInProgress()) {
      await syncService.sync();
    }
  };

  const value: AppContextType = {
    isInitialized,
    user,
    networkStatus,
    syncStatus,
    lastSyncResult,
    login,
    logout,
    triggerSync,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
