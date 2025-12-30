import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiClient from '../../infrastructure/api/ApiClient';
import { User, AuthState, LoginCredentials, RegisterData } from '../../shared/types';
import { STORAGE_KEYS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constants';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          loading: false,
          error: null,
        });
        
        // Optionally refresh user data from server
        try {
          await refreshUser();
        } catch (error) {
          // Ignore error, user data from storage is fine
        }
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await ApiClient.login(credentials.email, credentials.password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || ERROR_MESSAGES.AUTH_ERROR);
      }
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.AUTH_ERROR;
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await ApiClient.register(data);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ApiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    }
  };

  const refreshToken = async () => {
    try {
      const response = await ApiClient.refresh();
      
      if (response.success && response.data) {
        const { token } = response.data;
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        
        setAuthState((prev) => ({
          ...prev,
          token,
        }));
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
    }
  };

  const refreshUser = async () => {
    try {
      const response = await ApiClient.me();
      
      if (response.success && response.data) {
        const { user } = response.data;
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        setAuthState((prev) => ({
          ...prev,
          user,
        }));
      }
    } catch (error) {
      console.error('User refresh error:', error);
      throw error;
    }
  };

  const updateUser = (user: User) => {
    AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    setAuthState((prev) => ({ ...prev, user }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
