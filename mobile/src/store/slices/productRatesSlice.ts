import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductRate } from '../../types';

interface ProductRatesState {
  items: ProductRate[];
  loading: boolean;
  error: string | null;
  selectedProductId: number | null;
}

const initialState: ProductRatesState = {
  items: [],
  loading: false,
  error: null,
  selectedProductId: null,
};

const productRatesSlice = createSlice({
  name: 'productRates',
  initialState,
  reducers: {
    setProductRates: (state, action: PayloadAction<ProductRate[]>) => {
      state.items = action.payload;
    },
    addProductRate: (state, action: PayloadAction<ProductRate>) => {
      state.items.unshift(action.payload);
    },
    updateProductRate: (state, action: PayloadAction<ProductRate>) => {
      const index = state.items.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteProductRate: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(r => r.id !== action.payload);
    },
    setSelectedProductId: (state, action: PayloadAction<number | null>) => {
      state.selectedProductId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearProductRates: (state) => {
      state.items = [];
      state.selectedProductId = null;
    },
  },
});

export const {
  setProductRates,
  addProductRate,
  updateProductRate,
  deleteProductRate,
  setSelectedProductId,
  setLoading,
  setError,
  clearProductRates,
} = productRatesSlice.actions;

export default productRatesSlice.reducer;
