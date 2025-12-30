# LedgerFlow - Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing and deploying the LedgerFlow application following Clean Architecture principles.

## Table of Contents
1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)
3. [Database Setup](#database-setup)
4. [Security Configuration](#security-configuration)
5. [Testing](#testing)
6. [Deployment](#deployment)

## Backend Implementation

### 1. Install Laravel and Dependencies

```bash
cd backend
composer install
```

### 2. Configure Environment

Create `.env` file:

```env
APP_NAME=LedgerFlow
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.ledgerflow.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ledgerflow
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000,ledgerflow.com
SESSION_DRIVER=database
```

Generate application key:
```bash
php artisan key:generate
```

### 3. Create Database Migrations

```bash
php artisan make:migration create_users_table
php artisan make:migration create_suppliers_table
php artisan make:migration create_products_table
php artisan make:migration create_product_rates_table
php artisan make:migration create_collections_table
php artisan make:migration create_payments_table
php artisan make:migration create_audit_logs_table
```

Example migration for collections:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 10, 3);
            $table->string('unit', 10);
            $table->decimal('rate_applied', 10, 2);
            $table->decimal('total_value', 12, 2);
            $table->timestamp('collected_at');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['supplier_id', 'collected_at']);
            $table->index(['product_id', 'collected_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
```

Run migrations:
```bash
php artisan migrate
```

### 4. Implement Repository Pattern

Create Eloquent models that implement repository interfaces:

```php
<?php

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;

class CollectionModel extends Model
{
    protected $table = 'collections';
    
    protected $fillable = [
        'supplier_id',
        'product_id',
        'quantity',
        'unit',
        'rate_applied',
        'total_value',
        'collected_at',
        'created_by'
    ];

    protected $casts = [
        'quantity' => 'float',
        'rate_applied' => 'float',
        'total_value' => 'float',
        'collected_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(SupplierModel::class, 'supplier_id');
    }

    public function product()
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }

    public function creator()
    {
        return $this->belongsTo(UserModel::class, 'created_by');
    }
}
```

Create repository implementation:

```php
<?php

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Entities\Collection;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\CollectionModel;

class EloquentCollectionRepository implements CollectionRepositoryInterface
{
    public function findById(int $id): ?Collection
    {
        $model = CollectionModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findAll(int $page = 1, int $perPage = 15): array
    {
        $models = CollectionModel::orderBy('collected_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
            
        return [
            'data' => array_map([$this, 'toEntity'], $models->items()),
            'pagination' => [
                'current_page' => $models->currentPage(),
                'per_page' => $models->perPage(),
                'total' => $models->total(),
                'last_page' => $models->lastPage(),
            ]
        ];
    }

    public function save(Collection $collection): Collection
    {
        $data = [
            'supplier_id' => $collection->getSupplierId(),
            'product_id' => $collection->getProductId(),
            'quantity' => $collection->getQuantity(),
            'unit' => $collection->getUnit(),
            'rate_applied' => $collection->getRateApplied(),
            'total_value' => $collection->getTotalValue(),
            'collected_at' => $collection->getCollectedAt(),
            'created_by' => $collection->getCreatedBy(),
        ];

        if ($collection->getId()) {
            $model = CollectionModel::findOrFail($collection->getId());
            $model->update($data);
        } else {
            $model = CollectionModel::create($data);
        }

        return $this->toEntity($model);
    }

    private function toEntity(CollectionModel $model): Collection
    {
        return new Collection(
            $model->id,
            $model->supplier_id,
            $model->product_id,
            $model->quantity,
            $model->unit,
            $model->rate_applied,
            $model->collected_at,
            $model->created_by,
            $model->created_at,
            $model->updated_at
        );
    }
}
```

### 5. Create API Controllers

```php
<?php

namespace App\Presentation\Controllers\Api;

use App\Application\UseCases\Collection\RecordCollectionUseCase;
use App\Presentation\Requests\RecordCollectionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class CollectionController extends Controller
{
    public function __construct(
        private readonly RecordCollectionUseCase $recordCollectionUseCase
    ) {}

    public function store(RecordCollectionRequest $request): JsonResponse
    {
        try {
            $collection = $this->recordCollectionUseCase->execute(
                $request->input('supplier_id'),
                $request->input('product_id'),
                $request->input('quantity'),
                $request->input('unit'),
                auth()->id(),
                $request->has('collected_at') 
                    ? new \DateTimeImmutable($request->input('collected_at'))
                    : null
            );

            return response()->json([
                'success' => true,
                'data' => $collection->toArray(),
                'message' => 'Collection recorded successfully'
            ], 201);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'DOMAIN_ERROR',
                    'message' => $e->getMessage()
                ]
            ], 400);
        }
    }
}
```

### 6. Define Routes

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Presentation\Controllers\Api\{
    AuthController,
    UserController,
    SupplierController,
    ProductController,
    CollectionController,
    PaymentController
};

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Users
    Route::apiResource('users', UserController::class);
    
    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    
    // Products
    Route::apiResource('products', ProductController::class);
    Route::post('/products/{id}/rates', [ProductController::class, 'addRate']);
    
    // Collections
    Route::apiResource('collections', CollectionController::class);
    Route::get('/suppliers/{id}/collections', [CollectionController::class, 'bySupplier']);
    
    // Payments
    Route::apiResource('payments', PaymentController::class);
    Route::get('/suppliers/{id}/payments', [PaymentController::class, 'bySupplier']);
    Route::get('/suppliers/{id}/balance', [PaymentController::class, 'balance']);
});
```

### 7. Configure Service Container

Register dependencies in `AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domain\Repositories\{
    UserRepositoryInterface,
    CollectionRepositoryInterface,
    PaymentRepositoryInterface,
    ProductRepositoryInterface,
    SupplierRepositoryInterface
};
use App\Infrastructure\Persistence\Eloquent\Repositories\{
    EloquentUserRepository,
    EloquentCollectionRepository,
    EloquentPaymentRepository,
    EloquentProductRepository,
    EloquentSupplierRepository
};

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind repository interfaces to implementations
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(SupplierRepositoryInterface::class, EloquentSupplierRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(CollectionRepositoryInterface::class, EloquentCollectionRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, EloquentPaymentRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
```

## Frontend Implementation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure API Client

Create API client with axios:

```typescript
// src/data/datasources/ApiClient.ts
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this->client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          await SecureStore.deleteItemAsync('auth_token');
          // Navigation logic here
        }
        return Promise.reject(error);
      }
    );
  }

  get client(): AxiosInstance {
    return this.client;
  }
}

export default new ApiClient();
```

### 3. Implement Repository Pattern

```typescript
// src/data/repositories/ApiCollectionRepository.ts
import { CollectionRepository } from '@domain/repositories/CollectionRepository';
import { Collection, CreateCollectionDTO } from '@domain/entities/Collection';
import apiClient from '../datasources/ApiClient';

export class ApiCollectionRepository implements CollectionRepository {
  async getAll(page = 1, perPage = 15): Promise<Collection[]> {
    const response = await apiClient.client.get('/collections', {
      params: { page, per_page: perPage }
    });
    return response.data.data;
  }

  async create(data: CreateCollectionDTO): Promise<Collection> {
    const response = await apiClient.client.post('/collections', data);
    return response.data.data;
  }

  async getBySupplier(supplierId: number): Promise<Collection[]> {
    const response = await apiClient.client.get(`/suppliers/${supplierId}/collections`);
    return response.data.data;
  }

  // Implement other methods...
}
```

### 4. Implement Local Database (SQLite)

```typescript
// src/data/datasources/LocalDatabase.ts
import * as SQLite from 'expo-sqlite';

class LocalDatabase {
  private db: SQLite.WebSQLDatabase;

  constructor() {
    this.db = SQLite.openDatabase('ledgerflow.db');
    this.initialize();
  }

  private initialize() {
    this.db.transaction(tx => {
      // Create tables
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS collections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          supplier_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          rate_applied REAL NOT NULL,
          total_value REAL NOT NULL,
          collected_at TEXT NOT NULL,
          created_by INTEGER NOT NULL,
          synced INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);

      // Create sync queue table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entity_type TEXT NOT NULL,
          entity_id INTEGER NOT NULL,
          operation TEXT NOT NULL,
          data TEXT NOT NULL,
          retry_count INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `);
    });
  }

  // Database operations methods...
}

export default new LocalDatabase();
```

### 5. Implement Sync Service

```typescript
// src/data/services/SyncService.ts
import NetInfo from '@react-native-community/netinfo';
import localDatabase from '../datasources/LocalDatabase';
import apiClient from '../datasources/ApiClient';

class SyncService {
  private isSyncing = false;

  async sync(): Promise<void> {
    if (this.isSyncing) return;

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;

    this.isSyncing = true;

    try {
      // Get pending items from sync queue
      const pendingItems = await localDatabase.getSyncQueue();

      for (const item of pendingItems) {
        try {
          // Send to server
          await this.syncItem(item);
          
          // Remove from queue on success
          await localDatabase.removeSyncItem(item.id);
        } catch (error) {
          // Increment retry count
          await localDatabase.incrementSyncRetry(item.id);
        }
      }

      // Pull latest data from server
      await this.pullServerData();
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    const endpoint = `/${item.entity_type}`;
    const data = JSON.parse(item.data);

    switch (item.operation) {
      case 'create':
        await apiClient.client.post(endpoint, data);
        break;
      case 'update':
        await apiClient.client.put(`${endpoint}/${item.entity_id}`, data);
        break;
      case 'delete':
        await apiClient.client.delete(`${endpoint}/${item.entity_id}`);
        break;
    }
  }

  private async pullServerData(): Promise<void> {
    // Fetch latest data from server and update local database
    // Implement conflict resolution here
  }

  startAutoSync(intervalMs = 60000): void {
    setInterval(() => {
      this.sync();
    }, intervalMs);
  }
}

export default new SyncService();
```

### 6. Create UI Components

```typescript
// src/presentation/screens/CollectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { CreateCollectionDTO } from '@domain/entities/Collection';
import { ApiCollectionRepository } from '@data/repositories/ApiCollectionRepository';

export const CollectionScreen: React.FC = () => {
  const [supplierId, setSupplierId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');

  const repository = new ApiCollectionRepository();

  const handleSubmit = async () => {
    try {
      const data: CreateCollectionDTO = {
        supplierId: parseInt(supplierId),
        productId: parseInt(productId),
        quantity: parseFloat(quantity),
        unit,
      };

      await repository.create(data);
      alert('Collection recorded successfully');
    } catch (error) {
      alert('Failed to record collection');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Collection</Text>
      <TextInput
        style={styles.input}
        placeholder="Supplier ID"
        value={supplierId}
        onChangeText={setSupplierId}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Product ID"
        value={productId}
        onChangeText={setProductId}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
      />
      <Button title="Record" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
```

## Database Setup

### MySQL/PostgreSQL Configuration

1. Create database:
```sql
CREATE DATABASE ledgerflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Create database user:
```sql
CREATE USER 'ledgerflow'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ledgerflow.* TO 'ledgerflow'@'localhost';
FLUSH PRIVILEGES;
```

3. Run migrations:
```bash
php artisan migrate
```

4. Seed initial data:
```bash
php artisan db:seed
```

## Security Configuration

### 1. SSL/TLS Setup

Configure NGINX with SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name api.ledgerflow.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/ledgerflow/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 2. Environment Security

- Never commit `.env` files
- Use strong, unique passwords
- Rotate keys regularly
- Use environment-specific configurations

### 3. Rate Limiting

Configure in Laravel:

```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'api' => [
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];
```

## Testing

### Backend Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# With coverage
php artisan test --coverage
```

### Frontend Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- CollectionScreen.test.tsx
```

## Deployment

### Backend Deployment

1. Optimize for production:
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

2. Set permissions:
```bash
chmod -R 755 storage bootstrap/cache
```

3. Configure queue worker (for async jobs):
```bash
php artisan queue:work --daemon
```

### Frontend Deployment

1. Build production app:
```bash
# For Android
eas build --platform android --profile production

# For iOS
eas build --platform ios --profile production
```

2. Submit to stores:
```bash
eas submit --platform android
eas submit --platform ios
```

## Monitoring and Maintenance

### Logging

- Application logs: `storage/logs/laravel.log`
- Audit logs: Database `audit_logs` table
- Server logs: Check NGINX/Apache logs

### Backup Strategy

1. Database backups (daily):
```bash
mysqldump -u user -p ledgerflow > backup_$(date +%Y%m%d).sql
```

2. File backups:
```bash
tar -czf ledgerflow_$(date +%Y%m%d).tar.gz /var/www/ledgerflow
```

### Performance Monitoring

- Use Laravel Telescope for development
- Configure application performance monitoring (APM)
- Monitor database query performance
- Track API response times

## Conclusion

This implementation guide provides a comprehensive overview of building the LedgerFlow application following Clean Architecture principles. For detailed API documentation, refer to the OpenAPI specification file.

For support and contributions, please refer to the project repository.
