/**
 * Supplier Store
 * State management for suppliers using Zustand
 * Enhanced with offline support
 */

import { create } from 'zustand';
import { Supplier } from '../../domain/entities/Supplier';
import { ApiSupplierRepository } from '../../infrastructure/repositories/ApiSupplierRepository';
import { OfflineSupplierRepository } from '../../infrastructure/repositories/OfflineSupplierRepository';
import { CreateSupplierUseCase } from '../../application/useCases/CreateSupplierUseCase';
import { ListSuppliersUseCase } from '../../application/useCases/ListSuppliersUseCase';

interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: { name: string; code: string; address: string; phone: string; email: string }) => Promise<void>;
  clearError: () => void;
}

// Use offline-aware repository that decorates the API repository
const apiRepository = new ApiSupplierRepository();
const supplierRepository = new OfflineSupplierRepository(apiRepository);
const listSuppliersUseCase = new ListSuppliersUseCase(supplierRepository);
const createSupplierUseCase = new CreateSupplierUseCase(supplierRepository);

export const useSupplierStore = create<SupplierState>((set) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const suppliers = await listSuppliersUseCase.execute();
      set({ suppliers, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch suppliers',
        isLoading: false 
      });
    }
  },

  createSupplier: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const supplier = await createSupplierUseCase.execute(data);
      set((state) => ({ 
        suppliers: [...state.suppliers, supplier],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create supplier',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
