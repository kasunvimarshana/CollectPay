# Architecture Documentation

## System Architecture Overview

Ledgerly follows a **Clean Architecture** pattern with clear separation between layers and adherence to SOLID principles.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Native (Expo) Frontend                              │ │
│  │  - Screens (UI)                                            │ │
│  │  - Components (Reusable UI)                                │ │
│  │  - Navigation                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                         HTTPS / REST API
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Laravel HTTP Layer                                        │ │
│  │  - Controllers (API Endpoints)                             │ │
│  │  - Middleware (Auth, Validation, CORS)                     │ │
│  │  - Request Validation                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                       Application Layer                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Use Cases                                                 │ │
│  │  - CreateCollection, UpdatePayment, etc.                   │ │
│  │  - Application Services                                    │ │
│  │  - DTOs (Data Transfer Objects)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                         Domain Layer                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Entities (Business Objects)                               │ │
│  │  - User, Supplier, Product, Collection, Payment            │ │
│  │                                                            │ │
│  │  Repository Interfaces (Contracts)                         │ │
│  │  - Define data access without implementation              │ │
│  │                                                            │ │
│  │  Domain Services                                           │ │
│  │  - PaymentCalculationService                               │ │
│  │  - Complex business logic                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer (Data)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Repository Implementations                                │ │
│  │  - Eloquent Models                                         │ │
│  │  - Database Queries                                        │ │
│  │  - Caching                                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                           Database                               │
│               MySQL / PostgreSQL                                 │
│  - users, suppliers, products, collections, payments            │
│  - product_rates, audit_logs                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Domain Layer (Core)

**Location**: `backend/app/Domain/`

**Purpose**: Contains pure business logic, independent of frameworks and external concerns.

**Components**:
- **Entities**: Business objects with behavior (User, Supplier, Product, Collection, Payment, ProductRate)
- **Repository Interfaces**: Contracts for data access
- **Domain Services**: Complex business rules (PaymentCalculationService)

**Rules**:
- No framework dependencies
- No database queries
- No HTTP concerns
- Pure business logic only
- Entities contain their own validation

### 2. Application Layer

**Location**: `backend/app/Application/`

**Purpose**: Orchestrates business workflows and use cases.

**Components**:
- **Use Cases**: Application-specific workflows
- **DTOs**: Data transfer between layers
- **Application Services**: Coordinate domain services and repositories

**Rules**:
- Depends on Domain layer only
- No UI concerns
- No database implementation details
- Orchestrates domain logic

### 3. Infrastructure Layer (Backend)

**Location**: `backend/app/Infrastructure/`

**Purpose**: Implements external interfaces and framework-specific code.

**Components**:
- **Persistence**: Repository implementations using Eloquent
- **HTTP**: Controllers, middleware, routes
- **Security**: Authentication, authorization, encryption

**Rules**:
- Implements domain interfaces
- Framework-specific code allowed
- External service integration

### 4. Presentation Layer (Frontend)

**Location**: `frontend/src/presentation/`

**Purpose**: User interface and user interaction.

**Components**:
- **Screens**: Full-page views
- **Components**: Reusable UI elements
- **Navigation**: App navigation structure

**Rules**:
- Depends on Application layer
- UI/UX concerns only
- User input handling

## Data Flow

### Create Collection Example

```
1. User enters collection data in UI
   ↓
2. Presentation layer validates input
   ↓
3. API call to backend /api/collections (POST)
   ↓
4. Infrastructure layer (Controller) receives request
   ↓
5. Application layer (Use Case) orchestrates
   ↓
6. Domain layer validates business rules
   ↓
7. Repository saves to database
   ↓
8. Response sent back through layers
   ↓
9. UI updates with success/error message
```

## Dependency Rules

**The Dependency Rule**: Source code dependencies must point only inward, toward higher-level policies.

```
Presentation → Application → Domain
Infrastructure → Application → Domain
Infrastructure → Domain
```

**Key Point**: Domain layer depends on NOTHING. It's the center of the architecture.

## Design Patterns Used

### 1. Repository Pattern
- Abstracts data access
- Domain defines interfaces
- Infrastructure provides implementations

### 2. Dependency Injection
- Constructor injection
- Interfaces over concrete classes
- Testability

### 3. Factory Pattern
- Entity creation
- Complex object construction

### 4. Service Pattern
- Domain Services for complex business logic
- Application Services for orchestration

### 5. DTO Pattern
- Data transfer between layers
- Validation and transformation

## Multi-User Concurrency

### Optimistic Locking

```php
// Version column tracks changes
$collection = Collection::find($id);
$collection->quantity = 100;
$collection->version = $collection->version + 1;
$collection->save();

// If version changed, save fails
// Frontend must refresh and retry
```

### Transaction Management

```php
DB::beginTransaction();
try {
    // Multiple operations
    $collection->save();
    $audit->save();
    DB::commit();
} catch (Exception $e) {
    DB::rollback();
    throw $e;
}
```

## Security Architecture

### Authentication Flow

```
1. User logs in (email/password)
   ↓
2. Backend validates credentials
   ↓
3. JWT token generated
   ↓
4. Token stored securely (expo-secure-store)
   ↓
5. Token sent with each API request (Authorization header)
   ↓
6. Backend validates token on each request
   ↓
7. Token refreshed before expiry
```

### Authorization (RBAC/ABAC)

```
1. Request reaches backend
   ↓
2. Middleware extracts user from token
   ↓
3. Check user roles (admin, manager, collector)
   ↓
4. Check specific permissions (collections.create)
   ↓
5. Check resource ownership (ABAC)
   ↓
6. Allow/Deny request
```

## Database Design

### Normalization
- 3rd Normal Form (3NF)
- No redundant data
- Foreign key constraints

### Indexing Strategy
- Primary keys (auto-indexed)
- Foreign keys
- Frequently queried columns
- Composite indexes for common queries

### Audit Trail
- audit_logs table
- Captures all CRUD operations
- User, timestamp, IP address
- Old and new values (JSON)

## Testing Strategy

### Backend Tests
- **Unit Tests**: Domain entities and services
- **Integration Tests**: Repository implementations
- **Feature Tests**: API endpoints

### Frontend Tests
- **Unit Tests**: Business logic functions
- **Component Tests**: UI components
- **Integration Tests**: API integration

## Performance Optimization

### Backend
- Database query optimization
- Eager loading relationships
- Caching frequently accessed data
- Pagination for large datasets

### Frontend
- Lazy loading screens
- Image optimization
- Local caching
- Optimistic UI updates

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancer compatible
- Shared session storage (Redis)

### Vertical Scaling
- Database optimization
- Query performance
- Efficient algorithms

### Future Enhancements
- Message queue for async operations
- Microservices for specific domains
- Read replicas for reporting
- Caching layer (Redis)

## Deployment Architecture

### Production Setup

```
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ API  │  │ API  │  (Multiple instances)
│Server│  │Server│
└───┬──┘  └──┬───┘
    │         │
    └────┬────┘
         │
┌────────▼────────┐
│    Database     │
│  (Primary +     │
│   Replicas)     │
└─────────────────┘
```

### Environment Requirements
- PHP 8.1+
- MySQL 8.0+ / PostgreSQL 13+
- Node.js 18+ (for frontend build)
- HTTPS/SSL certificate
- Redis (optional, for caching)

## Monitoring and Logging

### Application Logs
- Error logs
- Audit logs
- Performance logs

### Monitoring Metrics
- API response times
- Error rates
- Database query performance
- User activity

## Backup Strategy

### Database Backups
- Daily automated backups
- Point-in-time recovery
- Backup retention policy

### Code Backups
- Git version control
- Automated deployments
- Rollback capability

## Conclusion

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Testable code
- ✅ Maintainable codebase
- ✅ Scalable system
- ✅ Secure by design
- ✅ Performance optimized
