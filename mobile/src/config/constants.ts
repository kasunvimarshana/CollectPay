export const API_CONFIG = {
  BASE_URL: __DEV__ ? "http://localhost:8000" : "https://api.paymate.com",
  API_VERSION: "v1",
  TIMEOUT: 30000,
};

export const SOCKET_CONFIG = {
  URL: __DEV__ ? "http://localhost:3000" : "https://socket.paymate.com",
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 3000,
};

export const SYNC_CONFIG = {
  SYNC_INTERVAL: 300000, // 5 minutes
  BATCH_SIZE: 100,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "@paymate:auth_token",
  USER_DATA: "@paymate:user_data",
  SYNC_QUEUE: "@paymate:sync_queue",
  LAST_SYNC: "@paymate:last_sync",
  OFFLINE_DATA: "@paymate:offline_data",
};

export const PERMISSIONS = {
  LOCATION: {
    ios: "NSLocationWhenInUseUsageDescription",
    android: "ACCESS_FINE_LOCATION",
  },
};
