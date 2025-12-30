# TrackVault - System Architecture

## Overview

TrackVault is a production-ready, end-to-end data collection and payment management application built with:
- **Backend**: Laravel (PHP)
- **Frontend**: React Native (Expo) with TypeScript
- **Database**: SQLite (development) / MySQL/PostgreSQL (production)

## Architecture Principles

### Clean Architecture

The system follows Clean Architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│   (Controllers, Views, UI Components)       │
├─────────────────────────────────────────────┤
│          Application Layer                  │
│   (Use Cases, Services, DTOs)              │
├─────────────────────────────────────────────┤
│            Domain Layer                     │
│   (Entities, Value Objects, Business Rules)│
├─────────────────────────────────────────────┤
│         Infrastructure Layer                │
│   (Database, External Services, Security)   │
└─────────────────────────────────────────────┘
```

### SOLID Principles

1. **Single Responsibility**: Each class has one reason to change
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Subtypes must be substitutable for base types
4. **Interface Segregation**: Clients shouldn't depend on unused interfaces
5. **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)

- Reusable components and services
- Shared utilities and helpers
- Common validation rules

### KISS (Keep It Simple, Stupid)

- Straightforward implementations
- Minimal complexity
- Clear, readable code

## Backend Architecture (Laravel)

### Directory Structure

```
backend/
├── app/
│   ├── Domain/              # Domain Layer (NEW - Clean Architecture)
│   │   ├── Entities/       # Business entities (pure PHP objects)
│   │   ├── ValueObjects/   # Value objects
│   │   ├── Repositories/   # Repository interfaces
│   │   ├── Services/       # Domain services
│   │   └── Exceptions/     # Domain exceptions
│   ├── Application/         # Application Layer (NEW - Clean Architecture)
│   │   ├── UseCases/       # Use case implementations
│   │   │   └── Supplier/   # Supplier use cases
│   │   ├── DTOs/           # Data Transfer Objects
│   │   └── Services/       # Application services
│   ├── Infrastructure/      # Infrastructure Layer (NEW - Clean Architecture)
│   │   ├── Persistence/    # Database implementations (Repository pattern)
│   │   ├── Security/       # Security implementations
│   │   └── Sync/           # Offline synchronization service
│   ├── Http/               # Interface/Presentation Layer
│   │   ├── Controllers/    # API Controllers (refactored to use Use Cases)
│   │   │   └── Api/        # API controllers
│   │   ├── Middleware/     # Middleware
│   │   └── Requests/       # Form request validation
│   ├── Models/             # Eloquent Models (Infrastructure layer)
│   └── Providers/          # Service providers (DI configuration)
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/            # Database seeders
└── routes/
    └── api.php             # API routes
```

### Clean Architecture Implementation ✨

TrackVault now follows Clean Architecture principles with clear separation of concerns:

**1. Domain Layer** - Core business logic, no framework dependencies
- `SupplierEntity`: Pure business object with validation and business rules
- `SupplierRepositoryInterface`: Contract for data persistence

**2. Application Layer** - Use cases orchestrate domain objects
- `CreateSupplierUseCase`: Create supplier with business rule validation
- `UpdateSupplierUseCase`: Update with optimistic locking (version control)
- `GetSupplierUseCase`: Retrieve supplier
- `ListSuppliersUseCase`: List with filtering
- `DeleteSupplierUseCase`: Delete supplier

**3. Infrastructure Layer** - Framework-specific implementations
- `EloquentSupplierRepository`: Bridges domain and Eloquent ORM
- `SyncService`: Handles offline synchronization with conflict resolution

**4. Presentation Layer** - HTTP interface
- Controllers refactored to use Use Cases
- Thin controllers, business logic in use cases
- Input validation and response formatting

### SOLID Principles Applied

✅ **Single Responsibility**: Each class has one reason to change
- Use cases handle one operation
- Entities contain only related business logic
- Controllers only handle HTTP concerns

✅ **Open/Closed**: Open for extension, closed for modification
- Use interfaces for extension points
- New use cases added without modifying existing code

✅ **Liskov Substitution**: Subtypes substitutable for base types
- Any `SupplierRepositoryInterface` implementation is interchangeable

✅ **Interface Segregation**: Focused interfaces
- Repository interface has only needed methods
- No forced dependencies on unused methods

✅ **Dependency Inversion**: Depend on abstractions
- Use cases depend on repository interfaces (abstractions)
- Concrete implementations injected via Laravel's service provider

### Core Entities

#### User
- Authentication and authorization
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- JWT token management

#### Role & Permission
- Many-to-many relationship
- Flexible permission assignment
- Hierarchical role structure

#### Supplier
- **Domain Entity**: `SupplierEntity` with business logic
- **Use Cases**: Full CRUD with validation and version control
- **Repository**: Interface-based persistence
- Detailed supplier profiles
- Contact information
- Multi-unit quantity tracking
- Outstanding balance calculation
- **Version control**: Optimistic locking for concurrent updates

#### Product
- Product catalog management
- Multi-unit support
- Versioned rate management
- Historical rate preservation

#### ProductRate
- Time-based rate management
- Unit-specific rates
- Effective date ranges
- Historical preservation

#### Collection
- Daily collection recording
- Multi-unit quantity tracking
- Rate application at collection time
- Automatic total calculation

#### Payment
- Advance, partial, and final payments
- Payment type tracking
- Reference number management
- Automated calculations

#### AuditLog
- Comprehensive audit trail
- User action tracking
- Entity change history
- IP and user agent logging

### Database Schema

#### Key Features
- **Soft Deletes**: Preserve data integrity
- **Versioning**: Optimistic locking for concurrency
- **Timestamps**: Created/updated tracking
- **Foreign Keys**: Referential integrity
- **Indexes**: Performance optimization

### Security Features

#### Authentication
- JWT token-based authentication
- Secure password hashing (bcrypt)
- Token expiration and refresh

#### Authorization
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Permission-based route protection

#### Data Protection
- Encryption at rest and in transit
- HTTPS enforcement
- SQL injection prevention
- XSS protection
- CSRF protection

### API Design

#### RESTful Principles
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- Stateless communication
- JSON responses

#### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "errors": []
}
```

### Multi-Unit Support

The system supports tracking quantities in multiple units:
- Kilograms (kg)
- Grams (g)
- Liters (l)
- Milliliters (ml)
- Units (pieces)

### Versioned Rate Management

- Historical rates preserved immutably
- New rates applied to new collections
- Rate history for auditing
- Time-based rate activation

### Payment Calculation

Automated payment calculations:
1. Sum all collections for a supplier
2. Apply appropriate rates per unit
3. Subtract all payments made
4. Calculate outstanding balance

### Concurrency Handling & Offline Support

#### Optimistic Locking with Versioning
- Every entity has a `version` field (integer)
- Version increments on every update
- Client must send current version with update requests
- Server compares versions before applying changes
- Prevents lost updates in concurrent scenarios

**Update Flow:**
1. Client reads entity with version=2
2. Client modifies data locally
3. Client sends update request with version=2
4. Server checks: current_version == client_version
5. If match: apply changes, increment version to 3
6. If mismatch: return 409 Conflict with server data

#### Offline Synchronization

**SyncService** (`app/Infrastructure/Sync/SyncService.php`)

Handles data synchronization from mobile devices with robust conflict detection:

**Endpoints:**
- `POST /api/sync` - Sync data from device to server
- `GET /api/sync/changes` - Get server changes since last sync
- `POST /api/sync/resolve-conflict` - Resolve conflicts with strategy
- `GET /api/sync/status` - Check server connectivity and time

**Sync Flow:**
1. Mobile device queues changes while offline
2. When online, sends batch sync request with local changes
3. Each record includes: local_id, server_id (if known), version, data
4. Server processes each record:
   - If no server_id: Create new record (returns server_id)
   - If server_id exists: Check version for conflicts
   - If versions match: Apply update, increment version
   - If versions differ: Return conflict for resolution

**Conflict Resolution Strategies:**
- `server_wins` - Keep server data, discard client changes
- `client_wins` - Apply client changes, overwrite server data
- `merge` - Intelligent merge (client data takes precedence for non-null fields)

**Conflict Response Example:**
```json
{
  "status": "conflict",
  "server_id": 5,
  "local_version": 2,
  "server_version": 3,
  "server_data": { "name": "Server Name", ... },
  "client_data": { "name": "Client Name", ... },
  "message": "Version conflict: server modified since last sync"
}
```

#### Transaction Support
- All database operations wrapped in transactions
- Rollback on any error during sync
- Ensures data consistency
- Atomic batch operations

#### Audit Trail
- Every create/update/delete logged
- Includes user ID, timestamp, IP address
- Old and new values preserved
- Immutable audit logs
- Full traceability for compliance

## Frontend Architecture (React Native/Expo)

### Directory Structure

```
frontend/
├── src/
│   ├── domain/              # Domain Layer
│   │   ├── entities/       # Business entities
│   │   └── repositories/   # Repository interfaces
│   ├── application/         # Application Layer
│   │   ├── useCases/       # Use case implementations
│   │   └── store/          # State management
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── api/            # API client
│   │   ├── storage/        # Local storage
│   │   └── sync/           # Sync mechanism
│   ├── presentation/        # Presentation Layer
│   │   ├── screens/        # Screen components
│   │   ├── components/     # Reusable components
│   │   └── navigation/     # Navigation config
│   └── shared/             # Shared utilities
│       ├── utils/          # Helper functions
│       └── constants/      # Constants
└── assets/                 # Static assets
```

### State Management

- Context API for global state
- Local component state for UI
- Persistent storage for offline data

### Offline Support

#### Local Persistence
- SQLite for structured data
- AsyncStorage for key-value pairs
- Secure storage for sensitive data

#### Sync Mechanism
- Queue pending operations
- Detect connectivity changes
- Sync when online
- Conflict resolution

### Multi-Device Support

- Centralized server state
- Version-based conflict detection
- Server-authoritative validation
- Consistent data across devices

## Data Integrity & Concurrency

### Multi-User Support

- Simultaneous access by multiple users
- Server-side conflict detection
- Optimistic locking with version field
- Transaction-based operations

### Data Validation

- Client-side validation (UX)
- Server-side validation (security)
- Type checking
- Business rule enforcement

### Audit Trail

- Complete history of all changes
- User action tracking
- Immutable audit logs
- Timestamp and IP logging

## Security Implementation

### Encryption

- **At Rest**: Database encryption
- **In Transit**: HTTPS/TLS
- **Storage**: Secure key storage

### Authentication Flow

1. User login with credentials
2. Server validates and issues JWT
3. Client stores token securely
4. Token included in API requests
5. Server validates token
6. Token refresh before expiration

### Authorization

- Check user roles
- Verify permissions
- Resource-level access control
- Operation-level restrictions

## Performance Optimization

- Database indexing
- Query optimization
- Caching strategies
- Lazy loading
- Pagination

## Scalability

- Horizontal scaling support
- Load balancing ready
- Database connection pooling
- Stateless API design

## Testing Strategy

- Unit tests for business logic
- Integration tests for API
- End-to-end tests for workflows
- Security testing
- Performance testing

## Deployment

### Backend
- Docker containerization
- Environment-based configuration
- Database migrations
- Automated deployments

### Frontend
- Expo EAS Build
- OTA updates
- Platform-specific builds
- App store deployment

## Monitoring & Logging

- Structured logging
- Error tracking
- Performance monitoring
- User analytics
- Audit log queries

## Use Case: Tea Leaves Collection

### Workflow

1. **Daily Collection**
   - Collector visits suppliers
   - Records quantities in kg/g
   - System applies current rate
   - Calculates total amount

2. **Payment Management**
   - Advance payments recorded
   - Partial payments tracked
   - Final settlement calculated

3. **Month-End Reconciliation**
   - Total collections calculated
   - Rates verified
   - Payments reconciled
   - Outstanding balance computed

4. **Multi-User Operations**
   - Multiple collectors work simultaneously
   - No data conflicts
   - Consistent calculations
   - Accurate records

## Future Enhancements

- Real-time notifications
- Advanced reporting & analytics
- Mobile app biometric authentication
- Integration with payment gateways
- Multi-language support
- Export to Excel/PDF

## Maintenance

- Regular security updates
- Database optimization
- Performance monitoring
- Backup and recovery
- Documentation updates
