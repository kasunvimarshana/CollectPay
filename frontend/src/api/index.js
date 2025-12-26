import apiClient from './client';

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/user');
    return response.data;
  },
};

export const supplierAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/suppliers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  },
};

export const productAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  addRate: async (id, data) => {
    const response = await apiClient.post(`/products/${id}/rates`, data);
    return response.data;
  },
};

export const collectionAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/collections', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/collections/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/collections', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/collections/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/collections/${id}`);
    return response.data;
  },
};

export const paymentAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/payments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/payments', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/payments/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/payments/${id}`);
    return response.data;
  },
};
