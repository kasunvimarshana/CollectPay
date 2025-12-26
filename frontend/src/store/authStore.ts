import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, Device } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  device: Device | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string, device?: Device) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  device: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (user, token, device) => {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    if (device) {
      await SecureStore.setItemAsync('device', JSON.stringify(device));
    }
    set({ user, token, device, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('device');
    set({ user: null, token: null, device: null, isAuthenticated: false, isLoading: false });
  },

  loadAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userStr = await SecureStore.getItemAsync('user');
      const deviceStr = await SecureStore.getItemAsync('device');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        const device = deviceStr ? JSON.parse(deviceStr) : null;
        set({ user, token, device, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
      set({ isLoading: false });
    }
  },
}));
