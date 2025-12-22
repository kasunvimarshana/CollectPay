import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Supplier } from "../../../domain/types";

interface SupplierState {
  items: Supplier[];
}

const initialState: SupplierState = { items: [] };

const supplierSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    upsertSupplier(state, action: PayloadAction<Supplier>) {
      const idx = state.items.findIndex((s) => s.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
      else state.items.push(action.payload);
    },
    removeSupplier(state, action: PayloadAction<string>) {
      state.items = state.items.filter((s) => s.id !== action.payload);
    },
    setSuppliers(state, action: PayloadAction<Supplier[]>) {
      state.items = action.payload;
    },
  },
});

export const { upsertSupplier, removeSupplier, setSuppliers } =
  supplierSlice.actions;
export default supplierSlice.reducer;
