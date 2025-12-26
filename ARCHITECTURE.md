# Architecture Documentation

## System Overview

The Collection Payments Sync system follows an **online-first architecture** with robust offline support. The backend (Laravel) serves as the single source of truth, while the mobile app (React Native/Expo) operates in an offline-first manner with automatic synchronization.

## Design Principles

### 1. Online-First Architecture
- Server is the authoritative source of data
- Clients pull the latest data on connection
- Changes made online are immediately persisted to server
- Offline changes are queued and synced when connection is restored

### 2. Clean Architecture (Backend)
The backend follows Clean Architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (HTTP Controllers, Routes, Views)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Application Layer                 │
│  (Use Cases, DTOs, Services)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Domain Layer                   │
│  (Entities, Repository Interfaces)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Infrastructure Layer               │
│  (Eloquent Models, Repositories)        │
└─────────────────────────────────────────┘
```

**Benefits:**
- Testable business logic
- Framework independence
- Database independence
- Easy to maintain and extend

### 3. Event-Driven Synchronization
- Changes trigger sync events
- Idempotent operations prevent duplicates
- Version tracking for conflict detection
- Audit logging for all changes

### 4. Conflict Resolution
Three strategies available:
- **Server Wins**: Accept server version
- **Client Wins**: Override server with client
- **Manual Merge**: User resolves conflicts

## Data Flow

### Create Operation (Online)
```
Mobile App → API Service → Controller → Domain Service → Repository → Database
                                                ↓
                                         Audit Log Created
                                                ↓
                                         Response to Client
                                                ↓
                                         Update Local Storage
```

### Create Operation (Offline)
```
Mobile App → Local Storage → Sync Queue
                   ↓
            (Connection Restored)
                   ↓
           Sync Service → API → Database
```

### Read Operation
```
Mobile App → Check Local Storage
      ↓
   Data Found? → Return Data
      ↓
   Data Not Found? → API Request → Database
      ↓
   Cache Locally → Return Data
```

## Synchronization Protocol

### Pull Synchronization
1. Client requests data with `last_synced_at` timestamp
2. Server returns all records modified after that timestamp
3. Client merges server data with local data based on version numbers
4. Higher version number wins in case of conflict
5. Conflicts flagged for user resolution

### Push Synchronization
1. Client sends queued operations to server
2. Server validates each operation
3. For creates: Check idempotency key to prevent duplicates
4. For updates: Check version number for conflicts
5. Server processes valid operations
6. Server returns success/conflict status for each operation
7. Client updates local storage and removes successfully synced items from queue

## Idempotency

### Payment Idempotency
Each payment has a unique `idempotency_key`:
```
idempotency_key = device_id + timestamp + random_string
```

When a payment is submitted:
1. Server checks if a payment with the same idempotency key exists
2. If exists, returns the existing payment (no duplicate charge)
3. If not exists, creates the new payment
4. This ensures retries don't create duplicate payments

### API Idempotency
All state-changing operations (POST, PUT, DELETE) include:
- Unique request ID
- Timestamp
- Version number (for updates)

## Version Management

### Rate Versioning
Rates are immutable once created. Updates create new versions:
```
Rate v1: $100, effective 2024-01-01 to 2024-06-30
Rate v2: $120, effective 2024-07-01 onwards
```

Benefits:
- Historical rate tracking
- Audit trail for rate changes
- No impact on existing payments

### Entity Versioning
All entities (Collections, Payments, Rates) have version numbers:
- Starts at 1 on creation
- Increments on each update
- Used for conflict detection during sync

## Access Control

### RBAC (Role-Based Access Control)
Roles define sets of permissions:
- **Admin**: Full access to all resources
- **Manager**: Create/read/update collections and payments
- **Collector**: Create payments, read collections
- **Viewer**: Read-only access

### ABAC (Attribute-Based Access Control)
Fine-grained permissions based on:
- User attributes (role, department, region)
- Resource attributes (status, created_by, collection_id)
- Environment attributes (time, device, location)

Example: User can only update payments they created

## Audit Logging

Every change is logged with:
- User ID and name
- Action performed (created, updated, deleted, synced)
- Old values (for updates)
- New values
- IP address
- User agent
- Device ID
- Timestamp

This provides:
- Complete audit trail
- Regulatory compliance
- Debugging capability
- User activity tracking

## Data Models

### Collection
```typescript
{
  uuid: string           // Unique identifier
  name: string           // Collection name
  description: string    // Optional description
  status: enum           // active, inactive, archived
  version: number        // Version for conflict detection
  created_by: number     // User who created
  synced_at: timestamp   // Last sync time
  device_id: string      // Source device
}
```

### Payment
```typescript
{
  uuid: string                    // Unique identifier
  payment_reference: string       // Unique reference
  collection_id: number           // Parent collection
  rate_id: number                 // Applied rate
  payer_id: number                // User who paid
  amount: decimal                 // Payment amount
  currency: string                // Currency code
  status: enum                    // pending, completed, failed
  payment_method: enum            // cash, card, transfer
  idempotency_key: string         // For duplicate prevention
  version: number                 // Version number
  is_automated: boolean           // Auto-generated?
  synced_at: timestamp           // Last sync time
}
```

### Rate
```typescript
{
  uuid: string              // Unique identifier
  name: string              // Rate name
  amount: decimal           // Rate amount
  currency: string          // Currency code
  rate_type: string         // monthly, annual, one-time
  version: number           // Version number
  effective_from: timestamp // Start date
  effective_until: timestamp // End date (optional)
  is_active: boolean        // Active flag
}
```

## Security Considerations

### Authentication
- Token-based authentication (Laravel Sanctum)
- Tokens stored in secure storage on device
- Token refresh mechanism
- Automatic logout on token expiry

### Data Security
- HTTPS for all API communication
- SQL injection prevention via ORM
- XSS prevention via input sanitization
- CSRF protection for state-changing operations
- Rate limiting to prevent abuse

### Device Security
- Secure storage for authentication tokens
- Local database encryption (optional)
- Biometric authentication (optional)
- Remote wipe capability (optional)

## Performance Optimization

### Backend
- Database indexing on frequently queried fields
- Query optimization with eager loading
- Caching for static data (rates, collections)
- Queue workers for background jobs
- API response pagination

### Mobile
- Lazy loading for large lists
- Image optimization and caching
- Debouncing for search inputs
- Optimistic UI updates
- Background sync scheduling

## Scalability

### Horizontal Scaling
- Stateless API design
- Load balancer for multiple app servers
- Separate queue workers
- CDN for static assets

### Vertical Scaling
- Database query optimization
- Connection pooling
- Redis for caching
- Database read replicas

## Monitoring and Logging

### Backend Monitoring
- API response times
- Database query performance
- Error rates and types
- User activity metrics
- Sync success/failure rates

### Mobile Monitoring
- Crash reports
- Network errors
- Sync performance
- User engagement metrics
- Device/OS distribution

## Future Enhancements

1. **Real-time Sync**: WebSocket support for instant updates
2. **Conflict AI**: Machine learning for automatic conflict resolution
3. **Bulk Operations**: Batch processing for large datasets
4. **Export/Import**: CSV/Excel import/export functionality
5. **Reporting**: Built-in analytics and reports
6. **Multi-tenancy**: Support for multiple organizations
7. **Geolocation**: Location-based features
8. **Notifications**: Push notifications for important events
9. **Offline Maps**: Cached maps for field operations
10. **Biometric Auth**: Fingerprint/Face ID authentication

## Deployment Architecture

```
                    ┌─────────────┐
                    │   CDN       │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │Load Balancer│
                    └──────┬──────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   ┌────▼────┐                          ┌────▼────┐
   │ Web App │                          │ Web App │
   │ Server  │                          │ Server  │
   └────┬────┘                          └────┬────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Database   │
                    │  (Primary)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Database   │
                    │  (Replica)  │
                    └─────────────┘
```

## Testing Strategy

### Unit Tests
- Domain entities and services
- Repository implementations
- API controllers
- Mobile services

### Integration Tests
- API endpoints
- Database operations
- Sync operations
- Authentication flow

### End-to-End Tests
- Complete user workflows
- Offline scenarios
- Conflict resolution
- Multi-device sync

## Maintenance

### Regular Tasks
- Database backups (daily)
- Log rotation (weekly)
- Dependency updates (monthly)
- Security patches (as needed)
- Performance monitoring (continuous)

### Code Quality
- PSR-12 coding standards (PHP)
- ESLint/Prettier (TypeScript)
- Automated tests on CI/CD
- Code reviews for all changes
- Documentation updates
