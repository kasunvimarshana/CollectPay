import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "./slices/authSlice";
import supplierReducer from "./slices/supplierSlice";
import collectionReducer from "./slices/collectionSlice";
import paymentReducer from "./slices/paymentSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  suppliers: supplierReducer,
  collections: collectionReducer,
  payments: paymentReducer,
});

const persistedReducer = persistReducer(
  { key: "root", storage: AsyncStorage },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
