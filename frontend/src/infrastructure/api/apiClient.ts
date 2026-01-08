/**
 * API Client for making HTTP requests using Axios
 * Includes offline support with automatic queueing
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  API_BASE_URL,
  API_TIMEOUT,
  TOKEN_STORAGE_KEY,
} from "../../core/constants/api";
import LocalStorageService from "../storage/LocalStorageService";

// Cache indicator constant
const CACHE_MESSAGE = "Data loaded from cache (offline)";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  conflict?: boolean;
  serverData?: any;
  fromCache?: boolean; // Flag to indicate cached data
  queued?: boolean; // Flag to indicate operation was queued for offline sync
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        // Handle 401 Unauthorized - token expired
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          // You might want to trigger a logout event here
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * POST request with offline support
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(
        endpoint,
        data,
        config
      );
      return response.data;
    } catch (error: any) {
      // Check if this is a network error and should be queued
      if (this.isNetworkError(error) && this.shouldQueueOperation(endpoint)) {
        await this.queueOperation("create", endpoint, data);
        return {
          success: true,
          message: "Operation queued for sync when online",
          data: data as T,
          queued: true, // Set flag for reliable detection
        };
      }
      return this.handleError(error);
    }
  }

  /**
   * PUT request with offline support
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(
        endpoint,
        data,
        config
      );
      return response.data;
    } catch (error: any) {
      // Check if this is a network error and should be queued
      if (this.isNetworkError(error) && this.shouldQueueOperation(endpoint)) {
        await this.queueOperation("update", endpoint, data);
        return {
          success: true,
          message: "Operation queued for sync when online",
          data: data as T,
          queued: true, // Set flag for reliable detection
        };
      }
      return this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<ApiResponse<T>>(
        endpoint,
        data,
        config
      );
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE request with offline support
   */
  async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(
        endpoint,
        config
      );
      return response.data;
    } catch (error: any) {
      // Check if this is a network error and should be queued
      if (this.isNetworkError(error) && this.shouldQueueOperation(endpoint)) {
        // Extract ID from endpoint for delete operations
        const id = this.extractIdFromEndpoint(endpoint);
        if (id !== null) {
          await this.queueOperation("delete", endpoint, { id });
          return {
            success: true,
            message: "Operation queued for sync when online",
            queued: true, // Set flag for reliable detection
          };
        }
      }
      return this.handleError(error);
    }
  }

  /**
   * Extract ID from endpoint URL
   */
  private extractIdFromEndpoint(endpoint: string): number | null {
    // Match various patterns: /entity/{id}, /entity/{id}/action, etc.
    const patterns = [
      /\/(\d+)$/, // /entity/123
      /\/(\d+)\//, // /entity/123/
      /\/(\d+)\/[^/]+$/, // /entity/123/action
    ];

    for (const pattern of patterns) {
      const match = endpoint.match(pattern);
      if (match) {
        const id = parseInt(match[1]);
        if (!isNaN(id) && id > 0) {
          return id;
        }
      }
    }

    return null;
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: any): boolean {
    // Check if there's no response from server but request was made
    if (!error.response && error.request) {
      return true;
    }

    // Check for specific network error codes
    const networkErrorCodes = [
      "NETWORK_ERROR",
      "TIMEOUT",
      "ENOTFOUND",
      "ECONNREFUSED",
      "ECONNRESET",
      "ETIMEDOUT",
    ];

    return networkErrorCodes.includes(error.code);
  }

  /**
   * Check if operation should be queued for offline support
   */
  private shouldQueueOperation(endpoint: string): boolean {
    // Queue operations for these entities
    const queueableEntities = [
      "/suppliers",
      "/products",
      "/collections",
      "/payments",
      "/rates",
    ];
    return queueableEntities.some((entity) => endpoint.includes(entity));
  }

  /**
   * Queue operation for later sync
   */
  private async queueOperation(
    action: "create" | "update" | "delete",
    endpoint: string,
    data: any
  ): Promise<void> {
    try {
      // Determine entity type from endpoint
      let entity = "";
      if (endpoint.includes("/suppliers")) entity = "supplier";
      else if (endpoint.includes("/products")) entity = "product";
      else if (endpoint.includes("/collections")) entity = "collection";
      else if (endpoint.includes("/payments")) entity = "payment";
      else if (endpoint.includes("/rates")) entity = "rate";

      if (entity) {
        await LocalStorageService.addToSyncQueue(entity, action, data);
        console.log(`Queued ${action} operation for ${entity}`);
      }
    } catch (error) {
      console.error("Failed to queue operation:", error);
    }
  }

  /**
   * Get cached data for offline mode
   */
  private async getCachedData(endpoint: string): Promise<any> {
    try {
      if (endpoint.includes("/suppliers")) {
        return await LocalStorageService.getCachedSuppliers();
      } else if (endpoint.includes("/products")) {
        return await LocalStorageService.getCachedProducts();
      } else if (endpoint.includes("/rates")) {
        // Extract product ID if present
        const match = endpoint.match(/product_id=(\d+)/);
        const productId = match ? parseInt(match[1]) : undefined;
        return await LocalStorageService.getCachedRates(productId);
      } else if (endpoint.includes("/collections")) {
        return await LocalStorageService.getCachedCollections();
      } else if (endpoint.includes("/payments")) {
        return await LocalStorageService.getCachedPayments();
      }
      return null;
    } catch (error) {
      console.error("Error getting cached data:", error);
      return null;
    }
  }

  /**
   * GET request with offline fallback
   */
  async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(
        endpoint,
        config
      );
      return response.data;
    } catch (error: any) {
      // If network error, try to get cached data
      if (this.isNetworkError(error)) {
        const cachedData = await this.getCachedData(endpoint);
        if (cachedData) {
          return {
            success: true,
            data: cachedData as T,
            message: CACHE_MESSAGE,
            fromCache: true,
          };
        }
      }
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): ApiResponse {
    if (error.response) {
      // Server responded with error status
      return (
        error.response.data || {
          success: false,
          message: error.response.statusText || "Server error",
        }
      );
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
}

export default new ApiClient();
