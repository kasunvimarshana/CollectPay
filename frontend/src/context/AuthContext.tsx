import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthResponse } from '../types';
import { STORAGE_KEYS } from '../constants';
import ApiService from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        setUser(JSON.parse(userData));
        // Optionally refresh user data from server
        try {
          const currentUser = await ApiService.getCurrentUser();
          setUser(currentUser);
          await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(currentUser));
        } catch (error) {
          // Token might be expired, clear storage
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await ApiService.login(email, password);
      await storeAuth(response);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      const response: AuthResponse = await ApiService.register(data);
      await storeAuth(response);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await clearAuth();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await ApiService.getCurrentUser();
      setUser(currentUser);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(currentUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  const storeAuth = async (response: AuthResponse) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
  };

  const clearAuth = async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
