/**
 * API Client
 * Handles all HTTP communication with the backend
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG, getApiUrl } from '../../config/api.config';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../config/storage.config';

export class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.authToken) {
          this.authToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        }

        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear auth and redirect to login
          await this.clearAuth();
          // Emit event for logout
          // TODO: Implement event system
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  public async clearAuth(): Promise<void> {
    this.authToken = null;
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  }

  public async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(getApiUrl(endpoint), config);
    return response.data;
  }

  public async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(getApiUrl(endpoint), data, config);
    return response.data;
  }

  public async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(getApiUrl(endpoint), data, config);
    return response.data;
  }

  public async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(getApiUrl(endpoint), config);
    return response.data;
  }

  private formatError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.message || error.message;
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message);
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();
