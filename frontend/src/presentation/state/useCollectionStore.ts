/**
 * Collection Store
 * State management for collections
 */

import { create } from 'zustand';
import { Collection } from '../../domain/entities/Collection';
import { ApiCollectionRepository } from '../../infrastructure/repositories/ApiCollectionRepository';
import { OfflineCollectionRepository } from '../../infrastructure/repositories/OfflineCollectionRepository';
import { CreateCollectionUseCase, CreateCollectionDTO } from '../../application/useCases/CreateCollectionUseCase';
import { ListCollectionsUseCase } from '../../application/useCases/ListCollectionsUseCase';

interface CollectionState {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCollections: () => Promise<void>;
  createCollection: (data: CreateCollectionDTO) => Promise<void>;
  clearError: () => void;
}

// Use offline-aware repository that decorates the API repository
const apiRepository = new ApiCollectionRepository();
const collectionRepository = new OfflineCollectionRepository(apiRepository);
const createCollectionUseCase = new CreateCollectionUseCase(collectionRepository);
const listCollectionsUseCase = new ListCollectionsUseCase(collectionRepository);

export const useCollectionStore = create<CollectionState>((set) => ({
  collections: [],
  isLoading: false,
  error: null,

  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const collections = await listCollectionsUseCase.execute();
      set({ collections, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch collections',
        isLoading: false 
      });
    }
  },

  createCollection: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const collection = await createCollectionUseCase.execute(data);
      set((state) => ({ 
        collections: [...state.collections, collection],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create collection',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
