import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private static token: string | null = null;

  static async setAuthToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync('auth_token', token);
  }

  static async getAuthToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await SecureStore.getItemAsync('auth_token');
    }
    return this.token;
  }

  static async clearAuthToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync('auth_token');
  }

  private static async getHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Request failed',
          errors: errorData.errors,
        };
      }
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    if (isJson) {
      const data = await response.json();
      return {
        success: true,
        data,
      };
    }

    return {
      success: true,
    };
  }

  private static handleError(error: any): ApiResponse<never> {
    console.error('API Error:', error);
    return {
      success: false,
      message: error.message || 'Network request failed',
    };
  }

  // Authentication methods
  static async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.post<{ token: string; user: any }>('/auth/login', {
      email,
      password,
    });

    if (response.success && response.data?.token) {
      await this.setAuthToken(response.data.token);
    }

    return response;
  }

  static async logout(): Promise<void> {
    await this.post('/auth/logout', {});
    await this.clearAuthToken();
  }

  static async getCurrentUser(): Promise<ApiResponse<any>> {
    return await this.get('/auth/user');
  }
}
