import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '../config';
import { SecureStorageService } from '../local/SecureStorageService';

export class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;
  private secureStorage: SecureStorageService;

  private constructor() {
    this.secureStorage = SecureStorageService.getInstance();
    
    this.axiosInstance = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.secureStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear auth data
          await this.secureStorage.clear();
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Auth endpoints
  public async login(email: string, password: string): Promise<any> {
    const response = await this.axiosInstance.post('/auth/login', { email, password });
    return response.data;
  }

  public async register(data: any): Promise<any> {
    const response = await this.axiosInstance.post('/auth/register', data);
    return response.data;
  }

  public async logout(): Promise<any> {
    const response = await this.axiosInstance.post('/auth/logout');
    return response.data;
  }

  public async getMe(): Promise<any> {
    const response = await this.axiosInstance.get('/auth/me');
    return response.data;
  }

  // Sync endpoints
  public async syncPush(deviceId: string, batch: any[]): Promise<any> {
    const response = await this.axiosInstance.post('/sync/push', {
      device_id: deviceId,
      batch,
    });
    return response.data;
  }

  public async syncPull(deviceId: string, lastSyncAt: string | null, entityTypes: string[]): Promise<any> {
    const response = await this.axiosInstance.post('/sync/pull', {
      device_id: deviceId,
      last_sync_at: lastSyncAt,
      entity_types: entityTypes,
    });
    return response.data;
  }

  public async sync(deviceId: string, lastSyncAt: string | null, batch: any[], entityTypes: string[]): Promise<any> {
    const response = await this.axiosInstance.post('/sync', {
      device_id: deviceId,
      last_sync_at: lastSyncAt,
      batch,
      entity_types: entityTypes,
    });
    return response.data;
  }

  public async syncStatus(deviceId: string): Promise<any> {
    const response = await this.axiosInstance.get('/sync/status', {
      params: { device_id: deviceId },
    });
    return response.data;
  }

  // Generic CRUD operations
  public async get(endpoint: string, params?: any): Promise<any> {
    const response = await this.axiosInstance.get(endpoint, { params });
    return response.data;
  }

  public async post(endpoint: string, data: any): Promise<any> {
    const response = await this.axiosInstance.post(endpoint, data);
    return response.data;
  }

  public async put(endpoint: string, data: any): Promise<any> {
    const response = await this.axiosInstance.put(endpoint, data);
    return response.data;
  }

  public async delete(endpoint: string): Promise<any> {
    const response = await this.axiosInstance.delete(endpoint);
    return response.data;
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
