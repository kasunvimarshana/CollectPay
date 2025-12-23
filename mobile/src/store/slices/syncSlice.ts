import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SyncConflict } from '../../types';

interface SyncState {
  isSyncing: boolean;
  conflicts: SyncConflict[];
  lastError: string | null;
}

const initialState: SyncState = {
  isSyncing: false,
  conflicts: [],
  lastError: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    startSync: (state) => {
      state.isSyncing = true;
      state.lastError = null;
    },
    syncSuccess: (state) => {
      state.isSyncing = false;
    },
    syncFailure: (state, action: PayloadAction<string>) => {
      state.isSyncing = false;
      state.lastError = action.payload;
    },
    setConflicts: (state, action: PayloadAction<SyncConflict[]>) => {
      state.conflicts = action.payload;
    },
    resolveConflict: (state, action: PayloadAction<number>) => {
      state.conflicts = state.conflicts.filter(c => c.id !== action.payload);
    },
  },
});

export const {
  startSync,
  syncSuccess,
  syncFailure,
  setConflicts,
  resolveConflict,
} = syncSlice.actions;

export default syncSlice.reducer;
