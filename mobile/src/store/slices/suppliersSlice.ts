import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Supplier } from '../../types';

interface SuppliersState {
  items: Supplier[];
  loading: boolean;
  error: string | null;
}

const initialState: SuppliersState = {
  items: [],
  loading: false,
  error: null,
};

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    setSuppliers: (state, action: PayloadAction<Supplier[]>) => {
      state.items = action.payload;
    },
    addSupplier: (state, action: PayloadAction<Supplier>) => {
      state.items.unshift(action.payload);
    },
    updateSupplier: (state, action: PayloadAction<Supplier>) => {
      const index = state.items.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteSupplier: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(s => s.id !== action.payload);
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
  setSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  setLoading,
  setError,
} = suppliersSlice.actions;

export default suppliersSlice.reducer;
