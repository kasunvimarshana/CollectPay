// Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-production';

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    timeout: 30000,
  },
  sync: {
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000,
  },
  security: {
    encryptionKey: ENCRYPTION_KEY,
  },
  storage: {
    dbName: 'collectpay.db',
  },
};
