# FieldPay Architecture Documentation

## Overview
FieldPay is a comprehensive offline-first data collection and payment management system designed for field workers in low-connectivity environments.

## Technology Stack

### Backend
- **Framework**: Laravel 12.x
- **Authentication**: JWT (tymon/jwt-auth)
- **Database**: PostgreSQL/MySQL with versioning support
- **Architecture**: Clean Architecture with SOLID principles

### Frontend
- **Framework**: React Native with Expo
- **State Management**: Context API with offline-first architecture
- **Local Database**: SQLite / Async Storage
- **Sync Engine**: Custom conflict resolution

## Database Schema

### Core Tables

#### Users & Authorization
- **users**: User accounts with UUID, soft deletes, ABAC attributes
- **roles**: Role definitions with ABAC support
- **permissions**: Granular permissions with resource-action model
- **role_user**: Many-to-many pivot (User-Role)
- **permission_role**: Many-to-many pivot (Permission-Role)

#### Business Entities
- **suppliers**: Supplier profiles (name, email, phone, location, metadata)
- **products**: Product catalog with units and categories
- **product_rates**: Versioned, time-based pricing (valid_from, valid_to)
- **collections**: Collection records with supplier, collector, timestamp
- **collection_items**: Individual product entries with historical rates
- **payments**: Payment records (advance, partial, full, adjustment)
- **payment_transactions**: Ledger-style transaction log
- **sync_logs**: Synchronization tracking with conflict detection

### Offline-First Features
All major tables include:
- `uuid`: Globally unique identifier for offline creation
- `synced_at`: Last synchronization timestamp
- `device_id`: Device that created/modified record
- `version`: Optimistic locking version number
- `client_created_at`: Original creation timestamp on device

### Conflict Resolution
- **Version-based**: Using optimistic locking
- **Timestamp-based**: Client vs server timestamps
- **User-guided**: For complex conflicts requiring human intervention
- **Automatic**: Last-write-wins for simple conflicts

## API Architecture

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - JWT token generation
- `POST /api/auth/logout` - Token invalidation
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Current user profile

### Resource Endpoints (RESTful)
- `/api/suppliers` - Supplier CRUD
- `/api/products` - Product CRUD
- `/api/product-rates` - Rate management with versioning
- `/api/collections` - Collection entry and management
- `/api/payments` - Payment processing
- `/api/payment-transactions` - Transaction history

### Sync Endpoints
- `POST /api/sync/push` - Push offline changes
- `GET /api/sync/pull` - Pull server changes since last sync
- `POST /api/sync/resolve-conflict` - Manual conflict resolution
- `GET /api/sync/status` - Sync status for device

### Authorization Strategy
- **RBAC**: Role-based access (Admin, Manager, Collector, Viewer)
- **ABAC**: Attribute-based (location, department, time-based rules)
- **Resource-level**: Fine-grained permissions per resource action
- **Offline enforcement**: Rules cached on device with periodic refresh

## Frontend Architecture

### Screen Structure
```
App
├── Auth
│   ├── Login
│   └── Register
├── Dashboard
│   └── Overview (stats, recent activity)
├── Suppliers
│   ├── List
│   ├── Create/Edit
│   └── Detail (with collections and balance)
├── Products
│   ├── List
│   └── Create/Edit
├── Rates
│   ├── List (admin only)
│   ├── Create/Edit (with versioning)
│   └── History
├── Collections
│   ├── List
│   ├── Create (with offline support)
│   └── Detail
├── Payments
│   ├── List
│   ├── Create
│   └── Detail
└── Sync
    ├── Status
    ├── Conflicts (resolution UI)
    └── Settings
```

### State Management
- **Auth Context**: User authentication state
- **Offline Context**: Network status, queue management
- **Data Context**: Cached data with optimistic updates
- **Sync Context**: Sync state and conflict management

### Offline Queue
1. **Action Recording**: All CUD operations recorded
2. **Optimistic UI**: Immediate UI update with pending indicator
3. **Auto Sync**: Trigger on connectivity restore
4. **Retry Logic**: Exponential backoff for failed syncs
5. **Conflict UI**: User-friendly conflict resolution

## Security Considerations

### Data Protection
- **Encryption at Rest**: SQLCipher for mobile database
- **Encryption in Transit**: HTTPS/TLS for API calls
- **Token Security**: JWT with short expiration, refresh tokens
- **Input Validation**: Server and client-side validation
- **SQL Injection**: Eloquent ORM with prepared statements
- **XSS Prevention**: React Native built-in protection

### Authentication Flow
1. User logs in → JWT token issued (access + refresh)
2. Token stored securely (Keychain/KeyStore)
3. API calls include Authorization header
4. Token refresh before expiration
5. Logout clears tokens and local sensitive data

### Authorization Flow
1. User permissions loaded on login
2. Cached locally with encrypted storage
3. Route guards check permissions
4. API validates permissions on server
5. Offline: Use cached permissions with periodic refresh

## Rate Management Strategy

### Version Control
- Each rate change creates new version
- Previous versions remain for historical accuracy
- `valid_from` and `valid_to` define active period
- Collections reference specific rate version

### Rate Application Logic
```
1. Collection created → Find active rate at collection timestamp
2. Rate not found → Use default/manual entry
3. Rate stored with collection item (denormalized)
4. Historical reports use stored rates
5. Rate updates don't affect past collections
```

### Admin Interface
- View all rates with version history
- Create new rate (auto-increments version)
- Set validity period
- Preview affected future collections
- Audit log of rate changes

## Payment Calculation

### Automated Calculation
```
Total Owed = SUM(collection_items.amount) for supplier
Total Paid = SUM(payments.amount WHERE status='confirmed') for supplier
Balance = Total Owed - Total Paid
```

### Transaction Ledger
- Every collection creates DEBIT transaction
- Every payment creates CREDIT transaction
- Running balance maintained in real-time
- Prevents data inconsistency

### Payment Types
- **Advance**: Payment before collection (creates credit balance)
- **Partial**: Partial settlement of outstanding balance
- **Full**: Complete settlement
- **Adjustment**: Administrative corrections

## Sync Strategy

### Pull Sync (Server → Client)
1. Client sends last_sync_timestamp
2. Server returns all changes since timestamp
3. Client applies changes with conflict detection
4. Client updates last_sync_timestamp

### Push Sync (Client → Server)
1. Client sends queued changes with device_id and uuid
2. Server checks for conflicts (version mismatch)
3. For conflicts: Return conflict data
4. For success: Update server records
5. Return confirmation with server version

### Conflict Detection
```
1. Check if record exists with same UUID
2. Compare versions
3. If version mismatch → Conflict
4. Check timestamps (server vs client)
5. Apply resolution strategy
```

### Resolution Strategies
- **Auto (Last-Write-Wins)**: Use latest timestamp
- **Server-Wins**: Always prefer server version
- **Client-Wins**: Prefer client for specific fields
- **Manual**: Present both versions to user

## Development Guidelines

### Code Quality
- Follow PSR-12 coding standards (PHP)
- Use TypeScript for React Native
- ESLint + Prettier for JavaScript/TypeScript
- PHPStan/Psalm for static analysis
- Comprehensive PHPDoc comments

### Testing Strategy
- Unit tests for business logic
- Feature tests for API endpoints
- Integration tests for sync logic
- E2E tests for critical workflows
- Minimum 80% code coverage

### Git Workflow
- Feature branches from main
- PR required for merging
- Code review mandatory
- CI/CD pipeline runs tests
- Semantic versioning

## Deployment

### Backend
```bash
# Production environment
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

### Frontend
```bash
# Build for production
eas build --platform all
# Or for web
npm run build
```

### Environment Variables
- Database credentials
- JWT secret
- API endpoints
- Feature flags
- Encryption keys

## Monitoring & Logging

### Backend Logging
- API request/response logging
- Error logging with stack traces
- Sync operation logs
- Authentication attempts
- Performance metrics

### Frontend Logging
- Crash reporting (Sentry)
- Analytics (optional)
- Sync errors
- Offline queue status
- Performance monitoring

## Scalability Considerations

### Backend
- Database indexing on UUID, timestamps, foreign keys
- Query optimization with eager loading
- Caching layer (Redis) for frequently accessed data
- Queue system (Laravel Queue) for async tasks
- Horizontal scaling with load balancer

### Frontend
- Pagination for large lists
- Virtual scrolling for long lists
- Image optimization and caching
- Background sync limits
- Local database cleanup for old data

## Future Enhancements

### Planned Features
- Multi-currency support
- Biometric authentication
- Photo attachments for collections
- GPS tracking for collection locations
- Advanced reporting and analytics
- Export to PDF/Excel
- Push notifications
- Multi-language support

### Technical Debt
- Implement GraphQL for flexible queries
- Add WebSocket for real-time sync
- Implement CDC (Change Data Capture)
- Add comprehensive audit trail
- Implement data archival strategy
