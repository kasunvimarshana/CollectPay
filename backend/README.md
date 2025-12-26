# FieldLedger Backend API

A secure, production-ready Laravel backend for the FieldLedger data collection and payment management system.

## Features

- **Authentication & Authorization**: Laravel Sanctum with RBAC/ABAC
- **Supplier Management**: Complete CRUD operations for supplier data
- **Product Management**: Multi-unit quantity tracking with alternate units
- **Transaction Management**: Time-based rate tracking and automatic calculations
- **Payment Management**: Advance, partial, and full payment support
- **Offline Sync**: Conflict detection and resolution for multi-device operations
- **Audit Logging**: Comprehensive activity tracking
- **Security**: Encrypted data storage and transmission

## Requirements

- PHP >= 8.2
- MySQL >= 8.0 or MariaDB >= 10.3
- Composer
- Laravel 11.x

## Installation

1. Install dependencies:
```bash
composer install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Configure database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fieldledger
DB_USERNAME=root
DB_PASSWORD=
```

5. Run migrations:
```bash
php artisan migrate
```

6. (Optional) Seed database:
```bash
php artisan db:seed
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login and get token
- `POST /api/logout` - Logout (requires auth)
- `GET /api/me` - Get current user (requires auth)

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/{id}/balance` - Get supplier balance

### Synchronization
- `POST /api/sync/transactions` - Sync transaction data
- `POST /api/sync/payments` - Sync payment data
- `GET /api/sync/updates` - Get updates since last sync

### Health Check
- `GET /api/health` - API health check

## Database Schema

### Users
- Authentication and authorization
- Role-based access control (admin, manager, collector, viewer)
- Attribute-based permissions

### Suppliers
- Supplier information and contact details
- Status tracking (active, inactive, suspended)

### Products
- Product details with multi-unit support
- Base unit and alternate unit conversions

### Rates
- Time-based pricing
- Supplier-specific and default rates
- Valid date ranges

### Transactions
- Purchase/collection records
- Automatic amount calculation
- UUID for offline sync

### Payments
- Payment tracking (advance, partial, full)
- Multiple payment methods
- Reference numbers for reconciliation

### Devices
- Device registration
- Sync status tracking

### Sync Queue
- Conflict detection
- Retry mechanism
- Error logging

## Security Features

1. **Authentication**: Laravel Sanctum token-based authentication
2. **Authorization**: RBAC and ABAC for fine-grained access control
3. **Data Validation**: Comprehensive input validation
4. **SQL Injection Prevention**: Eloquent ORM with prepared statements
5. **XSS Protection**: Built-in Laravel protections
6. **CSRF Protection**: Token-based CSRF protection
7. **Rate Limiting**: API rate limiting
8. **Encrypted Storage**: Sensitive data encryption at rest

## Architecture

The backend follows clean architecture principles:

- **Models**: Eloquent models with relationships
- **Services**: Business logic layer
- **Controllers**: API endpoints and request handling
- **Migrations**: Database schema versioning
- **Middleware**: Authentication and authorization

### Service Layer

- `PaymentCalculationService`: Handles payment calculations and balance tracking
- `SyncService`: Manages offline synchronization and conflict resolution

## Testing

Run tests with PHPUnit:
```bash
php artisan test
```

## Code Quality

Check code style with Laravel Pint:
```bash
./vendor/bin/pint
```

## License

MIT License
