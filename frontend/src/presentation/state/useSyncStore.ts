/**
 * Sync State Store
 * Manages offline sync queue state using Zustand
 * Following Clean Architecture - Presentation Layer
 */

import { create } from 'zustand';
import { NetworkState } from '../../domain/valueObjects/NetworkState';
import { SyncOperation } from '../../domain/entities/SyncOperation';
import { networkMonitor } from '../../infrastructure/network/NetworkMonitoringService';
import { LocalSyncQueueRepository } from '../../infrastructure/repositories/LocalSyncQueueRepository';
import { ProcessSyncQueueUseCase, SyncResult } from '../../application/useCases/ProcessSyncQueueUseCase';

interface SyncState {
  // State
  networkState: NetworkState;
  isSyncing: boolean;
  pendingOperations: SyncOperation[];
  lastSyncResult: SyncResult | null;
  error: string | null;

  // Actions
  initialize: () => void;
  sync: () => Promise<void>;
  getQueueSize: () => Promise<number>;
  clearError: () => void;
}

const syncQueueRepository = new LocalSyncQueueRepository();
const processSyncQueueUseCase = new ProcessSyncQueueUseCase(syncQueueRepository);

export const useSyncStore = create<SyncState>((set, get) => ({
  // Initial state
  networkState: NetworkState.offline(),
  isSyncing: false,
  pendingOperations: [],
  lastSyncResult: null,
  error: null,

  // Initialize network monitoring
  initialize: () => {
    // Get initial network state
    const currentState = networkMonitor.getCurrentState();
    set({ networkState: currentState });

    // Listen for network changes
    networkMonitor.addListener((newState) => {
      set({ networkState: newState });

      // Auto-sync when coming back online
      if (newState.canSync() && !get().isSyncing) {
        get().sync().catch(console.error);
      }
    });

    // Load pending operations
    syncQueueRepository.getPendingOperations().then((operations) => {
      set({ pendingOperations: operations });
    }).catch((error) => {
      console.error('Failed to load pending operations:', error);
      set({ error: 'Failed to initialize sync queue' });
    });
  },

  // Sync pending operations
  sync: async () => {
    const state = get();

    if (!state.networkState.canSync()) {
      set({ error: 'Cannot sync - no network connection' });
      return;
    }

    if (state.isSyncing) {
      return; // Already syncing
    }

    set({ isSyncing: true, error: null });

    try {
      const result = await processSyncQueueUseCase.execute(state.networkState);
      
      // Reload pending operations
      const operations = await syncQueueRepository.getPendingOperations();
      
      set({
        isSyncing: false,
        lastSyncResult: result,
        pendingOperations: operations,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      set({
        isSyncing: false,
        error: errorMessage,
      });
    }
  },

  // Get queue size
  getQueueSize: async () => {
    return await syncQueueRepository.getQueueSize();
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
