# FieldLedger Architecture Documentation

## Overview

FieldLedger is a comprehensive, secure, and production-ready data collection and payment management application designed for offline-first operations with robust online synchronization capabilities.

## Architecture Principles

### Clean Architecture
- **Separation of Concerns**: Clear boundaries between layers
- **Dependency Inversion**: High-level modules independent of low-level modules
- **Single Responsibility**: Each component has one well-defined purpose
- **Open/Closed Principle**: Open for extension, closed for modification
- **DRY (Don't Repeat Yourself)**: Code reuse and minimal duplication

### Offline-First Strategy
1. **Local-First Operations**: All user actions persist locally immediately
2. **Background Synchronization**: Automatic sync when network available
3. **Conflict Resolution**: Deterministic conflict detection and resolution
4. **Zero Data Loss**: Guaranteed data persistence and recovery

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              User Interface Layer                     │  │
│  │  (React Native Components, Screens, Navigation)      │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │           State Management Layer                      │  │
│  │         (Zustand Stores: Auth, Network, Data)        │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │            Service Layer                              │  │
│  │   (Sync Manager, Data Validators, Calculators)       │  │
│  └─────────┬──────────────────────────┬─────────────────┘  │
│            │                          │                      │
│  ┌─────────▼─────────┐    ┌──────────▼──────────┐         │
│  │  Local Database   │    │    API Client       │         │
│  │   (SQLite)        │    │     (Axios)         │         │
│  └───────────────────┘    └──────────┬──────────┘         │
└──────────────────────────────────────│───────────────────────┘
                                       │ HTTPS/TLS
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes Layer                         │  │
│  │              (Laravel Routes)                         │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │             Middleware Layer                          │  │
│  │      (Auth, CORS, Rate Limiting, Validation)         │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │            Controller Layer                           │  │
│  │      (Request Handling, Response Formatting)          │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │             Service Layer                             │  │
│  │  (Business Logic, Payment Calculations, Sync)        │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │           Repository Layer                            │  │
│  │         (Data Access, ORM Abstraction)                │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │              Model Layer                              │  │
│  │          (Eloquent Models, Relations)                 │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │             Database Layer                            │  │
│  │              (MySQL/MariaDB)                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Online Mode
```
User Action → UI → State Update → API Request → Server Processing
                                                      ↓
Local DB ← State Update ← Response ← Server Response
```

### Offline Mode
```
User Action → UI → State Update → Local DB
                                     ↓
                              Sync Queue (Pending)
```

### Synchronization
```
Network Detection → Sync Manager → Fetch Queue → API Request
                                                      ↓
                                    Process Response → Update Local DB
                                                      ↓
                                    Conflict? → Resolution Strategy
                                                      ↓
                                    Mark Synced → Update State
```

## Database Schema

### Backend (MySQL)

#### Core Tables
- **users**: User accounts and authentication
- **suppliers**: Supplier master data
- **products**: Product catalog with multi-unit support
- **rates**: Time-based pricing with date ranges
- **transactions**: Collection/purchase records
- **payments**: Payment records
- **devices**: Registered mobile devices
- **sync_queue**: Synchronization tracking
- **audit_logs**: Activity audit trail

### Frontend (SQLite)

#### Local Tables
- **suppliers**: Cached supplier data
- **products**: Cached product catalog
- **transactions**: Local and synced transactions
- **payments**: Local and synced payments
- **sync_queue**: Pending sync operations

## Security Architecture

### Authentication Flow
```
1. User Login → Credentials
2. Server Validation → JWT Token Generation
3. Token + Device Registration
4. Secure Token Storage (SecureStore)
5. All Requests with Bearer Token
6. Server Token Validation
7. Automatic Refresh on Expiry
```

### Authorization
- **RBAC**: Role-based permissions
  - Admin: Full access
  - Manager: Read/Write/Approve
  - Collector: Read/Write own data
  - Viewer: Read-only access
  
- **ABAC**: Attribute-based fine-grained control
  - Resource-level permissions
  - Action-specific rules
  - Context-aware decisions

### Data Security
- **At Rest**: 
  - Local: Expo SecureStore encryption
  - Server: Database encryption
  
- **In Transit**: 
  - HTTPS/TLS 1.3
  - Certificate pinning (optional)
  
- **Application**: 
  - Input validation
  - SQL injection prevention
  - XSS protection
  - CSRF tokens
  - Rate limiting

## Sync Strategy

### Conflict Resolution

#### Server-Wins Strategy (Default)
```
if (server_updated_at > client_synced_at && 
    client_updated_at > client_synced_at) {
    // Conflict detected
    notify_user()
    use_server_version()
    save_client_version_as_backup()
}
```

#### Sync Algorithm
```
1. Check network connectivity
2. Fetch unsynced local records
3. Batch upload to server
4. Process server responses:
   - Created: Mark as synced
   - Updated: Mark as synced
   - Conflict: Apply resolution strategy
   - Error: Increment retry counter
5. Fetch server updates since last sync
6. Apply server updates to local DB
7. Update sync timestamp
```

### Retry Logic
- **Exponential Backoff**: 1s, 2s, 4s, 8s, 16s
- **Max Retries**: 5 attempts
- **Persistent Queue**: Survives app restart
- **Manual Sync**: User-triggered sync option

## Performance Optimization

### Backend
- Database indexing on frequently queried columns
- Query optimization with eager loading
- Response caching where appropriate
- API rate limiting
- Database connection pooling

### Frontend
- React Query for efficient data fetching
- Virtualized lists for large datasets
- Image optimization and caching
- Lazy loading of screens
- Debounced search inputs
- Optimistic updates

## Scalability

### Horizontal Scaling
- Stateless API design
- Load balancer ready
- Session stored in database
- No server-side state

### Database Scaling
- Master-slave replication
- Read replicas
- Connection pooling
- Query optimization
- Proper indexing

### Monitoring
- API response times
- Error rates
- Sync success rates
- Device counts
- Active users

## Testing Strategy

### Backend
- Unit tests for services
- Integration tests for APIs
- Database transaction tests
- Security tests

### Frontend
- Component unit tests
- Integration tests
- E2E tests for critical flows
- Offline scenario tests

## Deployment

### Backend
- Containerized (Docker)
- Environment-based configuration
- Database migrations
- Zero-downtime deployment
- Health check endpoints

### Frontend
- OTA (Over-The-Air) updates
- App store releases
- Version management
- Feature flags

## Maintenance

### Code Quality
- ESLint for JavaScript/TypeScript
- PHP CS Fixer for PHP
- Pre-commit hooks
- Code reviews
- Automated testing

### Documentation
- API documentation (OpenAPI)
- Code comments
- Architecture diagrams
- User manuals
- Deployment guides

## Future Enhancements

1. **Real-time Collaboration**: WebSocket support
2. **Advanced Reporting**: Dashboard analytics
3. **Export/Import**: Data backup and restore
4. **Multi-language**: i18n support
5. **Biometric Auth**: Fingerprint/Face ID
6. **Offline Maps**: Location-based features
7. **Push Notifications**: Real-time alerts
8. **Document Scanning**: OCR integration

## Compliance

- GDPR ready
- Data retention policies
- Privacy controls
- Audit logging
- User consent management
