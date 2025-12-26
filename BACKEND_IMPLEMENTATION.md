# Backend Implementation Summary

## Overview

This document describes the complete Laravel backend implementation for the Collection-Payments-Sync application. The backend serves as the single source of truth for all data, with deterministic synchronization, conflict resolution, and audit logging.

## Architecture

### Design Principles

- **Clean Architecture**: Domain → Application → Infrastructure layers
- **Repository Pattern**: Abstract data access with domain interfaces
- **Service Layer Pattern**: Business logic centralized in services
- **RBAC/ABAC**: Role-based and attribute-based access control
- **Idempotency**: Deduplication via unique keys for all write operations
- **Audit Trail**: Immutable logging of all operations with user, device, and timestamp

### Technology Stack

- **Framework**: Laravel 12.x
- **ORM**: Eloquent
- **Authentication**: Laravel Sanctum (token-based)
- **Database**: SQLite (default), supports MySQL/PostgreSQL
- **API**: RESTful JSON API with v1 versioning

## Data Models

### Core Entities

#### Collection

Represents a collection event (tea leaf collection, harvest, etc.)

- Relationships: payments (1:many), rates (many:many), creator (belongs to User), updater (belongs to User)
- Key Attributes: id, uuid, name, description, amount, status, device_id, created_at, updated_at, deleted_at
- Scopes: modifiedSince(), active()
- Audit: Full audit trail via AuditLog

#### Payment

Represents a payment against a collection

- Relationships: collection (belongs to Collection), payer (belongs to User), rate (belongs to Rate), creator (belongs to User), updater (belongs to User)
- Key Attributes: id, uuid, collection_id, amount, payment_date, status, idempotency_key, device_id, created_at, updated_at, deleted_at
- Unique Index: idempotency_key (prevents duplicate processing)
- Scopes: forCollection(), byStatus(), modifiedSince(), byIdempotencyKey()
- Audit: Full audit trail

#### Rate

Represents time-based pricing (immutable historical records via versioning)

- Relationships: payments (1:many), collections (many:many via collection_rates)
- Key Attributes: id, uuid, name, base_amount, version, is_active, rate_date, device_id, created_at, updated_at, deleted_at
- Scopes: active(), byVersion(), modifiedSince(), currentVersion()
- Strategy: Updates create new versions; historical versions remain immutable
- Audit: Full audit trail

#### AuditLog

Immutable audit trail (no UPDATE_AT)

- Relationships: user (belongs to User)
- Key Attributes: id, user_id, device_id, auditable_type, auditable_id, action, old_values (JSON), new_values (JSON), created_at
- Scopes: forEntity(), byAction(), byUser(), dateRange()

#### SyncQueue

Offline operation queue

- Key Attributes: id, user_id, device_id, operation_type, entity_type, entity_id, payload (JSON), status (pending/failed/synced), attempt_count, last_error, created_at, updated_at, deleted_at
- Scopes: pending(), failed(), byStatus(), byDevice()
- Purpose: Queues operations when offline; synced to server when online

#### User (RBAC)

- Relationships: roles (many:many), payments (1:many as payer and creator), collections (1:many), audit_logs (1:many)
- Key Attributes: id, uuid, name, email, password, is_active, device_id, created_at, updated_at, deleted_at
- Methods: hasRole(), hasAnyRole(), hasAllRoles(), hasPermission(), hasAnyPermission()

#### Role

- Relationships: permissions (many:many), users (many:many)
- Key Attributes: id, name, description, created_at, updated_at
- Methods: grantPermission(), revokePermission()

#### Permission

- Relationships: roles (many:many)
- Key Attributes: id, name, description, created_at, updated_at

## Service Layer

### AuthenticationService

**Responsibilities**: User registration, login, authorization

**Methods**:

- `register(array $data): User` - Creates new user with hashed password
- `login(string $email, string $password): array` - Returns `['user' => User, 'token' => string]`
- `getUser(User $user): User` - Retrieves authenticated user
- `logout(User $user): bool` - Revokes current token
- `authorize(User $user, string $permission): bool` - Checks permission

### CollectionService

**Responsibilities**: Collection CRUD, payment summaries, audit logging

**Methods**:

- `create(array $data, User $creator): Collection` - Creates with audit log
- `update(Collection $collection, array $data, User $updater): Collection` - Creates audit log on changes
- `delete(Collection $collection, User $deleter): bool` - Soft delete with audit
- `getById(string $id): Collection` - Retrieves by ID or UUID
- `getAll(int $perPage = 15): LengthAwarePaginator` - Paginated listing
- `getByUser(User $user, int $perPage = 15): LengthAwarePaginator` - User's collections
- `getWithPaymentSummary(Collection $collection): array` - Returns collection + totals/rate info

### PaymentService

**Responsibilities**: Payment CRUD, idempotency checking, auto-rate application

**Key Methods**:

- `create(array $data, User $creator): Payment` - Checks idempotency key, applies rate automatically
- `batchCreate(array $payments, User $creator): array` - Bulk payment creation with idempotency
- `findByIdempotencyKey(string $key): ?Payment` - Prevents duplicate processing
- `calculateAutoPayment(Collection $collection, User $payer): Payment` - Applies active rate
- `generateIdempotencyKey(string $deviceId, int $timestamp): string` - Deterministic key generation

**Idempotency Strategy**:

- Idempotency key = `{device_id}_{timestamp}_{random}`
- Check database before processing; return existing if found
- Prevents duplicate charges on network retry

### RateService

**Responsibilities**: Rate CRUD, version management, historical tracking

**Key Methods**:

- `create(array $data, User $creator): Rate` - Creates version 1
- `createVersion(Rate $rate, array $data, User $creator): Rate` - Creates new version instead of updating
- `deactivate(Rate $rate): bool` - Marks as inactive
- `getActive(int $perPage = 15): LengthAwarePaginator` - Currently active rates
- `getVersionsByName(string $name): Collection` - Rate history
- `getRateAtDate(string $name, string $date): ?Rate` - Rate applicable on specific date

**Versioning Strategy**:

- Each update creates new version; old versions remain immutable
- Enables rate history queries and audit trail
- Prevents data loss from rate changes

### SyncService

**Responsibilities**: Pull/push operations, conflict detection/resolution, offline queueing

**Core Methods**:

- `pull(User $user, string $deviceId, ?string $since = null): array` - Downloads data since timestamp
- `push(User $user, string $deviceId): array` - Processes queued operations
- `resolveConflicts(User $user, string $deviceId, string $strategy = 'server-wins'): array` - Conflict resolution
- `getSyncStatus(User $user, string $deviceId): array` - Pending operations count
- `retryFailed(User $user, string $deviceId, int $maxAttempts = 3): array` - Retry failed operations

**Strategies**:

- **Server-Wins** (default): Server version overwrites client
- **Client-Wins**: Client version preserved if newer
- **Merge**: Three-way merge based on timestamps and versions

**Conflict Detection**:

- Version comparison (entities have version field)
- Timestamp comparison (last_modified_at vs server modified_at)
- Server-side validation (business logic constraints)

## Repositories

All repositories implement domain-layer interfaces for abstraction.

### CollectionRepository

- `findById(string|int $id): ?Collection`
- `findByUuid(string $uuid): ?Collection`
- `findAll(): Collection`
- `create(array $data): Collection`
- `update(Collection $collection, array $data): Collection`
- `delete(Collection $collection): bool`
- `findByUserId(string $userId): Collection`
- `findForSync(string $deviceId, ?string $since = null): Collection`

### PaymentRepository

- `findById(string|int $id): ?Payment`
- `findByIdempotencyKey(string $key): ?Payment` - **Critical for deduplication**
- `findAll(): Collection`
- `create(array $data): Payment`
- `update(Payment $payment, array $data): Payment`
- `delete(Payment $payment): bool`
- `findForCollection(Collection $collection): Collection`
- `findForSync(string $deviceId, ?string $since = null): Collection`

### RateRepository

- `findById(string|int $id): ?Rate`
- `findByUuid(string $uuid): ?Rate`
- `findAll(): Collection`
- `create(array $data): Rate`
- `createVersion(Rate $rate, array $data): Rate` - Creates new version
- `delete(Rate $rate): bool`
- `findActiveRates(): Collection`
- `findCurrentVersionByName(string $name): ?Rate`
- `findVersionsByName(string $name): Collection`
- `findForSync(string $deviceId, ?string $since = null): Collection`

## API Endpoints

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication (Public)

#### POST /auth/register

Register new user

```json
{
  "name": "John Collector",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "password_confirmation": "SecurePassword123"
}
```

**Response**: `{ "user": {...}, "token": "..." }`

#### POST /auth/login

Login existing user

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response**: `{ "user": {...}, "token": "..." }`

### Protected Endpoints (Require: Authorization: Bearer {token})

#### Users

- `GET /user` - Get authenticated user
- `POST /auth/logout` - Logout (revoke token)

#### Collections

- `GET /collections` - List (paginated)
- `POST /collections` - Create
  ```json
  {
    "name": "Morning Harvest",
    "description": "Tea leaves from field A",
    "amount": 50,
    "status": "active"
  }
  ```
- `GET /collections/{id}` - Get details + payment summary
- `PUT /collections/{id}` - Update
- `DELETE /collections/{id}` - Soft delete

#### Payments

- `GET /payments?collection_id={id}&status={status}` - List with filters
- `POST /payments` - Create
  ```json
  {
    "collection_id": 1,
    "amount": 100,
    "payment_date": "2024-01-15",
    "payer_id": 1,
    "rate_id": 1
  }
  ```
- `POST /payments/batch` - Bulk create
  ```json
  {
    "payments": [
      {...},
      {...}
    ]
  }
  ```
- `GET /payments/{id}` - Get details
- `PUT /payments/{id}` - Update
- `DELETE /payments/{id}` - Soft delete

#### Rates

- `GET /rates` - List rates (paginated)
- `GET /rates/active` - Currently active rates
- `POST /rates` - Create new rate (version 1)
  ```json
  {
    "name": "Standard Rate",
    "base_amount": 50,
    "rate_date": "2024-01-01"
  }
  ```
- `GET /rates/{id}` - Get rate details
- `GET /rates/{name}/versions` - Version history by name
- `POST /rates/{id}/versions` - Create new version (instead of update)
  ```json
  {
    "base_amount": 55
  }
  ```
- `DELETE /rates/{id}` - Deactivate rate

#### Synchronization

- `POST /sync/pull` - Download data since timestamp

  ```json
  {
    "device_id": "device_123",
    "since": "2024-01-15T10:00:00Z"
  }
  ```

  **Response**: `{ "collections": [...], "payments": [...], "rates": [...] }`

- `POST /sync/push` - Upload queued operations

  ```json
  {
    "device_id": "device_123",
    "operations": [
      {
        "type": "create|update|delete",
        "entity": "payment",
        "data": {...},
        "idempotency_key": "..."
      }
    ]
  }
  ```

- `POST /sync/resolve-conflicts` - Resolve conflicts

  ```json
  {
    "device_id": "device_123",
    "strategy": "server-wins|client-wins|merge"
  }
  ```

- `GET /sync/status?device_id={id}` - Sync status (pending operations count)
- `POST /sync/retry` - Retry failed operations

## Database Migrations

All migrations are located in `database/migrations/`:

1. `0001_01_01_000000_create_users_table.php` - Users table
2. `0001_01_01_000001_create_cache_table.php` - Cache table
3. `0001_01_01_000002_create_jobs_table.php` - Job queue table
4. `2024_01_01_000003_create_roles_and_permissions_tables.php` - RBAC tables
5. `2024_01_01_000004_create_collections_table.php` - Collections table
6. `2024_01_01_000005_create_rates_table.php` - Rates table (with versioning)
7. `2024_01_01_000006_create_payments_table.php` - Payments table (with idempotency key)
8. `2024_01_01_000007_create_audit_logs_table.php` - Audit trail (immutable)
9. `2024_01_01_000008_create_sync_queue_table.php` - Offline queue
10. `2025_12_23_221647_create_personal_access_tokens_table.php` - Sanctum tokens

## File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── CollectionController.php
│   │   │   ├── PaymentController.php
│   │   │   ├── RateController.php
│   │   │   └── SyncController.php
│   │   └── Requests/
│   │       └── Auth/
│   │           ├── LoginRequest.php
│   │           └── RegisterRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Collection.php
│   │   ├── Payment.php
│   │   ├── Rate.php
│   │   ├── AuditLog.php
│   │   ├── SyncQueue.php
│   │   ├── Role.php
│   │   └── Permission.php
│   ├── Repositories/
│   │   ├── CollectionRepository.php
│   │   ├── PaymentRepository.php
│   │   └── RateRepository.php
│   ├── Services/
│   │   ├── AuthenticationService.php
│   │   ├── CollectionService.php
│   │   ├── PaymentService.php
│   │   ├── RateService.php
│   │   └── SyncService.php
│   └── Providers/
│       └── AppServiceProvider.php (updated with service registration)
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── sanctum.php
│   └── (other configs)
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── routes/
│   └── api.php (updated with complete routing)
└── storage/
```

## Security Features

1. **Authentication**: Laravel Sanctum token-based with secure token storage
2. **Authorization**: RBAC with role/permission checks in controllers
3. **Validation**: Form request validation on all inputs
4. **Idempotency**: Prevents duplicate payment processing
5. **Audit Logging**: Immutable logs of all operations
6. **Soft Deletes**: No data destruction; tracks deleted_at timestamp
7. **Device Tracking**: device_id on all operations for multi-device support
8. **Rate Limiting**: (To be configured per endpoint)

## Setup Instructions

### Prerequisites

- PHP 8.3+
- Composer
- SQLite or MySQL/PostgreSQL

### Installation Steps

1. **Install dependencies**:

   ```bash
   cd backend
   composer install
   ```

2. **Environment setup**:

   ```bash
   cp .env.example .env
   # Edit .env with database credentials and APP_KEY
   php artisan key:generate
   ```

3. **Database setup**:

   ```bash
   php artisan migrate
   php artisan db:seed  # Optional: seed demo data
   ```

4. **Start development server**:

   ```bash
   php artisan serve
   ```

5. **Server runs on**: `http://localhost:8000`

### Environment Variables

```
APP_NAME="Collection Payments Sync"
APP_ENV=local
APP_KEY=<generated-by-artisan-key-generate>
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/full/path/to/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:8000,127.0.0.1:8000
```

## Testing

### Running Tests

```bash
# Unit tests
php artisan test --filter=Unit

# Feature tests
php artisan test --filter=Feature

# All tests
php artisan test
```

### Key Test Scenarios

- User registration and authentication
- Payment idempotency (duplicate prevention)
- Rate versioning and version queries
- Sync pull/push/conflict resolution
- Audit logging on all operations
- Multi-device concurrency scenarios

## Performance Considerations

1. **Caching**: Implement query caching for rates and active collections
2. **Pagination**: All list endpoints paginated (15 per page default)
3. **Eager Loading**: Use with() to prevent N+1 queries
4. **Indexing**: UUID, idempotency_key, device_id, user_id indexed
5. **Soft Deletes**: Use withTrashed() carefully to avoid stale data

## Deployment

### Production Checklist

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Set secure `APP_KEY`
- [ ] Configure production database (MySQL/PostgreSQL recommended)
- [ ] Configure mail settings for notifications
- [ ] Set up rate limiting on all endpoints
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure CORS headers
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database
- [ ] Test multi-device sync scenarios
- [ ] Load testing on payment endpoints
- [ ] Security audit (OWASP)

## Troubleshooting

### Common Issues

**Migration fails**: Ensure database is created and `DB_DATABASE` path is correct
**Token errors**: Check `SANCTUM_STATEFUL_DOMAINS` matches your domain
**CORS errors**: Verify `APP_URL` matches frontend origin
**Sync failures**: Check `sync_queue` table for failed operations; use retry endpoint

## Future Enhancements

1. **Real-time Notifications**: WebSocket support for live sync updates
2. **Advanced Conflict Resolution**: Machine-learning based conflict detection
3. **Encryption at Rest**: Encrypt sensitive fields in database
4. **Backup/Restore**: Automated backup with point-in-time recovery
5. **Analytics**: Usage analytics and reporting endpoints
6. **Webhooks**: External service integration for business events
7. **Multi-tenant**: Support multiple organizations
8. **API Versioning**: Gradual deprecation of older API versions
