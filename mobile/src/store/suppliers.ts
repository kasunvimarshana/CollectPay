import { create } from "zustand";
import { apiService } from "@/services/api";
import { database } from "@/services/database";
import { syncService } from "@/services/sync";
import { socketService } from "@/services/socket";
import { Supplier } from "@/types";

interface SuppliersState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

  // Actions
  fetchSuppliers: (forceRefresh?: boolean) => Promise<void>;
  getSupplierById: (id: string) => Supplier | undefined;
  createSupplier: (
    supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => Promise<Supplier>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  searchSuppliers: (query: string) => void;
  clearError: () => void;
}

export const useSuppliersStore = create<SuppliersState>((set, get) => ({
  suppliers: [],
  isLoading: false,
  error: null,
  searchQuery: "",

  fetchSuppliers: async (forceRefresh = false) => {
    set({ isLoading: true, error: null });

    try {
      // Try to fetch from API first
      if (apiService.getConnectionStatus() && forceRefresh) {
        const response = await apiService.getAllSuppliers();

        if (response.success && response.data) {
          const suppliers = response.data;

          // Save to local database
          for (const supplier of suppliers) {
            await database.saveSupplier(supplier);
          }

          set({ suppliers, isLoading: false });
          return;
        }
      }

      // Fallback to local database
      const suppliers = await database.getAllSuppliers();
      set({ suppliers, isLoading: false });
    } catch (error: any) {
      console.error("Error fetching suppliers:", error);

      // Try to load from local database as fallback
      try {
        const suppliers = await database.getAllSuppliers();
        set({ suppliers, isLoading: false });
      } catch (dbError) {
        set({
          error: error.message || "Failed to fetch suppliers",
          isLoading: false,
        });
      }
    }
  },

  getSupplierById: (id: string) => {
    const { suppliers } = get();
    return suppliers.find((s) => s.id === id);
  },

  createSupplier: async (supplierData) => {
    set({ isLoading: true, error: null });

    try {
      // Create locally first
      const localSupplier: Supplier = {
        ...supplierData,
        id: `temp-${Date.now()}`, // Temporary ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to local database
      await database.saveSupplier(localSupplier);

      // Update state
      set((state) => ({
        suppliers: [...state.suppliers, localSupplier],
        isLoading: false,
      }));

      // Try to sync with server
      if (apiService.getConnectionStatus()) {
        try {
          const response = await apiService.createSupplier(supplierData);

          if (response.success && response.data) {
            const serverSupplier = response.data;

            // Update local database with server ID
            await database.saveSupplier(serverSupplier);

            // Update state with server version
            set((state) => ({
              suppliers: state.suppliers.map((s) =>
                s.id === localSupplier.id ? serverSupplier : s
              ),
            }));

            return serverSupplier;
          }
        } catch (error) {
          console.error("Failed to create supplier on server:", error);
          // Queue for sync
          await syncService.queueForSync("supplier", "create", localSupplier);
        }
      } else {
        // Offline - queue for sync
        await syncService.queueForSync("supplier", "create", localSupplier);
      }

      return localSupplier;
    } catch (error: any) {
      set({
        error: error.message || "Failed to create supplier",
        isLoading: false,
      });
      throw error;
    }
  },

  updateSupplier: async (id: string, updates: Partial<Supplier>) => {
    set({ isLoading: true, error: null });

    try {
      const supplier = get().getSupplierById(id);

      if (!supplier) {
        throw new Error("Supplier not found");
      }

      const updatedSupplier: Supplier = {
        ...supplier,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update local database
      await database.saveSupplier(updatedSupplier);

      // Update state
      set((state) => ({
        suppliers: state.suppliers.map((s) =>
          s.id === id ? updatedSupplier : s
        ),
        isLoading: false,
      }));

      // Try to sync with server
      if (apiService.getConnectionStatus()) {
        try {
          await apiService.updateSupplier(id, updates);
        } catch (error) {
          console.error("Failed to update supplier on server:", error);
          // Queue for sync
          await syncService.queueForSync("supplier", "update", updatedSupplier);
        }
      } else {
        // Offline - queue for sync
        await syncService.queueForSync("supplier", "update", updatedSupplier);
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to update supplier",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSupplier: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      // Try to delete from server first
      if (apiService.getConnectionStatus()) {
        try {
          await apiService.deleteSupplier(id);
        } catch (error) {
          console.error("Failed to delete supplier on server:", error);
          // Queue for sync
          await syncService.queueForSync("supplier", "delete", { id });
        }
      } else {
        // Offline - queue for sync
        await syncService.queueForSync("supplier", "delete", { id });
      }

      // Remove from local database
      // Note: Implement deleteSupplier method in database service

      // Update state
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete supplier",
        isLoading: false,
      });
      throw error;
    }
  },

  searchSuppliers: (query: string) => {
    set({ searchQuery: query });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Setup socket listeners for real-time updates
socketService.addEventListener("supplier:new", (supplier: Supplier) => {
  useSuppliersStore.setState((state) => ({
    suppliers: [...state.suppliers, supplier],
  }));
});

socketService.addEventListener("supplier:updated", (supplier: Supplier) => {
  useSuppliersStore.setState((state) => ({
    suppliers: state.suppliers.map((s) =>
      s.id === supplier.id ? supplier : s
    ),
  }));
});

socketService.addEventListener("supplier:deleted", (data: { id: string }) => {
  useSuppliersStore.setState((state) => ({
    suppliers: state.suppliers.filter((s) => s.id !== data.id),
  }));
});
