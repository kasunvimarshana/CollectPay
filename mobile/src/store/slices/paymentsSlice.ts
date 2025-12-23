import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Payment } from '../../types';

interface PaymentsState {
  items: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  items: [],
  loading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.items = action.payload;
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.items.unshift(action.payload);
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deletePayment: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    markAsSynced: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex(p => p.id === action.payload);
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
  setPayments,
  addPayment,
  updatePayment,
  deletePayment,
  markAsSynced,
  setLoading,
  setError,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
