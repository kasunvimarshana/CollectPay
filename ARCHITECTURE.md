# Collection Payment System - Architecture Documentation

## System Overview

A production-ready, end-to-end data collection and payment management application built with:
- **Backend**: Laravel 12 with Clean Architecture
- **Frontend**: React Native (Expo) with TypeScript
- **Architecture**: Online-first with robust offline support

## Core Features

### 1. Entity Management (CRUD)
- **Users**: Multi-role support (admin, manager, collector) with RBAC/ABAC
- **Suppliers**: Detailed profiles with regional tracking
- **Products**: Multi-unit support (kg, g, lb)
- **Collections**: Quantity tracking with immutable historical rates
- **Payments**: Advance, partial, full payments with multiple methods
- **Rates**: Time-versioned pricing with supplier-specific or global rates

### 2. Offline-First Synchronization
- **Event-driven triggers**: Network restoration, app foreground, authentication
- **Manual sync option**: User-initiated sync with visual feedback
- **Idempotent operations**: Guaranteed zero data loss and no duplication
- **Conflict resolution**: Version-based with timestamp validation
- **Tamper-resistant**: HMAC-signed payloads

### 3. Security
- **Authentication**: JWT-based with secure token storage
- **Authorization**: RBAC + ABAC enforced on all operations
- **Encryption**: 
  - Data in transit: HTTPS/TLS
  - Data at rest: Encrypted SQLite (frontend), encrypted DB fields (backend)
- **Integrity**: HMAC signatures on sync payloads

### 4. Payment Calculations
- Fully automated, auditable calculations
- Based on historical collections with preserved rates
- Accounts for advance and partial payments
- Transparent financial oversight

## Architecture

### Backend (Clean Architecture)

```
backend/
├── src/
│   ├── Domain/                    # Core business logic
│   │   ├── Entities/              # Business entities
│   │   ├── ValueObjects/          # Immutable value objects
│   │   ├── Repositories/          # Repository interfaces
│   │   ├── Services/              # Domain services
│   │   └── Events/                # Domain events
│   ├── Application/               # Application layer
│   │   ├── UseCases/              # Use case implementations
│   │   ├── DTOs/                  # Data transfer objects
│   │   ├── Services/              # Application services
│   │   └── Contracts/             # Application interfaces
│   └── Infrastructure/            # External concerns
│       ├── Persistence/
│       │   ├── Eloquent/
│       │   │   ├── Models/        # Eloquent models
│       │   │   └── Repositories/  # Repository implementations
│       │   └── Migrations/        # Database migrations
│       ├── Http/
│       │   ├── Controllers/       # API controllers
│       │   ├── Middleware/        # HTTP middleware
│       │   └── Requests/          # Form requests
│       ├── Security/              # Security implementations
│       └── Sync/                  # Synchronization logic
├── app/
│   ├── Models/                    # Eloquent models
│   └── Http/
│       ├── Controllers/Api/       # RESTful API controllers
│       └── Middleware/            # HTTP middleware
├── database/
│   └── migrations/                # Database migrations
├── routes/
│   └── api.php                    # API routes
└── tests/                         # Automated tests
```

### Frontend (Clean Architecture)

```
frontend/
├── src/
│   ├── domain/                    # Business logic
│   │   ├── entities/              # Domain entities
│   │   ├── repositories/          # Repository interfaces
│   │   └── usecases/              # Use cases
│   ├── data/                      # Data layer
│   │   ├── repositories/          # Repository implementations
│   │   ├── datasources/
│   │   │   ├── local/             # SQLite/AsyncStorage
│   │   │   └── remote/            # API clients
│   │   └── models/                # Data models
│   ├── presentation/              # UI layer
│   │   ├── screens/               # Screen components
│   │   ├── components/            # Reusable components
│   │   ├── navigation/            # Navigation configuration
│   │   └── state/                 # State management (Context)
│   ├── infrastructure/            # External concerns
│   │   ├── storage/               # Encrypted local storage
│   │   ├── network/               # Network utilities
│   │   ├── sync/                  # Sync orchestration
│   │   └── security/              # Security utilities
│   └── core/                      # Shared utilities
│       ├── constants/
│       ├── types/
│       └── utils/
└── App.tsx                        # Entry point
```

## Database Schema

### Core Tables

#### users
- id, uuid, name, email, password, role, permissions
- is_active, last_login_at, version, device_id
- created_at, updated_at

#### suppliers
- id, uuid, name, code, phone, email, address, region
- id_number, credit_limit, is_active, version, metadata
- created_by, updated_by, created_at, updated_at, deleted_at

#### products
- id, uuid, name, code, description
- default_unit, available_units (JSON), category
- is_active, version, metadata
- created_by, updated_by, created_at, updated_at, deleted_at

#### rates
- id, uuid, product_id, supplier_id (nullable for global)
- rate_value, unit, effective_from, effective_to
- is_active, version, metadata
- created_by, updated_by, created_at, updated_at, deleted_at

#### collections
- id, uuid, supplier_id, product_id, rate_id
- quantity, unit, rate_at_collection (immutable), total_value
- collected_at, notes, sync_status, version, metadata
- collected_by, created_by, updated_by
- created_at, updated_at, deleted_at

#### payments
- id, uuid, supplier_id, amount
- payment_type (advance, partial, full, adjustment)
- payment_method (cash, bank_transfer, cheque, mobile_money, other)
- reference_number, payment_date, notes
- status (pending, completed, cancelled)
- sync_status, version, metadata
- paid_by, created_by, updated_by
- created_at, updated_at, deleted_at

#### sync_queue
- id, uuid, user_id, entity_type, entity_uuid
- operation (create, update, delete), payload (JSON)
- payload_signature (HMAC), status, retry_count
- last_retry_at, error_message
- client_version, server_version, device_id
- created_at, updated_at

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET /api/auth/me

### CRUD Operations
- GET|POST /api/suppliers
- GET|PUT|DELETE /api/suppliers/{id}
- GET|POST /api/products
- GET|PUT|DELETE /api/products/{id}
- GET|POST /api/rates
- GET|PUT|DELETE /api/rates/{id}
- GET|POST /api/collections
- GET|PUT|DELETE /api/collections/{id}
- GET|POST /api/payments
- GET|PUT|DELETE /api/payments/{id}

### Synchronization
- POST /api/sync/push - Push local changes
- GET /api/sync/pull - Pull server changes
- GET /api/sync/status - Get sync status
- POST /api/sync/resolve-conflict - Resolve conflicts

### Calculations
- GET /api/suppliers/{id}/balance - Calculate supplier balance
- GET /api/suppliers/{id}/statement - Get supplier statement
- GET /api/payments/calculate - Calculate payment amount

## Synchronization Protocol

### Push Sync (Client → Server)
1. Client collects pending operations from local sync queue
2. Signs payload with HMAC using user secret
3. Sends batch of operations with metadata:
   - entity_type, entity_uuid, operation
   - payload, payload_signature
   - client_version, device_id
4. Server validates signature and version
5. Server processes operations in transaction
6. Server returns sync results with server_version
7. Client updates local records and removes from queue

### Pull Sync (Server → Client)
1. Client sends last known version
2. Server returns all changes since version
3. Client applies changes with conflict detection
4. Client updates local version marker

### Conflict Resolution
- **Version-based**: Compare client_version vs server_version
- **Timestamp-based**: Use updated_at for tie-breaking
- **Last-write-wins**: Server version takes precedence
- **User notification**: UI shows conflicts for user decision

## Security Implementation

### Backend
- JWT authentication with short-lived tokens
- RBAC middleware on all routes
- Rate limiting on API endpoints
- SQL injection prevention (Eloquent ORM)
- XSS prevention (input sanitization)
- CSRF protection
- HTTPS enforced in production

### Frontend
- Encrypted SQLite database
- Secure token storage (Expo SecureStore)
- Certificate pinning for API calls
- Input validation before sync
- Secure random UUID generation

## Deployment

### Backend (Laravel)
```bash
# Install dependencies
composer install --no-dev --optimize-autoloader

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Setup web server (Nginx/Apache) with PHP-FPM
```

### Frontend (Expo)
```bash
# Install dependencies
npm install

# Build for production
npx expo build:android
npx expo build:ios

# Or use EAS Build
eas build --platform all
```

## Testing Strategy

### Backend
- Unit tests: Domain logic
- Integration tests: API endpoints
- Feature tests: Complete workflows
- Database transactions for isolation

### Frontend
- Unit tests: Business logic
- Integration tests: Sync operations
- E2E tests: Critical user flows
- Offline scenario testing

## Performance Optimization

- Database indexing on frequently queried columns
- Lazy loading of relationships
- Pagination on list endpoints
- Delta sync (only changed data)
- Background sync queue processing
- Caching of frequently accessed data

## Example Use Case: Tea Leaf Collection

1. **Collector visits supplier**: Opens app, selects supplier
2. **Records collection**: Enters quantity (kg), system fetches current rate
3. **Saves collection**: Stored locally with current rate (immutable)
4. **Makes advance payment**: Records payment against supplier
5. **Syncs data**: When online, pushes collections and payments
6. **Month-end rate update**: Admin updates rate for the period
7. **Calculate balance**: System computes total owed minus payments
8. **Generate statement**: Detailed breakdown with all collections and payments

## Monitoring & Maintenance

- Error logging with Laravel Log
- Sync queue monitoring
- Database backup strategy
- API health checks
- Performance metrics tracking

## Future Enhancements

- Real-time WebSocket notifications
- Batch operations for bulk data entry
- Advanced reporting and analytics
- Export to Excel/PDF
- Multi-language support
- Biometric authentication
