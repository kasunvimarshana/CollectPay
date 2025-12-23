# FieldPay Implementation Guide

## Current Status

### ✅ Completed Components

#### Backend (Laravel)
1. **Database Schema** - Complete with migrations for:
   - Users, Roles, Permissions (RBAC/ABAC)
   - Suppliers, Products, ProductRates
   - Collections, CollectionItems
   - Payments, PaymentTransactions
   - SyncLogs

2. **Models** - Fully implemented with:
   - Eloquent relationships
   - UUID generation
   - Version control
   - Soft deletes
   - Business logic (rate versioning, balance calculation)
   - Automatic transaction creation

3. **Authentication** - JWT-based with:
   - Register, Login, Logout, Refresh
   - Token management
   - User activation check

4. **API Structure** - Routes defined for:
   - Authentication endpoints
   - RESTful resources
   - Custom actions (balance, transactions, sync)

5. **Authorization** - Roles and permissions seeder ready

#### Frontend (Expo/React Native)
1. **Project Setup** - Blank Expo template initialized

## 🔧 Remaining Implementation Tasks

### Backend Tasks

#### 1. Complete API Controllers

**SupplierController.php**
```php
public function index(Request $request) {
    // Implement pagination, search, filtering
    // Support offline sync: return updated_at timestamps
}

public function store(Request $request) {
    // Validate input
    // Create supplier with creator tracking
    // Return created resource
}

public function update(Request $request, Supplier $supplier) {
    // Validate input
    // Update with version increment
    // Track updater
}

public function balance(Supplier $supplier) {
    // Return supplier with calculated balance
    // Include recent transactions
}
```

**ProductController.php**
```php
public function index() {
    // Return active products with units
    // Include current rates
}

public function store(Request $request) {
    // Validate product data
    // Handle units array
}
```

**ProductRateController.php**
```php
public function store(Request $request) {
    // Create new rate version
    // Close previous rate's valid_to
    // Return with version number
}

public function productRates(Product $product) {
    // Return all rate versions for product
    // Order by version desc
}

public function activeRate(Product $product, Request $request) {
    // Get active rate for unit and timestamp
    // Support offline: cache rate info
}
```

**CollectionController.php**
```php
public function store(Request $request) {
    // Create collection with items
    // Apply current rates automatically
    // Calculate total
    // Support offline: use device_id, client_created_at
}

public function confirm(Collection $collection) {
    // Update status to confirmed
    // Create transaction entry
    // Return updated collection
}
```

**PaymentController.php**
```php
public function store(Request $request) {
    // Create payment
    // Validate amount against balance
    // Support payment types (advance, partial, full)
}

public function confirm(Payment $payment) {
    // Mark as confirmed
    // Create credit transaction
    // Update supplier balance
}

public function transactions(Supplier $supplier) {
    // Return ledger with running balance
    // Pagination support
}
```

**SyncController.php**
```php
public function push(Request $request) {
    // Receive offline changes
    // Detect conflicts (version mismatch)
    // Apply changes or return conflicts
    // Log sync operations
}

public function pull(Request $request) {
    // Return all changes since last_sync_timestamp
    // Include deleted records
    // Filter by device_id to avoid echo
}

public function resolveConflict(Request $request) {
    // Apply conflict resolution strategy
    // Merge changes or accept one version
    // Update sync log
}

public function status(Request $request) {
    // Return sync statistics
    // Pending operations
    // Last sync timestamp
}
```

#### 2. Create Request Validation Classes
```bash
php artisan make:request StoreSupplierRequest
php artisan make:request UpdateSupplierRequest
php artisan make:request StoreProductRequest
php artisan make:request StoreProductRateRequest
php artisan make:request StoreCollectionRequest
php artisan make:request StorePaymentRequest
```

#### 3. Create API Resources (Transformers)
```bash
php artisan make:resource SupplierResource
php artisan make:resource ProductResource
php artisan make:resource ProductRateResource
php artisan make:resource CollectionResource
php artisan make:resource PaymentResource
```

#### 4. Create Service Classes
```bash
php artisan make:class Services/RateService
php artisan make:class Services/PaymentCalculationService
php artisan make:class Services/SyncService
php artisan make:class Services/ConflictResolutionService
```

#### 5. Configure Database
```bash
# Update .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fieldpay
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed roles and permissions
php artisan db:seed --class=RolesAndPermissionsSeeder
```

#### 6. Testing
```bash
# Create tests
php artisan make:test AuthenticationTest
php artisan make:test SupplierTest
php artisan make:test CollectionTest
php artisan make:test PaymentTest
php artisan make:test SyncTest

# Run tests
php artisan test
```

### Frontend Tasks

#### 1. Install Dependencies
```bash
cd frontend

# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# State Management & Storage
npm install @react-native-async-storage/async-storage
npx expo install expo-secure-store

# Database
npx expo install expo-sqlite

# Network
npx expo install @react-native-community/netinfo

# API Client
npm install axios

# Forms
npm install react-hook-form

# UI Components
npm install react-native-paper

# Icons
npx expo install @expo/vector-icons
```

#### 2. Project Structure
```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js           # Axios instance with interceptors
│   │   ├── auth.js             # Auth API calls
│   │   ├── suppliers.js        # Supplier API calls
│   │   ├── products.js         # Product API calls
│   │   ├── collections.js      # Collection API calls
│   │   ├── payments.js         # Payment API calls
│   │   └── sync.js             # Sync API calls
│   ├── components/
│   │   ├── common/             # Reusable components
│   │   ├── suppliers/          # Supplier-specific components
│   │   ├── collections/        # Collection-specific components
│   │   └── payments/           # Payment-specific components
│   ├── contexts/
│   │   ├── AuthContext.js      # Authentication state
│   │   ├── OfflineContext.js   # Offline queue & sync
│   │   ├── DataContext.js      # Cached data
│   │   └── SyncContext.js      # Sync status
│   ├── database/
│   │   ├── schema.js           # SQLite schema
│   │   ├── operations.js       # CRUD operations
│   │   └── sync.js             # Sync logic
│   ├── navigation/
│   │   ├── AppNavigator.js     # Main navigator
│   │   ├── AuthNavigator.js    # Auth screens
│   │   └── MainNavigator.js    # Authenticated screens
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.js
│   │   ├── suppliers/
│   │   │   ├── SupplierListScreen.js
│   │   │   ├── SupplierFormScreen.js
│   │   │   └── SupplierDetailScreen.js
│   │   ├── products/
│   │   │   ├── ProductListScreen.js
│   │   │   └── ProductFormScreen.js
│   │   ├── collections/
│   │   │   ├── CollectionListScreen.js
│   │   │   ├── CollectionFormScreen.js
│   │   │   └── CollectionDetailScreen.js
│   │   ├── payments/
│   │   │   ├── PaymentListScreen.js
│   │   │   ├── PaymentFormScreen.js
│   │   │   └── PaymentDetailScreen.js
│   │   └── sync/
│   │       ├── SyncStatusScreen.js
│   │       └── ConflictResolutionScreen.js
│   ├── services/
│   │   ├── storage.js          # Secure storage helpers
│   │   ├── network.js          # Network monitoring
│   │   └── sync.js             # Sync orchestration
│   ├── utils/
│   │   ├── constants.js        # App constants
│   │   ├── helpers.js          # Utility functions
│   │   └── validators.js       # Form validation
│   └── App.js                  # Root component
```

#### 3. Key Implementation Files

**src/api/client.js**
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**src/contexts/AuthContext.js**
```javascript
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { login, register, logout } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('authToken');
      const savedUser = await AsyncStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const response = await login(email, password);
    await SecureStore.setItemAsync('authToken', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const signUp = async (userData) => {
    const response = await register(userData);
    await SecureStore.setItemAsync('authToken', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const signOut = async () => {
    await logout();
    await SecureStore.deleteItemAsync('authToken');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

**src/database/schema.js**
```javascript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('fieldpay.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    // Suppliers table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone_number TEXT,
        latitude REAL,
        longitude REAL,
        address TEXT,
        metadata TEXT,
        is_active INTEGER DEFAULT 1,
        synced_at TEXT,
        device_id TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      )`
    );

    // Products table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        code TEXT,
        description TEXT,
        category TEXT,
        units TEXT,
        default_unit TEXT,
        is_active INTEGER DEFAULT 1,
        synced_at TEXT,
        device_id TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      )`
    );

    // Product rates table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS product_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        product_id INTEGER,
        unit TEXT,
        rate REAL,
        valid_from TEXT,
        valid_to TEXT,
        version INTEGER,
        is_active INTEGER DEFAULT 1,
        synced_at TEXT,
        created_at TEXT,
        updated_at TEXT
      )`
    );

    // Collections table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        collection_number TEXT,
        supplier_id INTEGER,
        collected_by INTEGER,
        collected_at TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        total_amount REAL DEFAULT 0,
        synced_at TEXT,
        device_id TEXT,
        version INTEGER DEFAULT 1,
        client_created_at TEXT,
        created_at TEXT,
        updated_at TEXT
      )`
    );

    // Collection items table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS collection_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        collection_id INTEGER,
        product_id INTEGER,
        product_rate_id INTEGER,
        quantity REAL,
        unit TEXT,
        rate REAL,
        amount REAL,
        notes TEXT,
        synced_at TEXT,
        created_at TEXT,
        updated_at TEXT
      )`
    );

    // Payments table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        payment_number TEXT,
        supplier_id INTEGER,
        collection_id INTEGER,
        type TEXT,
        amount REAL,
        payment_date TEXT,
        payment_method TEXT,
        reference_number TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        processed_by INTEGER,
        synced_at TEXT,
        device_id TEXT,
        version INTEGER DEFAULT 1,
        client_created_at TEXT,
        created_at TEXT,
        updated_at TEXT
      )`
    );

    // Sync queue table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_uuid TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TEXT,
        updated_at TEXT
      )`
    );
  });
};

export default db;
```

**src/contexts/OfflineContext.js**
```javascript
import React, { createContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncData } from '../services/sync';

export const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected && state.isInternetReachable;
      
      setIsOnline(isNowOnline);

      // Auto-sync when coming back online
      if (wasOffline && isNowOnline && pendingChanges > 0) {
        triggerSync();
      }
    });

    return () => unsubscribe();
  }, [isOnline, pendingChanges]);

  const triggerSync = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    try {
      await syncData();
      setPendingChanges(0);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addPendingChange = () => {
    setPendingChanges((prev) => prev + 1);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingChanges,
        triggerSync,
        addPendingChange,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};
```

#### 4. Testing Strategy

**Backend Testing**
```bash
# Create test database
# Run migrations on test database
# Execute tests with coverage
php artisan test --coverage
```

**Frontend Testing**
```bash
# Install testing libraries
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

### Deployment

#### Backend Deployment
1. Set up production server (Ubuntu/CentOS)
2. Install PHP 8.1+, Composer, MySQL/PostgreSQL
3. Configure Nginx/Apache
4. Set up SSL certificates
5. Configure environment variables
6. Run migrations
7. Set up queue worker
8. Configure cron for scheduled tasks

#### Frontend Deployment
1. Build APK/IPA using EAS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

2. Submit to app stores
```bash
eas submit --platform android
eas submit --platform ios
```

## Next Steps

1. **Complete Backend Controllers** - Implement remaining logic
2. **Create Validation Classes** - Input validation
3. **Build Frontend** - Screens, components, navigation
4. **Implement Sync Engine** - Offline-first functionality
5. **Test Thoroughly** - Unit, integration, E2E tests
6. **Document API** - OpenAPI/Swagger documentation
7. **Deploy** - Production deployment

## Support

For questions or issues:
- Check ARCHITECTURE.md for design decisions
- Review model implementations for business logic
- Test API endpoints with Postman/Insomnia
- Use Laravel Tinker for database queries
