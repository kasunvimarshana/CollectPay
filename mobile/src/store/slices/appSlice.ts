import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../../types';
import * as Crypto from 'expo-crypto';

const generateDeviceId = async (): Promise<string> => {
  const uuid = Crypto.randomUUID();
  return uuid;
};

const initialState: AppState = {
  isOnline: true,
  lastSyncTimestamp: null,
  pendingSyncCount: 0,
  deviceId: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setLastSyncTimestamp: (state, action: PayloadAction<string>) => {
      state.lastSyncTimestamp = action.payload;
    },
    setPendingSyncCount: (state, action: PayloadAction<number>) => {
      state.pendingSyncCount = action.payload;
    },
    incrementPendingSyncCount: (state) => {
      state.pendingSyncCount += 1;
    },
    decrementPendingSyncCount: (state) => {
      if (state.pendingSyncCount > 0) {
        state.pendingSyncCount -= 1;
      }
    },
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload;
    },
  },
});

export const {
  setOnlineStatus,
  setLastSyncTimestamp,
  setPendingSyncCount,
  incrementPendingSyncCount,
  decrementPendingSyncCount,
  setDeviceId,
} = appSlice.actions;

export default appSlice.reducer;
