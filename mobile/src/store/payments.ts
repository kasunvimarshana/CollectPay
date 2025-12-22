import { create } from "zustand";
import { apiService } from "@/services/api";
import { database } from "@/services/database";
import { syncService } from "@/services/sync";
import { socketService } from "@/services/socket";
import { Payment } from "@/types";

interface PaymentsState {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  selectedSupplierId: string | null;

  // Actions
  fetchPayments: (supplierId?: string, forceRefresh?: boolean) => Promise<void>;
  getPaymentById: (id: string) => Payment | undefined;
  createPayment: (
    payment: Omit<Payment, "id" | "createdAt" | "updatedAt" | "status">
  ) => Promise<Payment>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  confirmPayment: (id: string) => Promise<void>;
  cancelPayment: (id: string, reason: string) => Promise<void>;
  setSelectedSupplier: (supplierId: string | null) => void;
  clearError: () => void;
}

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  payments: [],
  isLoading: false,
  error: null,
  selectedSupplierId: null,

  fetchPayments: async (supplierId?: string, forceRefresh = false) => {
    set({ isLoading: true, error: null });

    try {
      // Try to fetch from API first
      if (apiService.getConnectionStatus() && forceRefresh) {
        const response = supplierId
          ? await apiService.getPaymentsBySupplier(supplierId)
          : await apiService.getAllPayments();

        if (response.success && response.data) {
          const payments = response.data;

          // Save to local database
          for (const payment of payments) {
            await database.savePayment(payment);
          }

          set({ payments, isLoading: false });
          return;
        }
      }

      // Fallback to local database
      const payments = supplierId
        ? await database.getPaymentsBySupplier(supplierId)
        : await database.getAllPayments();

      set({ payments, isLoading: false });
    } catch (error: any) {
      console.error("Error fetching payments:", error);

      // Try to load from local database as fallback
      try {
        const payments = supplierId
          ? await database.getPaymentsBySupplier(supplierId)
          : await database.getAllPayments();

        set({ payments, isLoading: false });
      } catch (dbError) {
        set({
          error: error.message || "Failed to fetch payments",
          isLoading: false,
        });
      }
    }
  },

  getPaymentById: (id: string) => {
    const { payments } = get();
    return payments.find((p) => p.id === id);
  },

  createPayment: async (paymentData) => {
    set({ isLoading: true, error: null });

    try {
      // Create locally first
      const localPayment: Payment = {
        ...paymentData,
        id: `temp-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to local database
      await database.savePayment(localPayment);

      // Update state
      set((state) => ({
        payments: [...state.payments, localPayment],
        isLoading: false,
      }));

      // Try to sync with server
      if (apiService.getConnectionStatus()) {
        try {
          const response = await apiService.createPayment(paymentData);

          if (response.success && response.data) {
            const serverPayment = response.data;

            // Update local database with server version
            await database.savePayment(serverPayment);

            // Update state with server version
            set((state) => ({
              payments: state.payments.map((p) =>
                p.id === localPayment.id ? serverPayment : p
              ),
            }));

            // Emit socket event
            socketService.emitPaymentCreated(serverPayment);

            return serverPayment;
          }
        } catch (error) {
          console.error("Failed to create payment on server:", error);
          // Queue for sync
          await syncService.queueForSync("payment", "create", localPayment);
        }
      } else {
        // Offline - queue for sync
        await syncService.queueForSync("payment", "create", localPayment);
      }

      return localPayment;
    } catch (error: any) {
      set({
        error: error.message || "Failed to create payment",
        isLoading: false,
      });
      throw error;
    }
  },

  updatePayment: async (id: string, updates: Partial<Payment>) => {
    set({ isLoading: true, error: null });

    try {
      const payment = get().getPaymentById(id);

      if (!payment) {
        throw new Error("Payment not found");
      }

      const updatedPayment: Payment = {
        ...payment,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update local database
      await database.savePayment(updatedPayment);

      // Update state
      set((state) => ({
        payments: state.payments.map((p) => (p.id === id ? updatedPayment : p)),
        isLoading: false,
      }));

      // Try to sync with server
      if (apiService.getConnectionStatus()) {
        try {
          await apiService.updatePayment(id, updates);
        } catch (error) {
          console.error("Failed to update payment on server:", error);
          // Queue for sync
          await syncService.queueForSync("payment", "update", updatedPayment);
        }
      } else {
        // Offline - queue for sync
        await syncService.queueForSync("payment", "update", updatedPayment);
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to update payment",
        isLoading: false,
      });
      throw error;
    }
  },

  deletePayment: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      // Try to delete from server first
      if (apiService.getConnectionStatus()) {
        try {
          await apiService.deletePayment(id);
        } catch (error) {
          console.error("Failed to delete payment on server:", error);
          // Queue for sync
          await syncService.queueForSync("payment", "delete", { id });
        }
      } else {
        // Offline - queue for sync
        await syncService.queueForSync("payment", "delete", { id });
      }

      // Remove from state
      set((state) => ({
        payments: state.payments.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete payment",
        isLoading: false,
      });
      throw error;
    }
  },

  confirmPayment: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      if (!apiService.getConnectionStatus()) {
        throw new Error("Cannot confirm payment while offline");
      }

      const response = await apiService.confirmPayment(id);

      if (response.success && response.data) {
        const confirmedPayment = response.data;

        // Update local database
        await database.savePayment(confirmedPayment);

        // Update state
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? confirmedPayment : p
          ),
          isLoading: false,
        }));
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to confirm payment",
        isLoading: false,
      });
      throw error;
    }
  },

  cancelPayment: async (id: string, reason: string) => {
    set({ isLoading: true, error: null });

    try {
      if (!apiService.getConnectionStatus()) {
        throw new Error("Cannot cancel payment while offline");
      }

      const response = await apiService.cancelPayment(id, reason);

      if (response.success && response.data) {
        const cancelledPayment = response.data;

        // Update local database
        await database.savePayment(cancelledPayment);

        // Update state
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? cancelledPayment : p
          ),
          isLoading: false,
        }));
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to cancel payment",
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
socketService.addEventListener("payment:new", (payment: Payment) => {
  usePaymentsStore.setState((state) => ({
    payments: [...state.payments, payment],
  }));
});

socketService.addEventListener("payment:confirmed", (payment: Payment) => {
  usePaymentsStore.setState((state) => ({
    payments: state.payments.map((p) => (p.id === payment.id ? payment : p)),
  }));
});

socketService.addEventListener("payment:cancelled", (payment: Payment) => {
  usePaymentsStore.setState((state) => ({
    payments: state.payments.map((p) => (p.id === payment.id ? payment : p)),
  }));
});
