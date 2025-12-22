import { create } from "zustand";
import { syncService } from "@/services/sync";

interface SyncState {
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingSyncCount: number;
  error: string | null;

  // Actions
  sync: () => Promise<void>;
  updateSyncStatus: () => Promise<void>;
  clearError: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  lastSyncTime: null,
  pendingSyncCount: 0,
  error: null,

  sync: async () => {
    set({ isSyncing: true, error: null });

    try {
      const result = await syncService.sync();

      if (result.success) {
        const lastSyncTime = await syncService.getLastSyncTime();
        const pendingSyncCount = await syncService.getPendingSyncCount();

        set({
          isSyncing: false,
          lastSyncTime,
          pendingSyncCount,
        });
      } else {
        set({
          isSyncing: false,
          error: "Sync failed",
        });
      }
    } catch (error: any) {
      set({
        isSyncing: false,
        error: error.message || "An error occurred during sync",
      });
    }
  },

  updateSyncStatus: async () => {
    try {
      const lastSyncTime = await syncService.getLastSyncTime();
      const pendingSyncCount = await syncService.getPendingSyncCount();

      set({
        lastSyncTime,
        pendingSyncCount,
      });
    } catch (error) {
      console.error("Error updating sync status:", error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
