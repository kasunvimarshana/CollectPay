# LedgerFlow Collections - Backend API

Production-ready Laravel backend for the LedgerFlow Collections application, implementing Clean Architecture principles with SOLID, DRY, and KISS patterns.

## Architecture Overview

This backend follows **Clean Architecture** with clear separation of concerns:

### Domain Layer (`app/Domain/`)
- **Entities**: Core business objects (User, Supplier, Product, ProductRate, Collection, Payment)
- **Value Objects**: Immutable objects representing concepts (Money, Quantity)
- **Repository Interfaces**: Contracts for data access (no framework dependencies)
- **Domain Services**: Business logic that doesn't belong to a single entity

### Application Layer (`app/Application/`)
- **Use Cases**: Application-specific business rules
- **DTOs**: Data Transfer Objects for API communication
- **Services**: Application services orchestrating domain logic
- **Validators**: Input validation logic

### Infrastructure Layer (`app/Infrastructure/`)
- **Persistence**: Repository implementations using Eloquent
- **Security**: Authentication, authorization, encryption services
- **Logging**: Audit trail and system logging

### Presentation Layer (`app/Http/`)
- **Controllers**: Handle HTTP requests/responses
- **Middleware**: Request processing pipeline
- **Resources**: API response transformations

## Key Features

### 1. Multi-Unit Quantity Tracking
- Supports multiple units: kg, g, mg, t, lb, oz, l, ml, unit
- Automatic unit conversions using base unit system
- Precise calculations with 4 decimal places

### 2. Versioned Rate Management
- Historical rate preservation
- Time-based rate validity
- Automatic version incrementing
- Rate auditing and tracking

### 3. Payment Management
- Advance payments
- Partial payments
- Full settlement calculations
- Automated balance calculations

### 4. Multi-User & Multi-Device Support
- Optimistic locking with version numbers
- Conflict detection and resolution
- Concurrent operation handling
- Data integrity safeguards

### 5. Security
- RBAC (Role-Based Access Control)
- ABAC (Attribute-Based Access Control)
- Data encryption at rest and in transit
- Comprehensive audit logging
- Input validation and sanitization

### 6. Audit Trail
- Immutable audit logs
- Track all CRUD operations
- User attribution
- IP address and user agent tracking
- Historical data preservation

## Database Schema

### Core Tables
- `users` - User accounts with roles
- `suppliers` - Supplier profiles
- `products` - Product catalog
- `product_rates` - Versioned product rates
- `collections` - Product collections from suppliers
- `payments` - Payment records
- `audit_logs` - Comprehensive audit trail

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- SQLite/MySQL/PostgreSQL
- Node.js & npm (for asset compilation)

### Setup Steps

1. **Install Dependencies**
```bash
cd backend
composer install
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Database Setup**
```bash
# For SQLite (default)
touch database/database.sqlite

# Run migrations
php artisan migrate

# Optional: Seed demo data
php artisan db:seed
```

4. **Run Development Server**
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Product Rates
- `GET /api/products/{id}/rates` - List product rates
- `POST /api/products/{id}/rates` - Create new rate
- `GET /api/product-rates/{id}` - Get rate
- `PUT /api/product-rates/{id}` - Update rate

### Collections
- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection
- `GET /api/collections/{id}` - Get collection
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment
- `GET /api/suppliers/{id}/payment-summary` - Get payment summary

## Testing

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature
```

## Code Quality

```bash
# Run PHP CodeSniffer
./vendor/bin/phpcs

# Run PHP Stan
./vendor/bin/phpstan analyse

# Run Laravel Pint (code formatter)
./vendor/bin/pint
```

## Domain Models

### User
- Manages user accounts
- Handles roles and permissions
- Tracks active status

### Supplier
- Stores supplier profiles
- Unique supplier codes
- Contact information

### Product
- Product catalog management
- Multi-unit support
- Active/inactive status

### ProductRate
- Versioned rate history
- Time-based validity
- Automatic version tracking

### Collection
- Records product collections
- Multi-unit quantities
- Links to rates for calculations

### Payment
- Payment tracking
- Advance/partial/full types
- Payment method tracking

## Value Objects

### Money
- Immutable financial values
- Currency support (ISO 4217)
- Precise decimal calculations
- Currency-aware operations

### Quantity
- Multi-unit measurements
- Unit conversion support
- Base unit normalization
- Arithmetic operations

## Business Rules

1. **Rate Versioning**: Historical rates are preserved and never modified
2. **Version Control**: All entities use optimistic locking
3. **Audit Trail**: All changes are logged immutably
4. **Data Integrity**: Foreign key constraints ensure referential integrity
5. **Multi-User Safety**: Concurrent operations are handled safely

## Security Considerations

- All passwords are hashed using bcrypt
- API endpoints are protected with authentication
- Role-based access control enforced
- Input validation on all endpoints
- SQL injection prevention via Eloquent ORM
- XSS protection via Laravel's built-in escaping
- CSRF protection enabled
- Rate limiting on API endpoints

## Performance Optimization

- Database indexes on frequently queried columns
- Eager loading to prevent N+1 queries
- Query result caching where appropriate
- Pagination for large datasets

## Deployment

### Production Checklist
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure production database
- [ ] Set up proper logging
- [ ] Enable HTTPS/TLS
- [ ] Configure rate limiting
- [ ] Set up backup strategy
- [ ] Configure monitoring
- [ ] Run `php artisan optimize`
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
