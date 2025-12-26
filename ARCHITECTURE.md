# PayCore System Architecture

## Overview

PayCore follows Clean Architecture principles with clear separation of concerns, ensuring maintainability, testability, and scalability. The system is designed for multi-user, multi-device operations with a focus on data integrity and security.

## Architecture Principles

### 1. Clean Architecture
- **Independence**: Business logic independent of frameworks, UI, and external agencies
- **Testability**: Business rules can be tested without UI, database, or external elements
- **UI Independence**: UI can change without changing business rules
- **Database Independence**: Business rules not bound to specific database
- **External Agency Independence**: Business rules don't know about external interfaces

### 2. SOLID Principles
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Objects replaceable with instances of their subtypes
- **Interface Segregation**: Many specific interfaces better than one general
- **Dependency Inversion**: Depend on abstractions, not concretions

### 3. DRY (Don't Repeat Yourself)
- Reusable components and utilities
- Shared business logic in models
- Common API response structures

### 4. KISS (Keep It Simple, Stupid)
- Straightforward implementation
- Minimal complexity
- Clear naming conventions

## System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile Clients                       │
│            (React Native / Expo / TypeScript)            │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST API
                     │ JSON
                     │ Bearer Token Auth
┌────────────────────▼────────────────────────────────────┐
│                   API Gateway                            │
│              (Laravel Sanctum Auth)                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              API Controllers Layer                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ AuthController  │ SupplierController             │   │
│  │ ProductController │ CollectionController         │   │
│  │ PaymentController │ ProductRateController        │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│               Business Logic Layer                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Eloquent Models                        │   │
│  │  • User          • Supplier                      │   │
│  │  • Product       • ProductRate                   │   │
│  │  • Collection    • Payment                       │   │
│  │                                                  │   │
│  │  Business Logic:                                 │   │
│  │  - Versioned rate management                    │   │
│  │  - Automatic total calculations                 │   │
│  │  - Multi-unit conversions                       │   │
│  │  - Balance calculations                         │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│               Data Access Layer                          │
│              (Eloquent ORM)                              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Database                                │
│            (MySQL / PostgreSQL)                          │
│                                                          │
│  Tables: users, suppliers, products, product_rates,     │
│          collections, payments, sessions, cache         │
└──────────────────────────────────────────────────────────┘
```

## Backend Architecture (Laravel)

### Layer Structure

#### 1. Presentation Layer (Controllers)
- **Location**: `app/Http/Controllers/API/`
- **Responsibility**: Handle HTTP requests, validate input, return responses
- **Components**:
  - `AuthController`: Authentication endpoints
  - `SupplierController`: Supplier CRUD operations
  - `ProductController`: Product management
  - `ProductRateController`: Rate versioning
  - `CollectionController`: Collection tracking
  - `PaymentController`: Payment management

#### 2. Business Logic Layer (Models)
- **Location**: `app/Models/`
- **Responsibility**: Domain logic, calculations, relationships
- **Key Models**:
  ```
  User
  ├── HasApiTokens (Sanctum)
  ├── SoftDeletes
  └── Relationships: suppliers, collections, payments
  
  Supplier
  ├── SoftDeletes
  ├── Methods: getTotalCollectionsAmount(), getBalanceAmount()
  └── Relationships: creator, collections, payments
  
  Product
  ├── SoftDeletes
  ├── Methods: getCurrentRate()
  └── Relationships: rates, collections
  
  ProductRate
  ├── SoftDeletes
  ├── Methods: isEffectiveOn()
  └── Versioned rate management
  
  Collection
  ├── SoftDeletes
  ├── Auto-calculation of totals
  └── Automatic rate application
  
  Payment
  ├── SoftDeletes
  └── Payment tracking and reconciliation
  ```

#### 3. Data Access Layer
- **Eloquent ORM**: Database abstraction
- **Query Builder**: Complex queries
- **Migrations**: Version-controlled schema

### Database Design

#### Schema Principles
- **Normalization**: Third Normal Form (3NF)
- **Foreign Keys**: Referential integrity
- **Indexes**: Performance optimization
- **Soft Deletes**: Data preservation
- **Timestamps**: Audit trail

#### Entity Relationships
```
User ─────┬─────> Supplier (created_by)
          ├─────> Product (created_by)
          ├─────> ProductRate (created_by)
          ├─────> Collection (collected_by)
          └─────> Payment (created_by)

Supplier ─┬─────> Collection (supplier_id)
          └─────> Payment (supplier_id)

Product ──┬─────> ProductRate (product_id)
          └─────> Collection (product_id)

ProductRate ────> Collection (product_rate_id, optional)
```

### Authentication & Authorization

#### Laravel Sanctum
```
Client                    API Server
  │                           │
  ├─ POST /api/login ────────>│
  │                           ├─ Validate credentials
  │                           ├─ Generate token
  │<──── Token ───────────────┤
  │                           │
  ├─ GET /api/suppliers ─────>│
  │  (Bearer Token)           ├─ Validate token
  │                           ├─ Check permissions
  │<──── Data ────────────────┤
```

#### Role-Based Access Control (RBAC)
- **Admin**: Full system access
- **Manager**: Read all, manage reports
- **Collector**: Create collections, view own data

## Frontend Architecture (React Native)

### Layer Structure

#### 1. Presentation Layer (Screens)
- **Location**: `src/screens/`
- **Responsibility**: UI components, user interactions
- **Structure**:
  ```
  screens/
  ├── Auth/
  │   ├── LoginScreen.tsx
  │   └── RegisterScreen.tsx
  ├── Home/
  │   └── HomeScreen.tsx
  ├── Suppliers/
  │   ├── SuppliersListScreen.tsx
  │   └── SupplierDetailScreen.tsx
  ├── Products/
  │   └── ProductsListScreen.tsx
  ├── Collections/
  │   ├── CollectionsListScreen.tsx
  │   └── CollectionFormScreen.tsx
  └── Payments/
      ├── PaymentsListScreen.tsx
      └── PaymentFormScreen.tsx
  ```

#### 2. Navigation Layer
- **React Navigation**: Screen management
- **Stack Navigator**: Main flow
- **Tab Navigator**: Bottom tabs for quick access
- **Authentication Flow**: Conditional rendering based on auth state

#### 3. State Management Layer
- **Context API**: Global state (Auth)
- **Local State**: Component-specific state
- **Secure Storage**: Persistent authentication tokens

#### 4. Business Logic Layer
- **Services**: API communication
- **Utils**: Helper functions
- **Constants**: Configuration values

### Data Flow

```
User Action
    ↓
Screen Component
    ↓
API Service (axios)
    ↓
Backend API
    ↓
Database
    ↓
Backend API (Response)
    ↓
API Service
    ↓
Context/State Update
    ↓
UI Re-render
```

## Security Architecture

### 1. Authentication
- **Token-Based**: Bearer tokens via Laravel Sanctum
- **Secure Storage**: Expo SecureStore (encrypted)
- **Token Rotation**: On login/logout
- **Expiration Handling**: Auto-logout on 401

### 2. Authorization
- **Role Checking**: Server-side role validation
- **Route Protection**: Middleware guards
- **UI Conditional**: Role-based UI elements

### 3. Data Protection
- **HTTPS Only**: All API communication encrypted
- **SQL Injection**: Eloquent ORM prepared statements
- **XSS Protection**: Input sanitization
- **CSRF**: Laravel CSRF tokens
- **Password Hashing**: Bcrypt algorithm

### 4. API Security
- **Rate Limiting**: Throttle requests per IP/user
- **Input Validation**: Request validation rules
- **Output Sanitization**: Response filtering
- **Error Handling**: No sensitive data in errors

## Data Integrity

### 1. Transactional Operations
```php
DB::transaction(function () {
    // Multiple database operations
    // All or nothing
});
```

### 2. Optimistic Locking
- Timestamp-based conflict detection
- Version number tracking
- Last-write-wins with user notification

### 3. Soft Deletes
- Historical data preservation
- Audit trail maintenance
- Recoverable deletions

### 4. Automated Calculations
```php
// Collection model automatically:
// 1. Fetches current rate
// 2. Calculates total amount
// 3. Links to product rate

protected static function boot() {
    static::creating(function ($collection) {
        $rate = Product::find($collection->product_id)
            ->getCurrentRate($collection->unit);
        $collection->rate_applied = $rate->rate;
        $collection->total_amount = 
            $collection->quantity * $rate->rate;
    });
}
```

## Performance Optimization

### Backend
- **Query Optimization**: Eager loading relationships
- **Caching**: Config, route, view caching
- **Indexing**: Database indexes on foreign keys
- **Connection Pooling**: Persistent connections

### Frontend
- **Pagination**: Load data in chunks
- **Lazy Loading**: Load screens on demand
- **Memoization**: Cache computed values
- **Image Optimization**: Compressed assets

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Easy to replicate servers
- **Load Balancer**: Distribute traffic
- **Shared Storage**: Centralized file storage
- **Database Replication**: Read replicas

### Vertical Scaling
- **Cache Layer**: Redis for session/cache
- **Queue System**: Background jobs
- **CDN**: Static asset delivery
- **Database Optimization**: Indexes, partitioning

## Error Handling

### Backend
```php
try {
    // Operation
} catch (Exception $e) {
    Log::error($e->getMessage());
    return response()->json([
        'message' => 'Operation failed'
    ], 500);
}
```

### Frontend
```typescript
try {
    await ApiService.createCollection(data);
} catch (error) {
    Alert.alert('Error', error.response?.data?.message);
}
```

## Testing Strategy

### Backend
- **Unit Tests**: Model logic
- **Feature Tests**: API endpoints
- **Integration Tests**: Full workflows

### Frontend
- **Component Tests**: UI components
- **Integration Tests**: Screen flows
- **E2E Tests**: Complete user journeys

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              Load Balancer                  │
│             (SSL Termination)               │
└──────────────────┬──────────────────────────┘
                   │
      ┌────────────┴────────────┐
      │                         │
┌─────▼──────┐          ┌──────▼──────┐
│  App       │          │  App        │
│  Server 1  │          │  Server 2   │
│  (Laravel) │          │  (Laravel)  │
└─────┬──────┘          └──────┬──────┘
      │                         │
      └────────────┬────────────┘
                   │
           ┌───────▼────────┐
           │  Database      │
           │  (MySQL)       │
           │  + Replication │
           └────────────────┘
```

## Monitoring & Logging

### Application Logs
- Laravel Log: `/storage/logs/laravel.log`
- Database Queries: Query log
- API Access: Access logs

### Metrics
- Response times
- Error rates
- Database performance
- Active users

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-25  
**Maintained By**: PayCore Development Team
