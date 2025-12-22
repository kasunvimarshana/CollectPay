import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Payment } from "../../../domain/types";

interface PaymentState {
  items: Payment[];
}

const initialState: PaymentState = { items: [] };

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    upsertPayment(state, action: PayloadAction<Payment>) {
      const idx = state.items.findIndex((s) => s.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
      else state.items.push(action.payload);
    },
    setPayments(state, action: PayloadAction<Payment[]>) {
      state.items = action.payload;
    },
  },
});

export const { upsertPayment, setPayments } = paymentSlice.actions;
export default paymentSlice.reducer;
