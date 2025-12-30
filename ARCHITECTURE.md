# LedgerFlow - System Architecture

## Overview
LedgerFlow is a production-ready data collection and payment management application built with Clean Architecture principles, ensuring maintainability, scalability, and testability.

## Architecture Principles

### Clean Architecture
The system follows Uncle Bob's Clean Architecture with clear separation of concerns:

1. **Domain Layer (Entities)** - Core business logic, independent of frameworks
2. **Application Layer (Use Cases)** - Application-specific business rules
3. **Infrastructure Layer** - External concerns (DB, APIs, frameworks)
4. **Presentation Layer** - UI and controllers

### SOLID Principles
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for their base types
- **Interface Segregation**: Many specific interfaces over one general interface
- **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)
- Shared logic is extracted into reusable services
- Common patterns are abstracted into base classes/utilities

### KISS (Keep It Simple, Stupid)
- Solutions are as simple as possible
- Complexity is minimized at every level

## System Components

### Backend (Laravel)

#### Directory Structure
```
backend/
├── src/
│   ├── Domain/                 # Business entities and logic
│   │   ├── Entities/          # Core business objects
│   │   ├── ValueObjects/      # Immutable value types
│   │   ├── Repositories/      # Repository interfaces
│   │   └── Services/          # Domain services
│   ├── Application/           # Application business rules
│   │   ├── UseCases/         # Use case implementations
│   │   ├── DTOs/             # Data Transfer Objects
│   │   └── Interfaces/       # Application interfaces
│   ├── Infrastructure/        # Framework and external concerns
│   │   ├── Persistence/      # Database implementations
│   │   ├── Security/         # Auth, encryption
│   │   └── Logging/          # Audit trails
│   └── Presentation/         # API controllers
│       ├── Controllers/
│       ├── Middleware/
│       ├── Requests/
│       └── Resources/
├── config/                   # Configuration files
├── database/                 # Migrations and seeders
│   ├── migrations/
│   └── seeders/
├── tests/                    # Automated tests
│   ├── Unit/
│   ├── Integration/
│   └── Feature/
└── public/                   # Public assets
```

#### Core Domain Entities

1. **User**
   - Attributes: id, name, email, password, role, permissions
   - Capabilities: Authentication, authorization (RBAC/ABAC)

2. **Supplier**
   - Attributes: id, name, contact, address, metadata
   - Capabilities: Supplier profile management

3. **Product**
   - Attributes: id, name, unit, rates (versioned)
   - Capabilities: Rate versioning, multi-unit support

4. **Collection**
   - Attributes: id, supplier_id, product_id, quantity, unit, rate_snapshot, timestamp
   - Capabilities: Multi-unit tracking, historical data preservation

5. **Payment**
   - Attributes: id, supplier_id, amount, type (advance/partial/final), timestamp
   - Capabilities: Payment tracking, automated calculation

#### Key Use Cases

1. **User Management**
   - CreateUser, UpdateUser, DeleteUser, AuthenticateUser
   - AssignRole, GrantPermission

2. **Supplier Management**
   - CreateSupplier, UpdateSupplier, DeleteSupplier, ListSuppliers

3. **Product Management**
   - CreateProduct, UpdateProduct, DeleteProduct, ListProducts
   - UpdateProductRate (creates new version)

4. **Collection Management**
   - RecordCollection (with rate snapshot)
   - ListCollections, GetCollectionsBySupplier
   - CalculateTotalCollections

5. **Payment Management**
   - RecordPayment
   - CalculatePaymentDue
   - ListPayments, GetPaymentsBySupplier

#### Security Implementation

1. **Authentication**
   - JWT/Laravel Sanctum tokens
   - Secure password hashing (bcrypt/argon2)
   - Token refresh mechanism

2. **Authorization**
   - RBAC: Role-based permissions (Admin, Manager, Collector)
   - ABAC: Attribute-based policies
   - Middleware for route protection

3. **Data Encryption**
   - Encryption at rest: Encrypted database columns
   - Encryption in transit: HTTPS/TLS
   - Secure key management

4. **Audit Trail**
   - Immutable log of all changes
   - User actions tracking
   - Timestamp and IP logging

#### Database Schema

```sql
-- Users table
users (id, name, email, password, role, created_at, updated_at)

-- Suppliers table
suppliers (id, name, contact, address, metadata, created_at, updated_at)

-- Products table
products (id, name, unit, current_rate, created_at, updated_at)

-- Product rates (versioning)
product_rates (id, product_id, rate, unit, effective_from, effective_to, created_at)

-- Collections table
collections (id, supplier_id, product_id, quantity, unit, rate_applied, total_value, collected_at, created_by, created_at, updated_at)

-- Payments table
payments (id, supplier_id, amount, payment_type, notes, paid_at, created_by, created_at, updated_at)

-- Audit logs table
audit_logs (id, user_id, entity_type, entity_id, action, old_value, new_value, ip_address, created_at)
```

### Frontend (React Native - Expo)

#### Directory Structure
```
frontend/
├── src/
│   ├── domain/                # Business logic
│   │   ├── entities/         # Business entities
│   │   ├── repositories/     # Repository interfaces
│   │   └── usecases/        # Use case implementations
│   ├── data/                 # Data layer
│   │   ├── repositories/    # Repository implementations
│   │   ├── datasources/     # API and local DB
│   │   └── models/          # Data models
│   ├── presentation/         # UI layer
│   │   ├── screens/         # Screen components
│   │   ├── components/      # Reusable UI components
│   │   ├── navigation/      # Navigation config
│   │   └── state/           # State management
│   └── core/                # Core utilities
│       ├── config/          # App configuration
│       ├── constants/       # Constants
│       └── utils/           # Helper functions
├── assets/                   # Images, fonts
└── __tests__/               # Tests
```

#### State Management
- **Context API** for global state
- **Zustand** for complex state (if needed)
- Separation of UI state from business state

#### Offline Support

1. **Local Database**
   - SQLite for local persistence
   - Schema mirrors backend structure
   - Encrypted storage (SQLCipher)

2. **Sync Strategy**
   - Queue-based sync system
   - Conflict detection (timestamp-based)
   - Automatic retry with exponential backoff
   - Last-write-wins with server authority

3. **Sync Process**
   ```
   1. Detect connectivity
   2. Fetch pending local changes
   3. Send to server with conflict markers
   4. Server validates and resolves conflicts
   5. Fetch server updates
   6. Merge with local data
   7. Mark sync complete
   ```

#### Security
- Secure token storage (expo-secure-store)
- Encrypted local database
- Certificate pinning for API calls
- Biometric authentication (optional)

## Multi-User Concurrency Strategy

### Backend Approach
1. **Optimistic Locking**
   - Version numbers on entities
   - Check version before update
   - Return conflict if mismatch

2. **Transaction Isolation**
   - Database transactions for consistency
   - Row-level locking for updates

3. **Conflict Resolution**
   - Last-write-wins (server timestamp authority)
   - Merge non-conflicting changes
   - Flag conflicts for manual review if needed

### Frontend Approach
1. **Timestamp Tracking**
   - Track local modification time
   - Compare with server time on sync

2. **Conflict Markers**
   - Flag locally modified, unsynced records
   - Prevent editing during sync

3. **User Notification**
   - Alert on conflicts
   - Provide resolution options

## Data Integrity Guarantees

1. **No Duplication**
   - Unique constraints on critical fields
   - Idempotent API operations
   - Sync tokens to prevent double submission

2. **No Corruption**
   - Input validation at all layers
   - Schema validation
   - Transaction rollback on error

3. **Consistency**
   - Referential integrity in database
   - Cascade operations
   - Orphan prevention

4. **Auditability**
   - Immutable audit logs
   - Complete change history
   - User action tracking

## Multi-Unit Support

### Implementation
1. **Base Unit Storage**
   - Store all quantities in base unit (e.g., grams)
   - Convert for display

2. **Unit Conversion**
   - Centralized conversion service
   - Support kg, g, lb, oz, etc.
   - Precision handling

3. **Rate Management**
   - Rates per unit type
   - Version tracking
   - Historical preservation

## Payment Calculation Logic

```
Total Due = Σ(Collections) - Σ(Payments)

Where:
- Collections = Quantity × Rate (at time of collection)
- Payments = Sum of all advance, partial, and final payments
- Rates are snapshotted at collection time for historical accuracy
```

## API Design

### RESTful Endpoints

#### Authentication
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh

#### Users
- GET /api/users
- POST /api/users
- GET /api/users/{id}
- PUT /api/users/{id}
- DELETE /api/users/{id}

#### Suppliers
- GET /api/suppliers
- POST /api/suppliers
- GET /api/suppliers/{id}
- PUT /api/suppliers/{id}
- DELETE /api/suppliers/{id}

#### Products
- GET /api/products
- POST /api/products
- GET /api/products/{id}
- PUT /api/products/{id}
- DELETE /api/products/{id}
- POST /api/products/{id}/rates (create new rate version)
- GET /api/products/{id}/rates (get rate history)

#### Collections
- GET /api/collections
- POST /api/collections
- GET /api/collections/{id}
- PUT /api/collections/{id}
- DELETE /api/collections/{id}
- GET /api/suppliers/{id}/collections

#### Payments
- GET /api/payments
- POST /api/payments
- GET /api/payments/{id}
- PUT /api/payments/{id}
- DELETE /api/payments/{id}
- GET /api/suppliers/{id}/payments
- GET /api/suppliers/{id}/balance

#### Sync
- POST /api/sync/push (push local changes)
- GET /api/sync/pull (pull server changes)
- GET /api/sync/status

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {...}
  }
}
```

## Testing Strategy

### Backend Testing
1. **Unit Tests**
   - Domain entities
   - Use cases
   - Services

2. **Integration Tests**
   - Repository implementations
   - API endpoints
   - Database operations

3. **Feature Tests**
   - End-to-end workflows
   - Multi-user scenarios
   - Concurrency tests

### Frontend Testing
1. **Unit Tests**
   - Business logic
   - Utilities
   - Converters

2. **Component Tests**
   - UI components
   - Screen rendering

3. **Integration Tests**
   - State management
   - Navigation
   - API integration

4. **E2E Tests**
   - User workflows
   - Offline sync
   - Multi-device scenarios

## Deployment Architecture

### Backend
- Laravel application on PHP 8.3+
- MySQL/PostgreSQL database
- Redis for caching/queues
- NGINX/Apache web server
- SSL/TLS certificates

### Frontend
- Expo managed workflow
- EAS Build for production builds
- OTA updates for quick fixes
- App Store / Play Store distribution

## Performance Optimization

1. **Database**
   - Proper indexing
   - Query optimization
   - Connection pooling

2. **API**
   - Response caching
   - Pagination
   - Lazy loading

3. **Mobile App**
   - Image optimization
   - Code splitting
   - Lazy loading screens
   - Optimistic UI updates

## Security Best Practices

1. **Backend**
   - Input sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF tokens
   - Rate limiting

2. **Frontend**
   - Secure storage
   - Certificate pinning
   - Code obfuscation
   - Jailbreak/root detection

3. **Communication**
   - HTTPS only
   - TLS 1.3
   - Certificate validation

## Monitoring and Logging

1. **Application Logs**
   - Structured logging (JSON)
   - Log levels (DEBUG, INFO, WARNING, ERROR)
   - Centralized log aggregation

2. **Audit Logs**
   - All data modifications
   - User actions
   - Authentication attempts

3. **Performance Monitoring**
   - API response times
   - Database query performance
   - Mobile app crashes

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless API design
   - Load balancer support
   - Shared session storage

2. **Database Scaling**
   - Read replicas
   - Query optimization
   - Caching strategy

3. **Mobile App**
   - Efficient sync protocols
   - Batch operations
   - Background sync

## Documentation

1. **API Documentation**
   - OpenAPI/Swagger spec
   - Request/response examples
   - Authentication guide

2. **Developer Documentation**
   - Setup instructions
   - Architecture overview
   - Contribution guidelines

3. **User Documentation**
   - User guides
   - Feature documentation
   - Troubleshooting

## Conclusion

This architecture ensures:
- **Maintainability**: Clean separation of concerns
- **Scalability**: Modular, loosely coupled design
- **Testability**: Clear boundaries, dependency injection
- **Security**: Multiple layers of protection
- **Reliability**: Data integrity guarantees
- **Performance**: Optimized at every layer
- **Flexibility**: Easy to extend and modify
