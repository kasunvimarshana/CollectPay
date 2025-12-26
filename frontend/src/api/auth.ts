import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'admin' | 'collector' | 'finance';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'collector' | 'finance';
  is_active: boolean;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
