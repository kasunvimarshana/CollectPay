/**
 * Product Store
 * State management for products using Zustand
 * Enhanced with offline support
 */

import { create } from 'zustand';
import { Product } from '../../domain/entities/Product';
import { ApiProductRepository } from '../../infrastructure/repositories/ApiProductRepository';
import { OfflineProductRepository } from '../../infrastructure/repositories/OfflineProductRepository';
import { CreateProductUseCase } from '../../application/useCases/CreateProductUseCase';
import { ListProductsUseCase } from '../../application/useCases/ListProductsUseCase';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: () => Promise<void>;
  createProduct: (data: { name: string; code: string; defaultUnit: string; description: string }) => Promise<void>;
  clearError: () => void;
}

// Use offline-aware repository that decorates the API repository
const apiRepository = new ApiProductRepository();
const productRepository = new OfflineProductRepository(apiRepository);
const listProductsUseCase = new ListProductsUseCase(productRepository);
const createProductUseCase = new CreateProductUseCase(productRepository);

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await listProductsUseCase.execute();
      set({ products, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        isLoading: false 
      });
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const product = await createProductUseCase.execute(data);
      set((state) => ({ 
        products: [...state.products, product],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create product',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
