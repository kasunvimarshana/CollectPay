import { create } from "zustand";
import { apiService } from "@/services/api";
import { database } from "@/services/database";
import { syncService } from "@/services/sync";
import { socketService } from "@/services/socket";
import { Collection } from "@/types";

interface CollectionsState {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  selectedSupplierId: string | null;

  // Actions
  fetchCollections: (
    supplierId?: string,
    forceRefresh?: boolean
  ) => Promise<void>;
  getCollectionById: (id: string) => Collection | undefined;
  createCollection: (
    collection: Omit<Collection, "id" | "createdAt" | "updatedAt" | "status">
  ) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  approveCollection: (id: string) => Promise<void>;
  rejectCollection: (id: string, reason: string) => Promise<void>;
  setSelectedSupplier: (supplierId: string | null) => void;
  clearError: () => void;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  isLoading: false,
  error: null,
  selectedSupplierId: null,

  fetchCollections: async (supplierId?: string, forceRefresh = false) => {
    set({ isLoading: true, error: null });

    try {
      // Try to fetch from API first
      if (apiService.getConnectionStatus() && forceRefresh) {
        const response = supplierId
          ? await apiService.getCollectionsBySupplier(supplierId)
          : await apiService.getAllCollections();

        if (response.success && response.data) {
          const collections = response.data;

          // Save to local database
          for (const collection of collections) {
            await database.saveCollection(collection);
          }

          set({ collections, isLoading: false });
          return;
        }
      }

      // Fallback to local database
      const collections = supplierId
        ? await database.getCollectionsBySupplier(supplierId)
        : await database.getAllCollections();

      set({ collections, isLoading: false });
    } catch (error: any) {
      console.error("Error fetching collections:", error);

      // Try to load from local database as fallback
      try {
        const collections = supplierId
          ? await database.getCollectionsBySupplier(supplierId)
          : await database.getAllCollections();

        set({ collections, isLoading: false });
      } catch (dbError) {
        set({
          error: error.message || "Failed to fetch collections",
          isLoading: false,
        });
      }
    }
  },

  getCollectionById: (id: string) => {
    const { collections } = get();
    return collections.find((c) => c.id === id);
  },

  createCollection: async (collectionData) => {
    set({ isLoading: true, error: null });

    try {
      // Create locally first
      const localCollection: Collection = {
        ...collectionData,
        id: `temp-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to local database
      await database.saveCollection(localCollection);

      // Update state
      set((state) => ({
        collections: [...state.collections, localCollection],
        isLoading: false,
      }));

      // Try to sync with server
      if (apiService.getConnectionStatus()) {
        try {
          const response = await apiService.createCollection(collectionData);

          if (response.success && response.data) {
            const serverCollection = response.data;

            // Update local database with server version
            await database.saveCollection(serverCollection);

            // Update state with server version
            set((state) => ({
              collections: state.collections.map((c) =>
                c.id === localCollection.id ? serverCollection : c
              ),
            }));

            // Emit socket event
            socketService.emitCollectionCreated(serverCollection);

            return serverCollection;
          }
        } catch (error) {
          console.error("Failed to create collection on server:", error);
          // Queue for sync
          await syncService.queueForSync(
            "collection",
            "create",
            localCollection
          );
        }
      } else {
        // Offline - queue for sync
        await syncService.queueForSync("collection", "create", localCollection);
      }

      return localCollection;
    } catch (error: any) {
      set({
        error: error.message || "Failed to create collection",
        isLoading: false,
      });
      throw error;
    }
  },

  updateCollection: async (id: string, updates: Partial<Collection>) => {
    set({ isLoading: true, error: null });

    try {
      const collection = get().getCollectionById(id);

      if (!collection) {
        throw new Error("Collection not found");
      }

      const updatedCollection: Collection = {
        ...collection,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update local database
      await database.saveCollection(updatedCollection);

      // Update state
      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === id ? updatedCollection : c
        ),
        isLoading: false,
      }));

      // Try to sync with server
      if (apiService.getConnectionStatus()) {
        try {
          await apiService.updateCollection(id, updates);
          socketService.emitCollectionUpdated(updatedCollection);
        } catch (error) {
          console.error("Failed to update collection on server:", error);
          // Queue for sync
          await syncService.queueForSync(
            "collection",
            "update",
            updatedCollection
          );
        }
      } else {
        // Offline - queue for sync
        await syncService.queueForSync(
          "collection",
          "update",
          updatedCollection
        );
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to update collection",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCollection: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      // Try to delete from server first
      if (apiService.getConnectionStatus()) {
        try {
          await apiService.deleteCollection(id);
        } catch (error) {
          console.error("Failed to delete collection on server:", error);
          // Queue for sync
          await syncService.queueForSync("collection", "delete", { id });
        }
      } else {
        // Offline - queue for sync
        await syncService.queueForSync("collection", "delete", { id });
      }

      // Remove from state
      set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete collection",
        isLoading: false,
      });
      throw error;
    }
  },

  approveCollection: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      if (!apiService.getConnectionStatus()) {
        throw new Error("Cannot approve collection while offline");
      }

      const response = await apiService.approveCollection(id);

      if (response.success && response.data) {
        const approvedCollection = response.data;

        // Update local database
        await database.saveCollection(approvedCollection);

        // Update state
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? approvedCollection : c
          ),
          isLoading: false,
        }));
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to approve collection",
        isLoading: false,
      });
      throw error;
    }
  },

  rejectCollection: async (id: string, reason: string) => {
    set({ isLoading: true, error: null });

    try {
      if (!apiService.getConnectionStatus()) {
        throw new Error("Cannot reject collection while offline");
      }

      const response = await apiService.rejectCollection(id, reason);

      if (response.success && response.data) {
        const rejectedCollection = response.data;

        // Update local database
        await database.saveCollection(rejectedCollection);

        // Update state
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? rejectedCollection : c
          ),
          isLoading: false,
        }));
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to reject collection",
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedSupplier: (supplierId: string | null) => {
    set({ selectedSupplierId: supplierId });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Setup socket listeners for real-time updates
socketService.addEventListener("collection:new", (collection: Collection) => {
  useCollectionsStore.setState((state) => ({
    collections: [...state.collections, collection],
  }));
});

socketService.addEventListener(
  "collection:update",
  (collection: Collection) => {
    useCollectionsStore.setState((state) => ({
      collections: state.collections.map((c) =>
        c.id === collection.id ? collection : c
      ),
    }));
  }
);

socketService.addEventListener(
  "collection:approved",
  (collection: Collection) => {
    useCollectionsStore.setState((state) => ({
      collections: state.collections.map((c) =>
        c.id === collection.id ? collection : c
      ),
    }));
  }
);

socketService.addEventListener(
  "collection:rejected",
  (collection: Collection) => {
    useCollectionsStore.setState((state) => ({
      collections: state.collections.map((c) =>
        c.id === collection.id ? collection : c
      ),
    }));
  }
);
