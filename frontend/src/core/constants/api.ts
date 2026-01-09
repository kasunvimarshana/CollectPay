/**
 * API Configuration Constants
 */

// Base URL for the API - change this to your backend URL
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  LOGOUT: "/logout",
  REFRESH: "/refresh",
  ME: "/me",

  // Users
  USERS: "/users",

  // Roles
  ROLES: "/roles",

  // Suppliers
  SUPPLIERS: "/suppliers",
  SUPPLIER_BALANCE: (id: number) => `/suppliers/${id}/balance`,
  SUPPLIER_COLLECTIONS: (id: number) => `/suppliers/${id}/collections`,
  SUPPLIER_PAYMENTS: (id: number) => `/suppliers/${id}/payments`,

  // Products
  PRODUCTS: "/products",
  PRODUCT_CURRENT_RATE: (id: number) => `/products/${id}/current-rate`,
  PRODUCT_RATE_HISTORY: (id: number) => `/products/${id}/rate-history`,

  // Rates
  RATES: "/rates",

  // Collections
  COLLECTIONS: "/collections",

  // Payments
  PAYMENTS: "/payments",
};

// API Request Timeout
export const API_TIMEOUT = 30000; // 30 seconds

// Token Storage Keys
export const TOKEN_STORAGE_KEY = "@app_token";
export const TOKEN_EXPIRY_STORAGE_KEY = "@app_token_expiry";
export const USER_STORAGE_KEY = "@app_user";
