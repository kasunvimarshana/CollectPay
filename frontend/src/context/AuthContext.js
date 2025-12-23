import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api';
import uuid from 'react-native-uuid';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    checkAuth();
    initDeviceId();
  }, []);

  const initDeviceId = async () => {
    let id = await AsyncStorage.getItem('device_id');
    if (!id) {
      id = uuid.v4();
      await AsyncStorage.setItem('device_id', id);
    }
    setDeviceId(id);
  };

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, deviceName = 'Mobile App') => {
    try {
      const response = await authApi.login({ email, password, device_name: deviceName });
      const { user: userData, token: authToken } = response.data;

      await AsyncStorage.setItem('auth_token', authToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (data) => {
    try {
      const deviceName = data.device_name || 'Mobile App';
      const response = await authApi.register({ ...data, device_name: deviceName });
      const { user: userData, token: authToken } = response.data;

      await AsyncStorage.setItem('auth_token', authToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (userData) => {
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    token,
    deviceId,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
