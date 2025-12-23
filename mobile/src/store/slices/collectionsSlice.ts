import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Collection } from '../../types';

interface CollectionsState {
  items: Collection[];
  loading: boolean;
  error: string | null;
}

const initialState: CollectionsState = {
  items: [],
  loading: false,
  error: null,
};

const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    setCollections: (state, action: PayloadAction<Collection[]>) => {
      state.items = action.payload;
    },
    addCollection: (state, action: PayloadAction<Collection>) => {
      state.items.unshift(action.payload);
    },
    updateCollection: (state, action: PayloadAction<Collection>) => {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCollection: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(c => c.id !== action.payload);
    },
    markAsSynced: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.items[index].sync_status = 'synced';
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCollections,
  addCollection,
  updateCollection,
  deleteCollection,
  markAsSynced,
  setLoading,
  setError,
} = collectionsSlice.actions;

export default collectionsSlice.reducer;
