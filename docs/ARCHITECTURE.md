# FieldSyncLedger - Architecture Documentation

## System Overview

FieldSyncLedger is a production-ready, offline-first data collection and payment management application designed for scenarios like agricultural product collection (e.g., tea leaves) where reliable internet connectivity cannot be guaranteed.

### Key Features

- **Offline-First Architecture**: Full CRUD operations work seamlessly offline
- **Automatic Synchronization**: Event-driven sync on network restoration, app foregrounding, and authentication
- **Conflict Resolution**: Deterministic conflict handling using versioning and timestamps
- **Historical Rate Management**: Preserves exact rates applied at collection time
- **Multi-User Support**: Concurrent access across multiple devices with strong consistency
- **Secure**: End-to-end encryption, RBAC/ABAC, tamper-resistant sync
- **Payment Calculation**: Automated, auditable payment calculations from historical data

## Technology Stack

### Backend (Laravel)
- **Framework**: Laravel 10.x
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum (JWT tokens)
- **Architecture**: Clean Architecture with Domain-Driven Design

### Frontend (React Native)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Local Storage**: SQLite (expo-sqlite)
- **Secure Storage**: Expo SecureStore
- **State Management**: Zustand
- **Architecture**: Clean Architecture with separation of concerns

## Architecture Layers

### Backend Architecture

```
backend/
├── app/
│   ├── Domain/                    # Core business logic
│   │   ├── Entities/              # Domain entities
│   │   ├── ValueObjects/          # Value objects
│   │   ├── Repositories/          # Repository interfaces
│   │   ├── Services/              # Domain services
│   │   └── Events/                # Domain events
│   ├── Application/               # Application logic
│   │   ├── UseCases/              # Use case implementations
│   │   ├── DTOs/                  # Data transfer objects
│   │   └── Services/              # Application services
│   ├── Infrastructure/            # External integrations
│   │   ├── Persistence/           # Database implementations
│   │   ├── Repositories/          # Repository implementations
│   │   ├── Http/                  # HTTP clients
│   │   ├── Auth/                  # Authentication
│   │   └── Encryption/            # Encryption services
│   ├── Http/                      # HTTP layer
│   │   ├── Controllers/           # API controllers
│   │   ├── Middleware/            # Middleware
│   │   ├── Requests/              # Form requests
│   │   └── Resources/             # API resources
│   └── Models/                    # Eloquent models
├── database/
│   ├── migrations/                # Database migrations
│   ├── seeders/                   # Database seeders
│   └── factories/                 # Model factories
├── routes/
│   └── api.php                    # API routes
├── config/                        # Configuration files
└── tests/                         # Tests
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── domain/                    # Core business logic
│   │   ├── entities/              # Domain entity interfaces
│   │   ├── repositories/          # Repository interfaces
│   │   └── services/              # Domain services
│   ├── application/               # Application logic
│   │   ├── useCases/              # Use case implementations
│   │   ├── dtos/                  # Data transfer objects
│   │   └── services/              # Application services
│   ├── infrastructure/            # External integrations
│   │   ├── api/                   # API client
│   │   ├── database/              # SQLite repositories
│   │   ├── storage/               # Secure storage
│   │   └── sync/                  # Sync service
│   └── presentation/              # UI layer
│       ├── screens/               # Screen components
│       ├── components/            # Reusable components
│       ├── navigation/            # Navigation configuration
│       └── hooks/                 # Custom React hooks
├── app/                           # Expo Router screens
└── assets/                        # Static assets
```

## Core Entities

### User
- Represents system users with authentication and role information
- Roles: admin, collector, viewer
- Supports RBAC/ABAC with permissions array

### Supplier
- Represents suppliers from whom products are collected
- Unique supplier code for identification
- Contains contact information and notes

### Product
- Represents product types (e.g., tea leaves, coffee beans)
- Includes unit of measurement (kg, g, liters, etc.)
- Supports multiple rate versions over time

### RateVersion
- Time-based versioning of product rates
- Preserves historical rates for accurate calculations
- Supports effective date ranges

### Collection
- Records quantity collected from a supplier
- Captures and denormalizes the applied rate at collection time
- Includes idempotency key for duplicate prevention
- Tracks sync status (pending, synced, conflict, error)

### Payment
- Records payments made to suppliers
- Types: advance, partial, final
- Includes idempotency key for duplicate prevention
- Tracks sync status

## Synchronization Protocol

### Pull Mechanism
1. Client requests changes since last sync timestamp
2. Server returns all entities updated after that timestamp
3. Client merges changes into local database
4. Handles deleted items via soft deletes

### Push Mechanism
1. Client collects all pending local changes
2. Sends changes in batches to server
3. Server processes each change:
   - Checks idempotency key (for collections/payments)
   - Performs version conflict detection
   - Applies changes transactionally
4. Returns success, conflicts, and errors
5. Client marks successfully synced items

### Conflict Resolution
- **Version-based**: Compares version numbers
- **Server-wins**: Server version takes precedence for critical data
- **Last-write-wins**: For non-critical updates with timestamps
- **Manual resolution**: UI prompts for complex conflicts

### Idempotency
- Collections and payments use unique idempotency keys
- Prevents duplicate entries during network retries
- Server checks idempotency key before inserting

## Data Flow

### Collection Creation (Offline)
1. User enters collection data
2. System retrieves latest rate for product
3. Creates collection with applied rate
4. Saves to local SQLite with sync_status='pending'
5. Collection appears immediately in UI

### Collection Creation (Online)
1. User enters collection data
2. System retrieves latest rate
3. Creates collection locally
4. Immediately syncs to server
5. Updates local record on success

### Sync Triggers
- **Network restoration**: Automatic sync when connectivity returns
- **App foreground**: Sync when app becomes active
- **Successful authentication**: Sync after login
- **Manual**: User-initiated sync button

## Security

### Backend Security
- JWT authentication via Laravel Sanctum
- RBAC with role-based permissions
- SQL injection prevention via query builder
- CSRF protection on state-changing operations
- Rate limiting on API endpoints
- Encrypted data at rest (database encryption)
- HTTPS for data in transit

### Frontend Security
- Secure token storage via Expo SecureStore
- Local SQLite encryption (configurable)
- Tamper-resistant sync payloads with checksums
- Certificate pinning for API calls
- Input validation and sanitization
- No sensitive data in logs

## Payment Calculation

The payment calculation service computes accurate balances:

```
Balance Due = Total Collection Value - Total Payments

Where:
- Total Collection Value = Σ(quantity × applied_rate) for all collections
- Total Payments = Σ(amount) for all payments
```

Features:
- Filters by date range
- Groups by supplier and product
- Maintains audit trail
- Handles partial payments
- Tracks advance payments

## Database Schema

See migrations in `backend/database/migrations/` for complete schema definitions.

Key relationships:
- User → Suppliers (one-to-many)
- User → Products (one-to-many)
- Product → RateVersions (one-to-many)
- Supplier → Collections (one-to-many)
- Supplier → Payments (one-to-many)
- Collection → RateVersion (many-to-one)

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login and get token
- GET `/api/auth/user` - Get authenticated user
- POST `/api/auth/logout` - Logout and revoke token

### Suppliers
- GET `/api/suppliers` - List all suppliers
- GET `/api/suppliers/{id}` - Get supplier details
- POST `/api/suppliers` - Create supplier
- PUT `/api/suppliers/{id}` - Update supplier
- DELETE `/api/suppliers/{id}` - Delete supplier (soft delete)

### Products
- GET `/api/products` - List all products
- GET `/api/products/{id}` - Get product details
- POST `/api/products` - Create product
- PUT `/api/products/{id}` - Update product
- DELETE `/api/products/{id}` - Delete product (soft delete)

### Sync
- GET `/api/sync/pull?since={timestamp}` - Pull changes from server
- POST `/api/sync/push` - Push local changes to server

## Deployment

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- PHP 8.1+ and Composer (for backend development)

### Quick Start

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Start services with Docker:
   ```bash
   docker-compose up -d
   ```

4. Run migrations:
   ```bash
   docker-compose exec backend php artisan migrate
   ```

5. Generate app key:
   ```bash
   docker-compose exec backend php artisan key:generate
   ```

6. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

7. Start Expo:
   ```bash
   npm start
   ```

## Testing

### Backend Tests
```bash
cd backend
php artisan test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Best Practices

### Code Style
- Follow PSR-12 for PHP
- Follow TypeScript ESLint rules for frontend
- Use meaningful variable and function names
- Add JSDoc/PHPDoc comments for complex logic

### Git Workflow
- Feature branches for new features
- Pull requests for code review
- Descriptive commit messages
- Keep commits atomic and focused

### Performance
- Batch sync operations
- Use pagination for large datasets
- Optimize database queries with indexes
- Minimize API payload sizes
- Cache frequently accessed data

## Troubleshooting

### Sync Issues
- Check network connectivity
- Verify authentication token validity
- Review sync logs on server
- Check for version conflicts in UI

### Database Issues
- Verify migrations are up to date
- Check database connection settings
- Review error logs for SQL errors

### Mobile App Issues
- Clear app cache and data
- Reinstall the app
- Check SQLite database integrity
- Review console logs in development

## Support and Maintenance

- Regular security updates
- Database backup strategy
- Monitoring and logging
- Performance optimization
- User feedback integration

## License

MIT License - See LICENSE file for details
