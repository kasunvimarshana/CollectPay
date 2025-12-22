# CollectPay System Architecture

## Overview

CollectPay is a comprehensive, offline-first data collection and payment management system built with a modern microservices architecture.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile Clients                           │
│                    (React Native / Expo)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   iOS App    │  │ Android App  │  │   Web App    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             │ HTTPS / API Calls
                             │
          ┌──────────────────▼──────────────────┐
          │         API Gateway / CORS          │
          └──────────────────┬──────────────────┘
                             │
          ┌──────────────────▼──────────────────┐
          │      Laravel Backend (API)          │
          │                                     │
          │  ┌────────────────────────────┐    │
          │  │   Authentication Layer     │    │
          │  │   (Laravel Sanctum/JWT)    │    │
          │  └────────────┬───────────────┘    │
          │               │                     │
          │  ┌────────────▼───────────────┐    │
          │  │   Authorization Layer      │    │
          │  │   (RBAC & ABAC Middleware) │    │
          │  └────────────┬───────────────┘    │
          │               │                     │
          │  ┌────────────▼───────────────┐    │
          │  │   API Controllers          │    │
          │  │  - Auth Controller         │    │
          │  │  - Collection Controller   │    │
          │  │  - Payment Controller      │    │
          │  │  - Supplier Controller     │    │
          │  │  - Product Controller      │    │
          │  │  - Rate Controller         │    │
          │  │  - Sync Controller         │    │
          │  └────────────┬───────────────┘    │
          │               │                     │
          │  ┌────────────▼───────────────┐    │
          │  │   Business Logic Layer     │    │
          │  │   (Eloquent Models)        │    │
          │  └────────────┬───────────────┘    │
          └───────────────┼─────────────────────┘
                          │
          ┌───────────────▼─────────────────┐
          │      Database Layer             │
          │                                 │
          │  ┌──────────────────────────┐  │
          │  │   MySQL Database         │  │
          │  │  - users                 │  │
          │  │  - suppliers             │  │
          │  │  - products              │  │
          │  │  - rates                 │  │
          │  │  - collections           │  │
          │  │  - payments              │  │
          │  │  - sync_logs             │  │
          │  └──────────────────────────┘  │
          └─────────────────────────────────┘
```

## Mobile App Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Native App                             │
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐     │
│  │                  Presentation Layer                    │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │     │
│  │  │  Login   │  │   Home   │  │  Collection Form │    │     │
│  │  │  Screen  │  │  Screen  │  │     Screen       │    │     │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │     │
│  │  ┌──────────┐  ┌──────────┐                          │     │
│  │  │ Payment  │  │   Sync   │                          │     │
│  │  │  Screen  │  │  Screen  │                          │     │
│  │  └──────────┘  └──────────┘                          │     │
│  └─────────────────────┬─────────────────────────────────┘     │
│                        │                                        │
│  ┌─────────────────────▼─────────────────────────────────┐     │
│  │                  Context Layer                         │     │
│  │  ┌──────────────────────────────────────────────┐     │     │
│  │  │  Auth Context (User State Management)        │     │     │
│  │  └──────────────────────────────────────────────┘     │     │
│  └─────────────────────┬─────────────────────────────────┘     │
│                        │                                        │
│  ┌─────────────────────▼─────────────────────────────────┐     │
│  │                  Service Layer                         │     │
│  │  ┌────────────┐  ┌──────────┐  ┌──────────────┐      │     │
│  │  │    API     │  │   Sync   │  │   Database   │      │     │
│  │  │  Service   │  │  Service │  │   Service    │      │     │
│  │  └────────────┘  └──────────┘  └──────────────┘      │     │
│  └─────────────────────┬─────────────────────────────────┘     │
│                        │                                        │
│  ┌─────────────────────▼─────────────────────────────────┐     │
│  │              Local Database Layer                      │     │
│  │            (WatermelonDB / SQLite)                     │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │     │
│  │  │ Suppliers│  │ Products │  │   Rates  │           │     │
│  │  └──────────┘  └──────────┘  └──────────┘           │     │
│  │  ┌──────────┐  ┌──────────┐                         │     │
│  │  │Collections│  │ Payments │                         │     │
│  │  └──────────┘  └──────────┘                         │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Online Mode - Collection Creation

```
User Input → Collection Form → Validation
    ↓
Save to Local DB (WatermelonDB)
    ↓
API Service → POST /api/collections → Backend
    ↓
Backend Validation → Save to MySQL → Return Response
    ↓
Update Local DB with server ID and sync timestamp
```

### 2. Offline Mode - Collection Creation

```
User Input → Collection Form → Validation
    ↓
Generate UUID (client_id)
    ↓
Save to Local DB (WatermelonDB)
    ↓
Mark as "not synced" (synced_at = null)
    ↓
Continue offline operation
```

### 3. Sync Process

```
User triggers sync OR Auto-sync when online
    ↓
Check connectivity
    ↓
Gather unsynced records (synced_at = null OR updated_at > synced_at)
    ↓
POST /api/sync/collections with batch data
    ↓
Backend processes each record:
    - Check for existing by client_id
    - If exists: Compare versions
        - Server version >= Client version: Conflict
        - Server version < Client version: Update
    - If not exists: Create new
    ↓
Return sync results with status for each record
    ↓
Mobile app processes results:
    - Created/Updated: Mark as synced
    - Conflict: Notify user OR apply server-wins strategy
    ↓
Pull server updates (GET /api/sync/updates)
    ↓
Update local DB with server changes
```

## Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. POST /api/login with credentials
   ↓
3. Backend validates credentials
   ↓
4. Generate JWT token (Laravel Sanctum)
   ↓
5. Return user info + token
   ↓
6. Mobile stores token in SecureStore (encrypted)
   ↓
7. All subsequent requests include: Authorization: Bearer <token>
```

### Authorization Flow

```
Request with Token
   ↓
Sanctum Middleware validates token
   ↓
CheckRole Middleware (RBAC)
   - Checks user.role in allowed roles
   ↓
CheckPermission Middleware (ABAC)
   - Checks user.permissions for specific permission
   ↓
Controller Action
   - Additional business logic checks
   ↓
Response
```

## Database Schema

### Core Entities

```
┌──────────────┐      ┌──────────────┐
│    users     │      │   suppliers  │
├──────────────┤      ├──────────────┤
│ id           │      │ id           │
│ name         │      │ name         │
│ email        │      │ code         │
│ password     │      │ phone        │
│ role         │      │ address      │
│ permissions  │      │ area         │
│ is_active    │      │ is_active    │
└──────┬───────┘      └──────┬───────┘
       │                     │
       │                     │
       │              ┌──────▼───────┐
       │              │   products   │
       │              ├──────────────┤
       │              │ id           │
       │              │ name         │
       │              │ code         │
       │              │ unit         │
       │              │ is_active    │
       │              └──────┬───────┘
       │                     │
       │              ┌──────▼───────┐
       │              │    rates     │
       │              ├──────────────┤
       │              │ id           │
       │              │ product_id   │
       │              │ supplier_id  │
       │              │ rate         │
       │              │ effective_*  │
       │              └──────────────┘
       │
┌──────▼───────────────────┐
│     collections          │
├──────────────────────────┤
│ id                       │
│ client_id (UUID)         │
│ user_id    ──────────────┼───┐
│ supplier_id              │   │
│ product_id               │   │
│ quantity                 │   │
│ rate                     │   │
│ amount                   │   │
│ collection_date          │   │
│ version (conflict)       │   │
│ synced_at                │   │
└──────────────────────────┘   │
                               │
┌──────▼─────────────────────┐ │
│       payments             │ │
├────────────────────────────┤ │
│ id                         │ │
│ client_id (UUID)           │ │
│ user_id   ─────────────────┼─┘
│ supplier_id                │
│ collection_id (optional)   │
│ payment_type               │
│ amount                     │
│ payment_date               │
│ version (conflict)         │
│ synced_at                  │
└────────────────────────────┘
```

## Technology Stack

### Backend
- **Framework**: Laravel 11
- **Language**: PHP 8.2+
- **Database**: MySQL 8.0
- **Cache**: Redis (optional)
- **Authentication**: Laravel Sanctum (JWT)
- **ORM**: Eloquent

### Frontend
- **Framework**: React Native
- **Runtime**: Expo SDK 52
- **Language**: TypeScript
- **Local DB**: WatermelonDB (SQLite)
- **State Management**: React Context
- **Navigation**: React Navigation
- **Secure Storage**: Expo SecureStore
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker / Docker Compose
- **Web Server**: Nginx (production)
- **Process Manager**: Supervisor (queue workers)
- **SSL**: Let's Encrypt / Certbot

## Scalability Considerations

### Horizontal Scaling
- Load balancer distributing requests across multiple backend instances
- Read replicas for database (MySQL replication)
- Redis for distributed cache and sessions

### Vertical Scaling
- Database indexing (already implemented)
- Query optimization with eager loading
- API response caching
- Database connection pooling

### Performance Optimization
- Pagination on all list endpoints (50 items default)
- Lazy loading in mobile app
- Image optimization (if photos added)
- Background sync using queue workers
- CDN for static assets

## Offline-First Strategy

### Conflict Resolution
1. **Version-based**: Each record has a version number
2. **Server-wins**: In case of conflict, server version takes precedence
3. **User notification**: User informed of conflicts
4. **Future**: Custom resolution strategies

### Sync Strategy
1. **Manual**: User-triggered sync
2. **Automatic**: On app open, on network restore
3. **Background**: Periodic background sync (future)
4. **Selective**: Sync only changed records

## Monitoring & Observability

### Logs
- **Application Logs**: Laravel log files
- **Web Server Logs**: Nginx access/error logs
- **Queue Logs**: Worker process logs
- **Sync Logs**: Database table for sync history

### Metrics (Future)
- API response times
- Sync success/failure rates
- User activity metrics
- Database performance metrics

### Alerts (Future)
- Failed sync attempts
- High error rates
- Database connection issues
- Server resource limits

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│          Production Environment          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     Load Balancer (Nginx)       │   │
│  │     (SSL Termination)           │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│     ┌───────┴────────┐                  │
│     │                │                  │
│  ┌──▼───┐        ┌──▼───┐              │
│  │ App  │        │ App  │              │
│  │Server│        │Server│              │
│  │  #1  │        │  #2  │              │
│  └──┬───┘        └──┬───┘              │
│     │               │                  │
│     └───────┬───────┘                  │
│             │                           │
│  ┌──────────▼──────────────┐           │
│  │   MySQL Master          │           │
│  │   (Read/Write)          │           │
│  └──────────┬──────────────┘           │
│             │                           │
│  ┌──────────▼──────────────┐           │
│  │   MySQL Replica         │           │
│  │   (Read Only)           │           │
│  └─────────────────────────┘           │
│                                         │
│  ┌─────────────────────────┐           │
│  │   Redis Cache           │           │
│  └─────────────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

## Future Enhancements

1. **GraphQL API**: For more efficient data fetching
2. **WebSockets**: Real-time updates
3. **Microservices**: Split into separate services
4. **Message Queue**: RabbitMQ for async operations
5. **Elasticsearch**: Advanced search capabilities
6. **Analytics**: Comprehensive analytics dashboard
7. **Mobile Notifications**: Push notifications
8. **Backup Service**: Automated backups to cloud storage

---

**Document Version**: 1.0  
**Last Updated**: 2024-12-22  
**Author**: CollectPay Team
