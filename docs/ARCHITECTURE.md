# SyncCollect Architecture

## System Overview

SyncCollect is a distributed data collection and payment management system designed with an online-first approach while providing robust offline capabilities.

## High-Level Architecture

```
┌─────────────────────────────────────┐
│     Mobile Application (Expo)       │
│  ┌───────────────────────────────┐  │
│  │   Presentation Layer (UI)     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Business Logic Layer        │  │
│  │  - State Management           │  │
│  │  - Sync Engine                │  │
│  │  - Conflict Resolution        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Data Layer                  │  │
│  │  - Local SQLite DB            │  │
│  │  - API Service                │  │
│  │  - Offline Queue              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                 │
                 │ HTTPS/REST API
                 ▼
┌─────────────────────────────────────┐
│      Backend API (Laravel)          │
│  ┌───────────────────────────────┐  │
│  │   API Layer (Controllers)     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Business Logic              │  │
│  │  - Services                   │  │
│  │  - Repositories               │  │
│  │  - Domain Models              │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Data Layer                  │  │
│  │  - ORM (Eloquent)             │  │
│  │  - Query Builder              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│     Database (MySQL/PostgreSQL)     │
└─────────────────────────────────────┘
```

## Core Components

### 1. Frontend (React Native/Expo)

#### Presentation Layer
- **React Components**: Reusable UI components
- **Screens**: Page-level components
- **Navigation**: React Navigation for routing
- **Theme**: Consistent design system

#### Business Logic Layer
- **State Management**: Context API for global state
- **Services**: Business logic abstraction
- **Hooks**: Custom React hooks for reusability
- **Utilities**: Helper functions

#### Data Layer
- **API Client**: Axios-based HTTP client with interceptors
- **Local Database**: SQLite for offline storage
- **Sync Engine**: Manages data synchronization
- **Cache Manager**: In-memory and persistent caching

### 2. Backend (Laravel)

#### API Layer
- **Routes**: RESTful API endpoints
- **Controllers**: Request handling
- **Middleware**: Authentication, CORS, rate limiting
- **Resources**: API response transformation
- **Requests**: Input validation

#### Business Logic Layer
- **Services**: Complex business operations
- **Repositories**: Data access abstraction
- **Models**: Domain entities (Eloquent)
- **Events**: Domain events
- **Listeners**: Event handlers
- **Jobs**: Asynchronous tasks

#### Data Layer
- **Migrations**: Database schema versioning
- **Seeders**: Test data generation
- **Factories**: Model factories for testing

## Data Synchronization

### Synchronization Flow

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Update Local DB      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Add to Sync Queue    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐     No      ┌────────────┐
│ Network Available?   ├────────────►│ Wait/Retry │
└──────┬───────────────┘             └────────────┘
       │ Yes
       ▼
┌──────────────────────┐
│ Send to Backend API  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Backend Processing   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Conflict Check       │
└──────┬───────────────┘
       │
       ├─────► Conflict Found ──► Resolve ──► Update
       │
       ▼ No Conflict
┌──────────────────────┐
│ Save to Database     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Return Success       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Update Local DB      │
│ Remove from Queue    │
└──────────────────────┘
```

### Conflict Resolution Strategy

1. **Timestamp-Based**: Compare `updated_at` timestamps
2. **Version-Based**: Increment version number on each update
3. **Last-Write-Wins**: Default strategy with user override
4. **Field-Level Merge**: Merge non-conflicting fields
5. **User Resolution**: Present conflicts to user when automatic resolution fails

## Security Architecture

### Authentication Flow

```
┌──────────────┐
│ Login Screen │
└──────┬───────┘
       │ credentials
       ▼
┌────────────────────┐
│ Backend Auth API   │
└──────┬─────────────┘
       │ JWT Token
       ▼
┌────────────────────┐
│ Secure Storage     │
│ (encrypted)        │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ API Interceptor    │
│ (adds token)       │
└────────────────────┘
```

### Authorization Layers

1. **API Level**: Middleware checks token validity
2. **Route Level**: Role-based access control
3. **Resource Level**: Attribute-based access control
4. **Field Level**: Sensitive data filtering

### Data Protection

- **In Transit**: TLS/HTTPS encryption
- **At Rest**: 
  - Backend: Database encryption
  - Frontend: Encrypted SQLite with SQLCipher
- **Application**: Encrypted secure storage for credentials

## Database Schema (Core Entities)

### Users
- id, name, email, password, role, attributes, timestamps

### Suppliers
- id, name, contact, address, status, user_id, timestamps

### Products
- id, supplier_id, name, description, units, status, timestamps

### Product Rates
- id, product_id, rate, unit, effective_from, effective_to, timestamps

### Payments
- id, supplier_id, product_id, amount, payment_type, reference, timestamps

### Transactions
- id, entity_type, entity_id, user_id, action, data, timestamps

### Sync Queue (Frontend Only)
- id, entity_type, entity_id, operation, data, status, retries, timestamps

## API Design

### RESTful Endpoints

```
# Authentication
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/user

# Suppliers
GET    /api/v1/suppliers
POST   /api/v1/suppliers
GET    /api/v1/suppliers/{id}
PUT    /api/v1/suppliers/{id}
DELETE /api/v1/suppliers/{id}

# Products
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}

# Product Rates
GET    /api/v1/products/{id}/rates
POST   /api/v1/products/{id}/rates
PUT    /api/v1/rates/{id}

# Payments
GET    /api/v1/payments
POST   /api/v1/payments
GET    /api/v1/payments/{id}

# Sync
POST   /api/v1/sync/push
GET    /api/v1/sync/pull?since={timestamp}
```

### Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "meta": {
    "version": "1.0.0",
    "timestamp": "2025-12-23T09:30:00Z"
  }
}
```

## Performance Considerations

### Backend Optimizations
- Database indexing on frequently queried fields
- Query optimization with eager loading
- Caching with Redis (optional)
- Rate limiting to prevent abuse
- Database connection pooling

### Frontend Optimizations
- Lazy loading of components
- Memoization of expensive computations
- Virtual lists for large datasets
- Image optimization
- Code splitting

### Network Optimizations
- Request batching
- Response compression (gzip)
- Incremental sync (delta updates only)
- Pagination for large datasets
- Connection pooling

## Scalability

### Horizontal Scaling
- Stateless API design
- Load balancing
- Database read replicas
- Queue workers

### Vertical Scaling
- Optimized queries
- Indexed database
- Efficient algorithms
- Memory management

## Monitoring and Logging

### Backend Logging
- Application logs (Laravel Log)
- API request/response logs
- Error tracking
- Performance metrics

### Frontend Logging
- Error boundaries
- Crash reporting
- Analytics events
- Performance monitoring

## Deployment

### Backend Deployment
- Docker containerization
- Environment-based configuration
- Database migrations
- Zero-downtime deployment

### Frontend Deployment
- OTA (Over-The-Air) updates with Expo
- App store distribution (iOS/Android)
- Version management
- Feature flags

## Testing Strategy

### Backend Testing
- Unit tests (PHPUnit)
- Integration tests
- API tests
- Database tests

### Frontend Testing
- Unit tests (Jest)
- Component tests (React Testing Library)
- Integration tests
- E2E tests (Detox)

### Testing Best Practices
- Test coverage > 80%
- CI/CD integration
- Automated testing
- Mock external dependencies
