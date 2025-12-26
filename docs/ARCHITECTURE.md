# SyncLedger Architecture Documentation

## Overview

SyncLedger follows Clean Architecture principles with clear separation of concerns across three main layers: Domain, Data, and Presentation. This architecture ensures maintainability, testability, and scalability.

## Architecture Layers

### 1. Domain Layer (Business Logic)
- **Entities**: Core business objects (Supplier, Product, Collection, Payment)
- **Use Cases**: Business rules and operations
- **Interfaces**: Abstract contracts for repositories and services

**Characteristics:**
- No dependencies on frameworks or external libraries
- Pure business logic
- Framework-agnostic
- Highly testable

### 2. Data Layer (Data Access)
- **Repositories**: Implementation of data access patterns
- **Data Sources**: Local (SQLite) and Remote (API)
- **Models**: Data transfer objects
- **Mappers**: Convert between domain entities and data models

**Characteristics:**
- Implements domain interfaces
- Handles data persistence
- Manages data synchronization
- Abstracts data source details

### 3. Infrastructure Layer (System Services)
- **Database**: SQLite management and queries
- **Network**: API client and network monitoring
- **Storage**: Secure storage for sensitive data
- **Sync**: Synchronization engine and queue management

**Characteristics:**
- Platform-specific implementations
- External service integrations
- System-level operations
- Cross-cutting concerns

### 4. Presentation Layer (UI)
- **Screens**: User interface components
- **Navigation**: App routing and flow
- **State Management**: UI state and user interactions
- **View Models**: Presentation logic

**Characteristics:**
- Framework-dependent (React Native)
- User interaction handling
- UI state management
- Minimal business logic

## Data Flow

### Write Operations (Create/Update/Delete)

```
User Action
    ↓
Presentation Layer (Screen)
    ↓
Repository (Data Layer)
    ↓
Local Database (Infrastructure)
    ↓
Sync Queue (Infrastructure)
    ↓
[When Online] Sync Engine
    ↓
API Client (Infrastructure)
    ↓
Backend API
    ↓
Database (Server)
```

### Read Operations

```
User Request
    ↓
Presentation Layer (Screen)
    ↓
Repository (Data Layer)
    ↓
Local Database (Infrastructure)
    ↓
Return Data
```

### Sync Flow

```
Sync Trigger
    ↓
Sync Engine
    ↓
Fetch Pending Queue Items
    ↓
Batch Operations
    ↓
API Client → Backend
    ↓
Process Server Response
    ↓
Update Local Database
    ↓
Remove from Queue
    ↓
Pull Remote Changes
    ↓
Apply to Local DB
    ↓
Update Last Sync Time
```

## Synchronization Strategy

### Online-First Approach
1. Always attempt remote operation first when online
2. On success, update local cache
3. On failure, fallback to offline mode

### Offline Operation
1. Store operation in local database
2. Add to sync queue
3. Continue with local data
4. Sync when connection restored

### Conflict Resolution
1. **Version-Based**: Compare version numbers
2. **Timestamp-Based**: Compare updated_at timestamps
3. **Server-Wins**: Default strategy (server data takes precedence)
4. **Manual Resolution**: Flag conflicts for user review

### Idempotency
- UUID-based entity identification
- Duplicate detection on server
- Skip already-synced operations
- Return existing entity on duplicate

## Database Schema

### Local (SQLite)

```sql
-- Suppliers
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY,
  server_id INTEGER,
  code TEXT UNIQUE,
  name TEXT,
  -- ... other fields
  version INTEGER DEFAULT 1,
  synced INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

-- Products
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  server_id INTEGER,
  code TEXT UNIQUE,
  name TEXT,
  -- ... other fields
  version INTEGER DEFAULT 1,
  synced INTEGER DEFAULT 0
);

-- Rates
CREATE TABLE rates (
  id INTEGER PRIMARY KEY,
  server_id INTEGER,
  product_id INTEGER,
  supplier_id INTEGER,
  rate REAL,
  effective_from TEXT,
  effective_to TEXT,
  -- ... other fields
  version INTEGER DEFAULT 1,
  synced INTEGER DEFAULT 0
);

-- Collections
CREATE TABLE collections (
  id INTEGER PRIMARY KEY,
  server_id INTEGER,
  uuid TEXT UNIQUE,
  supplier_id INTEGER,
  product_id INTEGER,
  rate_id INTEGER,
  quantity REAL,
  rate_applied REAL,
  total_amount REAL,
  collection_date TEXT,
  -- ... other fields
  version INTEGER DEFAULT 1,
  synced INTEGER DEFAULT 0
);

-- Payments
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  server_id INTEGER,
  uuid TEXT UNIQUE,
  supplier_id INTEGER,
  amount REAL,
  payment_date TEXT,
  outstanding_before REAL,
  outstanding_after REAL,
  -- ... other fields
  version INTEGER DEFAULT 1,
  synced INTEGER DEFAULT 0
);

-- Sync Queue
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY,
  entity_type TEXT,
  entity_id INTEGER,
  operation TEXT,
  payload TEXT,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  created_at TEXT
);

-- Sync Metadata
CREATE TABLE sync_metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT
);
```

### Server (MySQL)

See `backend/database/migrations/` for complete schema.

Key differences:
- Server uses auto-increment IDs
- Server has audit fields (created_by, updated_by)
- Server has soft deletes
- Server tracks sync status per entity

## Security Architecture

### Authentication Flow

```
Login Request
    ↓
Backend validates credentials
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Store in SecureStore (encrypted)
    ↓
Include in all API requests
```

### Authorization

**RBAC (Role-Based Access Control)**
- Admin: Full access
- Manager: Read all, limited write
- Collector: Read assigned, write collections

**ABAC (Attribute-Based Access Control)**
- Check user permissions array
- Validate resource ownership
- Enforce data isolation

### Data Encryption

**At Rest:**
- SecureStore for tokens and credentials
- SQLite database (optional encryption)
- Backend database encryption (server-level)

**In Transit:**
- HTTPS/TLS for all API communication
- Certificate pinning (recommended for production)

## Performance Optimization

### Database
- Indexes on frequently queried columns
- Prepared statements (SQL injection prevention)
- Connection pooling
- Query result caching

### Network
- Request batching (max 100 items)
- Response compression
- Conditional requests (ETags)
- Request debouncing

### Sync
- Incremental sync (only changed data)
- Background sync (don't block UI)
- Exponential backoff on failures
- Priority queue (important data first)

### UI
- Lazy loading
- Pagination
- Virtual lists for large datasets
- Optimistic UI updates

## Error Handling

### Network Errors
```javascript
try {
  await ApiClient.sync(data);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Store in queue, retry later
    await addToSyncQueue(data);
  } else {
    // Handle other errors
    showError(error.message);
  }
}
```

### Sync Conflicts
```javascript
if (response.results.conflicts) {
  for (const conflict of response.results.conflicts) {
    // Store conflict for resolution
    await storeConflict(conflict);
    // Notify user
    showConflictNotification(conflict);
  }
}
```

### Validation Errors
```javascript
try {
  await createCollection(data);
} catch (error) {
  if (error.response?.status === 422) {
    // Validation error
    showValidationErrors(error.response.data.errors);
  }
}
```

## Testing Strategy

### Unit Tests
- Business logic (services)
- Data transformations (mappers)
- Utility functions
- Repository methods

### Integration Tests
- API endpoints
- Database operations
- Sync process
- Authentication flow

### E2E Tests
- User workflows
- Offline scenarios
- Sync recovery
- Conflict resolution

## Deployment Architecture

### Backend

```
Internet
    ↓
Load Balancer
    ↓
Web Server (Nginx)
    ↓
PHP-FPM
    ↓
Laravel Application
    ↓
MySQL Database
```

### Frontend

```
Mobile Device
    ↓
React Native App
    ↓
SQLite Database (local)
    ↓
[Network] ←→ Backend API
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session storage in database/Redis
- Load balancer for multiple servers

### Vertical Scaling
- Database optimization
- Caching layer (Redis)
- CDN for static assets

### Data Growth
- Archive old data
- Partition tables by date
- Implement data retention policies

## Monitoring and Logging

### Application Logs
- Error tracking
- Performance metrics
- Sync statistics
- User activity

### Infrastructure Logs
- Server resources
- Database performance
- Network latency
- API response times

### Alerting
- Failed syncs
- High error rates
- Performance degradation
- Security incidents

## Maintenance

### Regular Tasks
- Database backups (daily)
- Log rotation (weekly)
- Cache clearing (as needed)
- Security updates (monthly)

### Monitoring
- Sync success rate
- API response times
- Database query performance
- Storage usage

### Optimization
- Identify slow queries
- Optimize indexes
- Review sync batch sizes
- Update dependencies

## Future Enhancements

### Planned Features
- Real-time sync with WebSockets
- Advanced conflict resolution UI
- Offline map support
- Biometric authentication
- Push notifications
- Multi-language support

### Technical Improvements
- GraphQL API option
- End-to-end encryption
- Automated testing suite
- CI/CD pipeline
- Docker containerization
- Kubernetes orchestration
