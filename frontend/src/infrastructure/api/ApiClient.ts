import axios, { AxiosInstance } from 'axios';

/**
 * API Client Configuration
 * 
 * Centralized HTTP client for API communication
 */
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear auth and redirect to login
          this.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // TODO: Implement secure token storage
    return null;
  }

  private clearAuth(): void {
    // TODO: Implement auth clearing
  }

  public get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params }).then(response => response.data);
  }

  public post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data).then(response => response.data);
  }

  public put<T>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data).then(response => response.data);
  }

  public patch<T>(url: string, data?: any): Promise<T> {
    return this.client.patch(url, data).then(response => response.data);
  }

  public delete<T>(url: string): Promise<T> {
    return this.client.delete(url).then(response => response.data);
  }
}

export const apiClient = new ApiClient();
