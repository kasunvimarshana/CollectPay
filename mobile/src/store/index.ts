import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import suppliersReducer from './slices/suppliersSlice';
import productsReducer from './slices/productsSlice';
import collectionsReducer from './slices/collectionsSlice';
import paymentsReducer from './slices/paymentsSlice';
import syncReducer from './slices/syncSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'app', 'suppliers', 'products', 'collections', 'payments'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  suppliers: suppliersReducer,
  products: productsReducer,
  collections: collectionsReducer,
  payments: paymentsReducer,
  sync: syncReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
