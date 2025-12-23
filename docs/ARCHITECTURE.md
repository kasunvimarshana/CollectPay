# TransacTrack Architecture

## Overview

TransacTrack is built with an offline-first architecture, ensuring field workers can operate seamlessly in low-connectivity environments while maintaining data integrity and security.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React     │  │   SQLite     │  │   Network    │      │
│  │  Native/    │◄─┤   Database   │  │  Monitoring  │      │
│  │   Expo      │  │  (Offline)   │  │              │      │
│  └──────┬──────┘  └──────────────┘  └──────┬───────┘      │
│         │                                    │              │
│         │         ┌──────────────┐          │              │
│         └────────►│  Sync Queue  │◄─────────┘              │
│                   └──────┬───────┘                          │
└──────────────────────────┼──────────────────────────────────┘
                           │
                    ┌──────▼───────┐
                    │   REST API   │
                    └──────┬───────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                 Laravel Backend                              │
│                           │                                  │
│  ┌────────────┐    ┌─────▼──────┐    ┌──────────────┐     │
│  │   Sanctum  │◄───┤ Controllers │───►│   Models     │     │
│  │    Auth    │    │   (API)     │    │  (Eloquent)  │     │
│  └────────────┘    └─────┬──────┘    └──────┬───────┘     │
│                           │                   │              │
│  ┌────────────┐    ┌─────▼──────┐    ┌──────▼───────┐     │
│  │   RBAC/    │    │   Sync     │    │   Database   │     │
│  │   ABAC     │    │  Service   │    │ (SQLite/SQL) │     │
│  │ Middleware │    │            │    │              │     │
│  └────────────┘    └────────────┘    └──────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (React Native/Expo)

#### 1. Data Layer
- **SQLite Database**: Local persistent storage for offline operations
- **Sync Queue**: Tracks pending operations for server synchronization
- **AsyncStorage**: Secure storage for tokens and user preferences

#### 2. Business Logic Layer
- **Context Providers**:
  - `AuthContext`: User authentication and session management
  - `NetworkContext`: Network monitoring and synchronization
- **API Services**: HTTP client wrapper for backend communication
- **Database Services**: SQLite operations and queries

#### 3. Presentation Layer
- **Screens**: Feature-specific UI components
- **Components**: Reusable UI elements
- **Navigation**: React Navigation stack and tab navigators

### Backend (Laravel)

#### 1. API Layer
- **Controllers**: Handle HTTP requests and responses
- **Middleware**: Authentication, authorization, and request processing
- **Routes**: RESTful API endpoint definitions

#### 2. Business Logic Layer
- **Models**: Eloquent ORM for database interactions
- **Services**: Complex business logic and calculations
- **Observers**: Event listeners for model changes

#### 3. Data Layer
- **Migrations**: Database schema definitions
- **Seeders**: Sample and default data
- **Relationships**: Eloquent model relationships

## Offline-First Strategy

### Data Flow

#### When Online:
```
User Action → Local Database → Sync Queue → Server API → Server Database
                    ↓
              Immediate UI Update
```

#### When Offline:
```
User Action → Local Database → Sync Queue (Pending)
                    ↓
              Immediate UI Update
```

#### Sync Process:
```
Connection Restored → Read Sync Queue → Push to Server → Update Local Database
                                                ↓
                                         Pull Server Updates
```

### Conflict Resolution

1. **Detection**: Compare timestamps and version numbers
2. **Strategy**: 
   - **Last-Write-Wins**: Default for non-critical data
   - **Manual Resolution**: For critical conflicts (admin approval required)
   - **Merge**: Combine non-conflicting changes

## Security Architecture

### Authentication & Authorization

#### Authentication Flow:
```
1. User Login → Sanctum Token Generation
2. Token Storage → Secure AsyncStorage
3. API Requests → Bearer Token Authentication
4. Token Validation → Middleware Check
```

#### Authorization Layers:
1. **RBAC (Role-Based Access Control)**:
   - Admin: Full system access
   - Manager: Supplier, payment, report access
   - Collector: Collection entry, supplier viewing
   - Viewer: Read-only access

2. **ABAC (Attribute-Based Access Control)**:
   - Fine-grained permissions based on user attributes
   - District-level access control
   - Resource-specific permissions

### Data Security

1. **In Transit**:
   - HTTPS/TLS encryption
   - Token-based authentication
   - Request signing (optional)

2. **At Rest**:
   - Encrypted SQLite database
   - Secure token storage
   - Hashed passwords (bcrypt)

3. **Audit Trail**:
   - All operations logged
   - User attribution
   - Timestamp tracking
   - Change history

## Database Schema

### Key Entities

1. **Users**: Authentication and authorization
2. **Suppliers**: Customer/supplier information
3. **Products**: Items being collected
4. **Product Rates**: Versioned pricing information
5. **Collections**: Product collection transactions
6. **Payments**: Payment transactions
7. **Supplier Balances**: Cached balance calculations
8. **Sync Queue**: Offline synchronization tracking
9. **Audit Logs**: System audit trail

### Relationships

```
Users ─┬─ Creates ─► Collections
       ├─ Creates ─► Payments
       └─ Creates ─► Suppliers

Suppliers ─┬─ Has Many ─► Collections
           ├─ Has Many ─► Payments
           └─ Has One ──► Supplier Balance

Products ─┬─ Has Many ─► Product Rates
          └─ Has Many ─► Collections

Collections ─┬─ Belongs To ─► Supplier
             ├─ Belongs To ─► Product
             ├─ Belongs To ─► User (Collector)
             └─ Belongs To ─► Product Rate

Payments ─┬─ Belongs To ─► Supplier
          └─ Belongs To ─► User (Processor)
```

## Sync Architecture

### Synchronization Workflow

1. **Change Detection**:
   - Monitor local database changes
   - Add to sync queue with UUID
   - Mark as pending

2. **Network Monitoring**:
   - Continuous connectivity check
   - Trigger sync on connection restore
   - Periodic background sync

3. **Push Phase**:
   - Batch pending changes
   - Send to server with client UUID
   - Handle responses (success/conflict/error)

4. **Conflict Resolution**:
   - Detect conflicts by UUID
   - Apply resolution strategy
   - Update local database

5. **Pull Phase**:
   - Request updates since last sync
   - Apply server changes locally
   - Update sync timestamp

### Sync Queue States

- **Pending**: Waiting for network
- **Processing**: Currently syncing
- **Completed**: Successfully synced
- **Conflict**: Requires resolution
- **Failed**: Error occurred, retry later

## Performance Optimization

### Frontend
- **Local caching**: Reduce API calls
- **Lazy loading**: Load data on demand
- **Pagination**: Handle large datasets
- **Debouncing**: Optimize search inputs
- **Batch operations**: Group sync requests

### Backend
- **Database indexing**: Optimize queries
- **Eager loading**: Reduce N+1 queries
- **Query caching**: Cache frequent queries
- **API pagination**: Limit response size
- **Queue jobs**: Async processing

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancer compatible
- Session management via tokens

### Vertical Scaling
- Efficient database queries
- Optimized migrations
- Resource monitoring

### Data Management
- Archival strategy for old data
- Backup and recovery procedures
- Data retention policies

## Monitoring & Logging

### Application Logging
- Error tracking
- Performance metrics
- User activity logs
- API request logs

### Audit Logging
- All CRUD operations
- User authentication events
- Permission changes
- Data modifications

## Deployment Architecture

### Development
```
Local → SQLite → PHP Built-in Server
Frontend → Expo Go → Local API
```

### Production
```
Mobile Apps → CDN/App Stores
     ↓
API Gateway/Load Balancer
     ↓
Application Servers (PHP-FPM)
     ↓
Database (MySQL/PostgreSQL)
     ↓
File Storage (S3/Local)
```

## Technology Stack Rationale

### Backend: Laravel
- Mature ecosystem
- Built-in authentication (Sanctum)
- Eloquent ORM
- Strong community support
- LTS versions available

### Frontend: React Native/Expo
- Cross-platform (iOS/Android)
- Native performance
- Over-the-air updates
- Rich ecosystem
- Simplified development

### Database: SQLite (Mobile) / MySQL (Server)
- SQLite: Lightweight, embedded, offline-capable
- MySQL: Robust, scalable, production-ready

## Future Enhancements

1. **Real-time Updates**: WebSocket integration
2. **Biometric Auth**: Fingerprint/Face ID
3. **Geofencing**: Location-based features
4. **Push Notifications**: Alert system
5. **Advanced Analytics**: Reporting dashboard
6. **Multi-language**: i18n support
7. **Backup/Restore**: Data export/import
8. **API Rate Limiting**: Enhanced security
