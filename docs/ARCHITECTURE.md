# CollectPay Architecture Documentation

## System Architecture Overview

CollectPay follows a **Clean Architecture** pattern with clear separation between domain logic, data access, and presentation layers. The system is designed as an **offline-first** application with **controlled auto-sync** capabilities.

## Architecture Layers

### 1. Domain Layer (Core Business Logic)
- **Entities**: Pure business objects (Supplier, Product, Rate, Collection, Payment)
- **Use Cases**: Application-specific business rules
- **Independent**: No dependencies on external frameworks or libraries

### 2. Data Layer (Data Management)
- **Repositories**: Abstract data access patterns
- **Local Storage**: SQLite database for offline data
- **Remote API**: Backend communication layer
- **Sync Service**: Bidirectional synchronization engine

### 3. Presentation Layer (UI/UX)
- **Screens**: User interface components
- **Components**: Reusable UI elements
- **Navigation**: App routing and navigation
- **State Management**: Local state handling

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens    │  │  Components  │  │  Navigation  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Entities   │  │  Use Cases   │                         │
│  └──────────────┘  └──────────────┘                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Repositories │  │Local Storage │  │  Remote API  │      │
│  │              │  │   (SQLite)   │  │   (Laravel)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │            Sync Service                          │       │
│  │  • Conflict Resolution                           │       │
│  │  • Optimistic Locking                            │       │
│  │  • Idempotent Operations                         │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Synchronization Architecture

### Sync Lifecycle

1. **Network Detection**
   - Continuous monitoring of network state
   - Event-driven triggers (not polling)
   - Connection quality assessment

2. **Sync Initiation**
   - Network regain event
   - App foreground event
   - Successful authentication
   - Manual user trigger

3. **Push Phase**
   - Collect pending local changes
   - Batch operations (100 items)
   - Version and timestamp validation
   - Send to server

4. **Server Processing**
   - Receive and validate data
   - Check for conflicts (version, timestamp)
   - Apply changes transactionally
   - Return results

5. **Conflict Resolution**
   - Version mismatch detection
   - Timestamp comparison
   - Server-wins strategy (default)
   - Notify user of conflicts

6. **Pull Phase**
   - Request server changes since last sync
   - Entity-specific filtering
   - User-specific data scoping
   - Batch retrieval

7. **Local Application**
   - Apply server changes locally
   - Update sync status
   - Increment version numbers
   - Update last sync timestamp

### Conflict Resolution Strategy

#### 1. Optimistic Locking (Version-Based)
```
Client Version: 5
Server Version: 6
→ Conflict detected (server wins)
```

#### 2. Timestamp Comparison
```
Client Updated: 2024-01-15 10:00:00
Server Updated: 2024-01-15 10:05:00
→ Server data is newer (server wins)
```

#### 3. UUID-Based Idempotency
```
Client UUID: abc-123-def
Server has same UUID → Skip (already synced)
```

## Database Architecture

### Local Database (SQLite)

```sql
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  suppliers  │────<│ collections │>────│  products   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  payments   │     │    rates    │     │ sync_queue  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Key Features
- **Normalized Design**: Third normal form
- **Indexed Queries**: Fast lookups and searches
- **Foreign Keys**: Referential integrity
- **Soft Deletes**: Audit trail preservation
- **Version Control**: Optimistic locking support

## Security Architecture

### Authentication Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Mobile  │          │  Backend │          │ Database │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │  POST /auth/login   │                     │
     │────────────────────>│                     │
     │                     │  Verify Credentials │
     │                     │────────────────────>│
     │                     │                     │
     │                     │<────────────────────│
     │                     │  Generate JWT Token │
     │                     │                     │
     │   JWT + User Data   │                     │
     │<────────────────────│                     │
     │                     │                     │
     │  Store in SecureStore                     │
     │                     │                     │
     │  API Request + Token│                     │
     │────────────────────>│                     │
     │                     │  Validate Token     │
     │                     │                     │
     │                     │  Process Request    │
     │                     │────────────────────>│
     │                     │                     │
     │      Response       │                     │
     │<────────────────────│                     │
```

### Data Encryption

1. **At Rest**
   - SQLite database encryption
   - SecureStore for tokens
   - Encrypted sensitive fields

2. **In Transit**
   - HTTPS/TLS 1.3
   - Certificate pinning (optional)
   - Encrypted payloads

3. **Access Control**
   - JWT token validation
   - Role-based permissions (RBAC)
   - Attribute-based permissions (ABAC)

## Rate Management System

### Rate Versioning

Rates are time-versioned to ensure historical accuracy:

```
Product: Milk
┌──────────────────────────────────────────────────┐
│ Rate 1: $5.00  │  2024-01-01 → 2024-01-31       │
│ Rate 2: $5.50  │  2024-02-01 → 2024-02-29       │
│ Rate 3: $6.00  │  2024-03-01 → (ongoing)        │
└──────────────────────────────────────────────────┘

Collection on 2024-01-15 → Uses Rate 1 ($5.00)
Collection on 2024-02-15 → Uses Rate 2 ($5.50)
Collection on 2024-03-15 → Uses Rate 3 ($6.00)
```

### Rate Application Logic

1. **Online Mode**
   - Fetch current rate from server
   - Apply to new collection
   - Store rate_id for reference

2. **Offline Mode**
   - Query local rate database
   - Filter by effective date range
   - Apply matching rate
   - Queue for validation on sync

3. **Sync Reconciliation**
   - Verify rate was valid
   - Recalculate if rate changed
   - Flag discrepancies
   - Maintain audit trail

## Payment Calculation Engine

### Balance Calculation

```javascript
Supplier Balance = Total Collections - Total Payments

Example:
Collections:
  Day 1: 100 kg × $5.00 = $500
  Day 2: 150 kg × $5.00 = $750
  Day 3: 120 kg × $5.50 = $660
  Total: $1,910

Payments:
  Payment 1: $500 (advance)
  Payment 2: $800 (partial)
  Total: $1,300

Balance: $1,910 - $1,300 = $610
```

### Payment Types

1. **Advance**: Payment before collection
2. **Partial**: Payment less than balance
3. **Full**: Payment clears balance
4. **Adjustment**: Correction payment

## Network Architecture

### Connection Monitoring

```
┌─────────────────────────────────────┐
│      Network Service                │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Connection State Monitor    │  │
│  │  • Check every 5 seconds     │  │
│  │  • Event-driven notifications│  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Connection Quality          │  │
│  │  • WiFi: Excellent           │  │
│  │  • Cellular: Good            │  │
│  │  • Offline: Poor             │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Performance Considerations

### Optimization Strategies

1. **Database**
   - Indexed columns for fast queries
   - Prepared statements
   - Connection pooling
   - Query result caching

2. **Sync**
   - Batch operations (100 items)
   - Incremental sync (only changes)
   - Background processing
   - Retry with exponential backoff

3. **UI**
   - Virtual lists for large datasets
   - Lazy loading
   - Optimistic updates
   - Loading indicators

## Scalability

### Horizontal Scaling

- Stateless API servers
- Load balancer distribution
- Shared database cluster
- Redis cache layer

### Vertical Scaling

- Database indexing
- Query optimization
- Connection pooling
- Resource allocation

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - Off-site storage

2. **Local Data**
   - Export functionality
   - Cloud backup integration
   - Restore from backup

3. **Audit Trail**
   - All operations logged
   - Version history preserved
   - Change tracking

## Monitoring & Observability

### Metrics

- API response times
- Sync success rates
- Conflict frequency
- Error rates
- User activity

### Logging

- Application logs
- Error tracking
- Sync operations
- Authentication events
- Data modifications

## Compliance & Standards

- **GDPR**: Data privacy and protection
- **PCI DSS**: Payment data security (if applicable)
- **OWASP**: Security best practices
- **ISO 27001**: Information security management

## Future Enhancements

1. **Real-time Sync**: WebSocket-based live updates
2. **Advanced Conflict Resolution**: Custom merge strategies
3. **Offline Reports**: Local report generation
4. **Multi-language Support**: Internationalization
5. **Advanced Analytics**: Business intelligence features
6. **Biometric Authentication**: Fingerprint/Face ID
7. **Export Capabilities**: PDF, Excel, CSV exports
8. **Bulk Operations**: Mass data import/export

---

This architecture ensures:
- ✅ Data integrity across all operations
- ✅ Zero data loss guarantee
- ✅ Seamless offline/online transitions
- ✅ Scalable and maintainable codebase
- ✅ Production-ready implementation
