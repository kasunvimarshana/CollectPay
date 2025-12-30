/**
 * Authentication Store
 * State management for authentication
 */

import { create } from 'zustand';
import { User } from '../../domain/entities/User';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../config/storage.config';
import { apiClient } from '../../infrastructure/api/ApiClient';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles?: Array<{ name: string; permissions: string[] }>;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual login API call
      // For now, this is a placeholder
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      
      // Store token securely
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);
      apiClient.setAuthToken(response.token);
      
      // Create user entity
      const user = User.create(
        response.user.id,
        response.user.name,
        response.user.email,
        response.user.roles || []
      );
      
      set({ 
        user,
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.clearAuth();
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false 
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiClient.setAuthToken(token);
        // TODO: Validate token with backend
        // For now, just set authenticated
        set({ isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
