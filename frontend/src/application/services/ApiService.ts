import { User, Supplier, Product, Collection, Payment } from '../../domain/entities';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }
  }

  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    name: string,
    email: string,
    password: string,
    roles?: string[]
  ): Promise<ApiResponse<User>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, roles }),
    });
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.request<null>('/auth/logout', {
      method: 'POST',
    });
    this.token = null;
    return response;
  }

  // Suppliers
  async getSuppliers(limit = 100, offset = 0): Promise<ApiResponse<Supplier[]>> {
    return this.request(`/suppliers?limit=${limit}&offset=${offset}`);
  }

  async getSupplier(id: string): Promise<ApiResponse<Supplier>> {
    return this.request(`/suppliers/${id}`);
  }

  async createSupplier(data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSupplier(id: string): Promise<ApiResponse<null>> {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts(limit = 100, offset = 0): Promise<ApiResponse<Product[]>> {
    return this.request(`/products?limit=${limit}&offset=${offset}`);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Collections
  async getCollections(limit = 100, offset = 0): Promise<ApiResponse<Collection[]>> {
    return this.request(`/collections?limit=${limit}&offset=${offset}`);
  }

  async getCollection(id: string): Promise<ApiResponse<Collection>> {
    return this.request(`/collections/${id}`);
  }

  async getCollectionsBySupplier(supplierId: string): Promise<ApiResponse<Collection[]>> {
    return this.request(`/collections/supplier/${supplierId}`);
  }

  async createCollection(data: Partial<Collection>): Promise<ApiResponse<Collection>> {
    return this.request('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollection(id: string, data: Partial<Collection>): Promise<ApiResponse<Collection>> {
    return this.request(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCollection(id: string): Promise<ApiResponse<null>> {
    return this.request(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments
  async getPayments(limit = 100, offset = 0): Promise<ApiResponse<Payment[]>> {
    return this.request(`/payments?limit=${limit}&offset=${offset}`);
  }

  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    return this.request(`/payments/${id}`);
  }

  async getPaymentsBySupplier(supplierId: string): Promise<ApiResponse<Payment[]>> {
    return this.request(`/payments/supplier/${supplierId}`);
  }

  async createPayment(data: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: string): Promise<ApiResponse<null>> {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
