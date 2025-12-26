# PayMaster Backend API

Production-ready RESTful API for data collection and payment management.

## Architecture

This backend follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── Domain/              # Core business logic (framework-independent)
│   ├── Entities/       # Business entities
│   ├── Repositories/   # Repository interfaces
│   ├── Services/       # Domain services
│   └── ValueObjects/   # Value objects
├── Application/         # Application business rules
│   ├── UseCases/       # Use case implementations
│   ├── DTOs/           # Data Transfer Objects
│   ├── Services/       # Application services
│   └── Mappers/        # Entity-DTO mappers
├── Infrastructure/      # External concerns
│   ├── Persistence/    # Database implementations
│   ├── Http/           # HTTP adapters
│   ├── Auth/           # Authentication implementations
│   ├── Encryption/     # Encryption services
│   └── Logging/        # Logging implementations
└── Presentation/        # API presentation layer
    └── Http/
        └── Controllers/ # HTTP controllers
```

## Core Features

### 1. User Management
- CRUD operations for users
- RBAC (Role-Based Access Control)
- ABAC (Attribute-Based Access Control)
- Roles: admin, manager, collector
- Permissions: manage_users, manage_rates, make_payments

### 2. Supplier Management
- Comprehensive supplier profiles
- Regional organization
- Status tracking (active/inactive)
- Unique supplier codes

### 3. Product Management
- Multi-unit support (kg, g, lbs, items, etc.)
- Product categorization
- Status tracking

### 4. Rate Management (Versioned & Immutable)
- Time-based rate versions
- Historical immutability - rates are NEVER modified
- Automatic rate selection based on collection date
- Rate history tracking

### 5. Collection Management
- Daily collection recording
- Automatic rate application
- Immutable rate snapshots
- Multi-user concurrent operations
- Offline sync support with unique sync IDs

### 6. Payment Management
- Advance payments
- Partial payments
- Final payments
- Payment history tracking
- Automatic balance calculations

### 7. Automated Financial Calculations
- Real-time balance calculations
- Historical payment tracking
- Audit trail for all transactions
- Supplier-specific financial summaries

### 8. Synchronization Support
- Offline-first architecture support
- Conflict detection and resolution
- Version-based optimistic locking
- Sync logging and tracking

## API Endpoints

### Authentication
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/logout          - Logout user
GET    /api/auth/me              - Get authenticated user
```

### Users
```
GET    /api/users                - List all users
GET    /api/users/{id}           - Get user by ID
POST   /api/users                - Create user (admin only)
PUT    /api/users/{id}           - Update user
DELETE /api/users/{id}           - Delete user (admin only)
```

### Suppliers
```
GET    /api/suppliers            - List all suppliers
GET    /api/suppliers/{id}       - Get supplier by ID
POST   /api/suppliers            - Create supplier
PUT    /api/suppliers/{id}       - Update supplier
DELETE /api/suppliers/{id}       - Delete supplier
GET    /api/suppliers/{id}/balance - Get supplier balance
```

### Products
```
GET    /api/products             - List all products
GET    /api/products/{id}        - Get product by ID
POST   /api/products             - Create product
PUT    /api/products/{id}        - Update product
DELETE /api/products/{id}        - Delete product
```

### Product Rates
```
GET    /api/products/{id}/rates       - Get all rates for product
GET    /api/rates/{id}                - Get rate by ID
POST   /api/products/{id}/rates       - Create new rate (auto-versions)
GET    /api/products/{id}/rates/current - Get current active rate
GET    /api/products/{id}/rates/history - Get rate history
```

### Collections
```
GET    /api/collections          - List all collections
GET    /api/collections/{id}     - Get collection by ID
POST   /api/collections          - Create collection
PUT    /api/collections/{id}     - Update collection
DELETE /api/collections/{id}     - Delete collection
POST   /api/collections/sync     - Batch sync collections (offline support)
```

### Payments
```
GET    /api/payments             - List all payments
GET    /api/payments/{id}        - Get payment by ID
POST   /api/payments             - Create payment
PUT    /api/payments/{id}        - Update payment
DELETE /api/payments/{id}        - Delete payment
POST   /api/payments/sync        - Batch sync payments (offline support)
```

### Reports & Calculations
```
GET    /api/reports/supplier-balance/{id}  - Get supplier balance
GET    /api/reports/supplier-summary/{id}  - Get detailed supplier summary
GET    /api/reports/period-summary         - Get period summary for all suppliers
```

## Security

### Authentication
- Token-based authentication (Laravel Sanctum)
- Secure password hashing (bcrypt)
- Session management

### Authorization
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Permission-based endpoint protection

### Data Security
- HTTPS enforcement
- Input validation and sanitization
- SQL injection prevention (PDO/prepared statements)
- XSS protection
- CSRF protection
- Rate limiting

### Encryption
- Password hashing (bcrypt)
- Secure token generation
- Optional data encryption at rest

## Concurrency & Conflict Resolution

### Optimistic Locking
- Version field on all mutable entities
- Automatic version increment on updates
- Conflict detection via version mismatch

### Timestamp-Based Conflict Detection
- `updated_at` timestamps
- Last-write-wins with version validation
- Conflict resolution strategies

### Sync ID Management
- Unique sync IDs for offline-created records
- Idempotent sync operations
- Duplicate detection and prevention

## Database

### Schema Design
- Normalized database structure
- Foreign key constraints
- Appropriate indexes for performance
- Full-text search support (optional)

### Migrations
- Version-controlled schema changes
- Forward-only migrations
- Seeders for initial data

### Transactions
- ACID compliance
- Transaction support for multi-step operations
- Rollback on failure

## Performance Optimization

### Database
- Indexed queries
- Query optimization
- Connection pooling
- Lazy loading

### Caching (Optional)
- Query result caching
- API response caching
- Rate caching for frequent lookups

## Testing

### Unit Tests
- Domain entity tests
- Service layer tests
- Repository tests

### Integration Tests
- API endpoint tests
- Database integration tests
- Authentication tests

### Feature Tests
- End-to-end workflows
- Sync operation tests
- Conflict resolution tests

## Deployment

### Requirements
- PHP 8.1+
- MySQL 8.0+ or MariaDB 10.5+
- Composer
- Web server (Apache/Nginx)

### Environment Variables
```
APP_NAME=PayMaster
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paymaster
DB_USERNAME=your_username
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
```

### Setup Steps
1. Clone repository
2. Run `composer install`
3. Copy `.env.example` to `.env` and configure
4. Run migrations: `php artisan migrate`
5. Seed initial data: `php artisan db:seed`
6. Configure web server
7. Set proper file permissions
8. Enable HTTPS

## Monitoring & Logging

### Logging
- Application logs
- Error logs
- Sync operation logs
- Audit trail logs

### Monitoring
- API performance metrics
- Database query performance
- Error tracking
- User activity tracking

## Maintenance

### Backup
- Regular database backups
- Backup verification
- Disaster recovery plan

### Updates
- Security patches
- Dependency updates
- Database maintenance

## Support

For issues and questions, please refer to the project repository.

## License

MIT License
