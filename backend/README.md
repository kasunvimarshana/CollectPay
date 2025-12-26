# Ledgerly Backend

Laravel-based backend for the Ledgerly Data Collection and Payment Management System.

## Architecture

This backend follows **Clean Architecture** principles with clear separation of concerns:

### Layers

1. **Domain Layer** (`app/Domain/`)
   - **Entities**: Core business entities (User, Supplier, Product, Collection, Payment)
   - **Repositories**: Repository interfaces defining data access contracts
   - **Services**: Domain services containing pure business logic

2. **Application Layer** (`app/Application/`)
   - **UseCases**: Application-specific business rules and orchestration
   - **DTOs**: Data Transfer Objects for inter-layer communication

3. **Infrastructure Layer** (`app/Infrastructure/`)
   - **Persistence**: Concrete repository implementations, Eloquent models
   - **Security**: Authentication, authorization (RBAC/ABAC), encryption
   - **Http**: Controllers, middleware, request validation

## Key Features

- **Multi-user & Multi-device Support**: Concurrent operations with optimistic locking
- **Multi-unit Quantity Tracking**: Support for kg, g, liters, etc.
- **Versioned Product Rates**: Historical rate preservation with temporal validity
- **Automated Payment Calculations**: Based on collections, rates, and prior payments
- **RBAC & ABAC Authorization**: Role and attribute-based access control
- **Data Integrity**: Transactional operations, validation, audit trails
- **Encryption**: Data encrypted at rest and in transit

## Core Entities

### User
- Authentication credentials
- Roles and permissions (RBAC/ABAC)
- Audit timestamps

### Supplier
- Detailed profile information
- Contact details
- Multi-unit collection history

### Product
- Name and description
- Versioned rates with effective dates
- Unit of measurement support

### Collection
- Supplier reference
- Product reference
- Quantity (multi-unit support)
- Applied rate (historical preservation)
- Collection timestamp
- Collector user reference

### Payment
- Supplier reference
- Payment type (advance, partial, final)
- Amount
- Payment timestamp
- Reference to related collections

## Database Schema

The database uses MySQL/PostgreSQL with the following core tables:

- `users`: User accounts with roles
- `suppliers`: Supplier profiles
- `products`: Product catalog with current rates
- `product_rates`: Historical product rates with version tracking
- `collections`: Collection records with multi-unit quantities
- `payments`: Payment transactions
- `audit_logs`: Comprehensive audit trail

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/{id}/rates` - Get product rate history

### Collections
- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection
- `GET /api/collections/{id}` - Get collection details
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection
- `GET /api/collections/by-supplier/{supplierId}` - Get collections by supplier

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment details
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment
- `GET /api/payments/calculate/{supplierId}` - Calculate total payment for supplier

## Security

### Authentication
- Laravel Sanctum for API token authentication
- Secure password hashing (bcrypt)
- Token expiration and refresh mechanism

### Authorization
- **RBAC**: Role-based access control (Admin, Manager, Collector)
- **ABAC**: Attribute-based policies for fine-grained control
- Middleware for route protection

### Data Protection
- Encrypted sensitive fields in database
- HTTPS-only communication
- SQL injection prevention via Eloquent ORM
- CSRF protection
- Rate limiting

### Audit Trail
- All CRUD operations logged
- User actions tracked
- Timestamp and IP address recording

## Installation

```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed initial data (optional)
php artisan db:seed

# Start development server
php artisan serve
```

## Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

## Design Principles

### Clean Architecture
- Dependency inversion: Core domain independent of frameworks
- Clear layer boundaries
- Testable business logic

### SOLID Principles
- **S**ingle Responsibility: Each class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable
- **I**nterface Segregation: Many specific interfaces over general ones
- **D**ependency Inversion: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)
- Reusable services and helpers
- Trait composition for common behaviors

### KISS (Keep It Simple, Stupid)
- Straightforward implementations
- Minimal external dependencies
- Clear, readable code

## Concurrency Handling

### Optimistic Locking
- Version column on critical tables
- Concurrent update detection
- Retry mechanism for conflicts

### Transaction Management
- Database transactions for consistency
- Rollback on failure
- Isolation level configuration

## Performance Optimization

- Database indexing on foreign keys and search columns
- Query optimization with eager loading
- Caching for frequently accessed data
- API response pagination

## Deployment

Recommended deployment configuration:
- PHP 8.1+
- MySQL 8.0+ or PostgreSQL 13+
- Redis for caching and queues
- HTTPS with valid SSL certificate
- Monitoring and logging infrastructure
