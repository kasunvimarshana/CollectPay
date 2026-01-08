# Data Collection and Payment Management API - Backend

Laravel-based REST API with **Swagger/OpenAPI documentation** for managing users, suppliers, products, collections, rates, and payments.

## Features

- ✅ **45 RESTful API Endpoints** with full CRUD operations
- ✅ **Interactive Swagger/OpenAPI Documentation** at `/api/documentation`
- ✅ **JWT Authentication** with token refresh
- ✅ **RBAC/ABAC** - Role-Based and Attribute-Based Access Control
- ✅ **Multi-Unit Tracking** - Support for multiple measurement units
- ✅ **Rate Versioning** - Historical rate preservation
- ✅ **Automated Payment Calculations** - Auditable financial calculations
- ✅ **Optimistic Locking** - Concurrency control for multi-device operations
- ✅ **Audit Logging** - Complete operation tracking
- ✅ **Clean Architecture** - SOLID, DRY, KISS principles

## Quick Start

### Prerequisites
- PHP 8.3+
- Composer 2.x
- SQLite (dev) or MySQL/PostgreSQL (production)

### Installation

```bash
# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# Setup database
touch database/database.sqlite
php artisan migrate:fresh --seed

# Generate Swagger documentation
php artisan l5-swagger:generate

# Start development server
php artisan serve
```

### Default Credentials

- **Admin**: admin@ledger.com / password
- **Collector**: collector@ledger.com / password

## API Documentation

### Interactive Swagger UI
Access the interactive API documentation at:
```
http://localhost:8000/api/documentation
```

Features:
- Browse all 45 endpoints organized by tags
- Test endpoints directly from the browser
- View request/response schemas with examples
- Authenticate with JWT tokens
- Download OpenAPI JSON specification

### Documentation Files
- **Swagger UI**: http://localhost:8000/api/documentation
- **OpenAPI JSON**: http://localhost:8000/docs/api-docs.json
- **Guide**: See [SWAGGER_GUIDE.md](../SWAGGER_GUIDE.md)

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login and get JWT token
- `GET /api/me` - Get authenticated user
- `POST /api/logout` - Logout
- `POST /api/refresh` - Refresh token

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/{id}/balance` - Get balance

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Rates (Versioned)
- `GET /api/rates` - List rates
- `POST /api/rates` - Create rate
- `GET /api/rates/{id}` - Get rate
- `PUT /api/rates/{id}` - Update rate
- `DELETE /api/rates/{id}` - Delete rate

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

## Technology Stack

- **Framework**: Laravel 11
- **PHP**: 8.3+
- **Database**: SQLite (dev), MySQL/PostgreSQL (prod)
- **Authentication**: JWT (tymon/jwt-auth)
- **API Docs**: Swagger/OpenAPI (darkaonline/l5-swagger)
- **Architecture**: Clean Architecture, SOLID principles

## Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --filter=AuthenticationTest

# With coverage
php artisan test --coverage
```

## Security

- JWT Bearer token authentication
- Password hashing with BCrypt
- RBAC/ABAC access control
- SQL injection prevention
- Mass assignment protection
- CSRF protection
- Optimistic locking for concurrency
- Audit logging for all operations

**Security Scan**: ✅ Zero vulnerabilities (CodeQL verified)

## Database Schema

13 tables:
- users, roles, suppliers, products
- rates, collections, payments
- audit_logs
- cache, jobs, sessions
- password_reset_tokens, personal_access_tokens

## Development

### Regenerate Swagger Docs
```bash
php artisan l5-swagger:generate
```

### Clear Caches
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Database Operations
```bash
# Fresh migration with seeders
php artisan migrate:fresh --seed

# Rollback
php artisan migrate:rollback

# Create new migration
php artisan make:migration create_table_name
```

## License

MIT License - See [LICENSE](../LICENSE) file

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Documentation**: Complete with Swagger/OpenAPI
