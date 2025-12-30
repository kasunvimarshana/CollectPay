# LedgerFlow Backend

Production-ready backend API for the LedgerFlow Platform following Clean Architecture principles.

## Architecture

This backend follows **Clean Architecture** with clear separation of concerns:

- **Domain Layer**: Business entities and repository interfaces
- **Application Layer**: Use cases and business logic
- **Infrastructure Layer**: Database, HTTP, security implementations
- **Presentation Layer**: API controllers and routes

## Technology Stack

- PHP 8.1+
- Slim Framework 4.x
- SQLite (development) / MySQL/PostgreSQL (production)
- JWT Authentication
- PSR-7, PSR-11, PSR-15 standards

## Directory Structure

```
backend/
├── src/
│   ├── Domain/          # Business logic (framework-independent)
│   ├── Application/     # Use cases and DTOs
│   ├── Infrastructure/  # External services
│   └── Presentation/    # HTTP layer
├── database/
│   ├── schema.sql       # Database schema
│   └── migrations/      # Migration files
├── public/
│   ├── index.php        # Entry point
│   ├── bootstrap.php    # Application bootstrap
│   ├── container.php    # DI configuration
│   ├── middleware.php   # Middleware setup
│   └── routes.php       # Route definitions
├── tests/
├── storage/
│   ├── database.sqlite  # SQLite database (development)
│   └── logs/           # Application logs
└── composer.json
```

## Setup

### Prerequisites

- PHP 8.1 or higher
- Composer
- SQLite extension (or MySQL/PostgreSQL)

### Installation

1. Install dependencies:
```bash
cd backend
composer install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Initialize database:
```bash
# Database is automatically initialized on first request
# Or manually:
sqlite3 storage/database.sqlite < database/schema.sql
```

### Running the Server

Using PHP built-in server:
```bash
cd public
php -S localhost:8080
```

Using Docker (optional):
```bash
docker run -p 8080:8080 -v $(pwd):/app php:8.1-cli php -S 0.0.0.0:8080 -t /app/public
```

### Testing

```bash
composer test
```

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/logout
```

### Users
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
```

### Suppliers
```
GET    /api/v1/suppliers
POST   /api/v1/suppliers
GET    /api/v1/suppliers/{id}
PUT    /api/v1/suppliers/{id}
DELETE /api/v1/suppliers/{id}
```

### Products
```
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
```

### Collections
```
GET    /api/v1/collections
POST   /api/v1/collections
GET    /api/v1/collections/{id}
PUT    /api/v1/collections/{id}
DELETE /api/v1/collections/{id}
```

### Payments
```
GET    /api/v1/payments
POST   /api/v1/payments
GET    /api/v1/payments/{id}
PUT    /api/v1/payments/{id}
DELETE /api/v1/payments/{id}
```

## Security

- JWT-based authentication
- CORS configuration
- Input validation
- SQL injection prevention (PDO prepared statements)
- Password hashing (bcrypt)
- Rate limiting
- Audit logging

## Database Schema

The database includes:
- `users` - User accounts with roles
- `suppliers` - Supplier profiles
- `products` - Product definitions
- `product_rates` - Versioned product rates
- `collections` - Collection records
- `payments` - Payment transactions
- `audit_logs` - Audit trail
- `sync_conflicts` - Offline sync conflict resolution

## Development

### Code Style

Follow PSR-12 coding standards:
```bash
composer analyse
```

### Adding New Features

1. Create domain entities in `src/Domain/Entities/`
2. Define repository interfaces in `src/Domain/Repositories/`
3. Implement use cases in `src/Application/UseCases/`
4. Create repository implementations in `src/Infrastructure/Database/`
5. Add controllers in `src/Presentation/Controllers/`
6. Register routes in `public/routes.php`

## Contributing

1. Follow Clean Architecture principles
2. Maintain SOLID principles
3. Write unit tests for business logic
4. Document API endpoints
5. Keep dependencies minimal

## License

MIT
