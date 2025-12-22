import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Collection } from "../../../domain/types";

interface CollectionState {
  items: Collection[];
}

const initialState: CollectionState = { items: [] };

const collectionSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    upsertCollection(state, action: PayloadAction<Collection>) {
      const idx = state.items.findIndex((s) => s.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
      else state.items.push(action.payload);
    },
    setCollections(state, action: PayloadAction<Collection[]>) {
      state.items = action.payload;
    },
  },
});

export const { upsertCollection, setCollections } = collectionSlice.actions;
export default collectionSlice.reducer;
