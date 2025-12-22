import { create } from "zustand";
import { apiService } from "@/services/api";
import { socketService } from "@/services/socket";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "@/config/constants";
import { User, AuthToken } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.login(email, password);

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Store token securely
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(user)
        );

        // Connect socket with authentication
        socketService.connect(token);

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      set({
        error: error.message || "An error occurred during login",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      // Call logout API
      await apiService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear stored data regardless of API call result
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

      // Disconnect socket
      socketService.disconnect();

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiService.refreshToken();

      if (response.success && response.data) {
        const { token } = response.data;

        // Update stored token
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);

        set({ token });
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout user
      get().logout();
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });

    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const userJson = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

      if (token && userJson) {
        const user = JSON.parse(userJson);

        // Verify token is still valid
        const response = await apiService.me();

        if (response.success && response.data) {
          // Token is valid, update user data
          const freshUser = response.data;

          await SecureStore.setItemAsync(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify(freshUser)
          );

          // Connect socket
          socketService.connect(token);

          set({
            user: freshUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Token is invalid, clear stored data
          await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      set({ isLoading: false });
    }
  },

  setUser: (user: User) => {
    set({ user });
    // Update stored user data
    SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  clearError: () => {
    set({ error: null });
  },
}));
