import { useState, useEffect } from 'react';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (token) {
        const response = await ApiClient.get<User>('/auth/user');
        if (response.success && response.data) {
          setUser(response.data);
        }
      }
    } catch (err: any) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiClient.post<{ token: string; user: User }>(
        '/auth/login',
        { email, password }
      );

      if (response.success && response.data) {
        await SecureStore.setItemAsync('auth_token', response.data.token);
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (err: any) {
      const message = err.message || 'Network error. Please try again.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await ApiClient.post('/auth/logout', {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
      setUser(null);
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'collector') => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiClient.post<{ token: string; user: User }>(
        '/auth/register',
        { name, email, password, password_confirmation: password, role }
      );

      if (response.success && response.data) {
        await SecureStore.setItemAsync('auth_token', response.data.token);
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Registration failed');
        return false;
      }
    } catch (err: any) {
      const message = err.message || 'Network error. Please try again.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };
}
