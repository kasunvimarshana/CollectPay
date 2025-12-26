import apiClient from './apiClient';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  },

  async register(name, email, password, password_confirmation) {
    const response = await apiClient.post('/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/logout');
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/user');
    return response.data;
  },
};

export const supplierService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/suppliers', { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  },

  async getBalance(id, startDate, endDate) {
    const response = await apiClient.get(`/suppliers/${id}/balance`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
};

export const productService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  async getCurrentRates(id, date) {
    const response = await apiClient.get(`/products/${id}/current-rates`, {
      params: { date },
    });
    return response.data;
  },

  async addRate(id, data) {
    const response = await apiClient.post(`/products/${id}/rates`, data);
    return response.data;
  },
};

export const collectionService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/collections', { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/collections/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/collections', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/collections/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/collections/${id}`);
    return response.data;
  },
};

export const paymentService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/payments', { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/payments', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/payments/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/payments/${id}`);
    return response.data;
  },

  async approve(id) {
    const response = await apiClient.post(`/payments/${id}/approve`);
    return response.data;
  },
};
