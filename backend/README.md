# TrackVault Backend API

Production-ready backend API for the TrackVault Data Collection and Payment Management System.

## Architecture

This backend follows **Clean Architecture** principles with clear separation of concerns:

```
backend/
├── src/
│   ├── Domain/           # Business logic and entities
│   │   ├── Entities/     # Core business entities
│   │   ├── ValueObjects/ # Immutable value objects
│   │   ├── Repositories/ # Repository interfaces
│   │   └── Services/     # Domain services
│   ├── Application/      # Use cases and DTOs
│   ├── Infrastructure/   # External concerns (DB, security, etc.)
│   └── Presentation/     # API controllers and routes
├── config/               # Configuration files
├── database/             # Database migrations
├── public/               # Web-accessible entry point
└── tests/                # Unit and integration tests
```

## Features

- **CRUD Operations**: Full support for Users, Suppliers, Products, Collections, and Payments
- **Multi-Unit Support**: Track quantities in multiple units (kg, g, liters, etc.)
- **Versioned Rates**: Historical rate management with automatic application
- **Payment Calculations**: Automated payment calculations based on collections and prior payments
- **RBAC/ABAC**: Role-based and attribute-based access control
- **Data Integrity**: Transactional operations with version control
- **Audit Logging**: Complete audit trail for all operations
- **Security**: Encrypted data at rest and in transit

## Requirements

- PHP 8.2 or higher
- MySQL 5.7+ or PostgreSQL 12+
- Composer (for dependency management)

## Installation

1. **Clone the repository**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   composer install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and security keys
   ```

4. **Run database migrations**:
   ```bash
   # Execute migrations in database/migrations/
   mysql -u username -p database_name < database/migrations/001_create_tables.sql
   ```

5. **Start the development server**:
   ```bash
   php -S localhost:8000 -t public
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check API health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `GET /api/suppliers/{id}` - Get supplier details
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/products` - Create new product
- `POST /api/products/{id}/rates` - Add rate to product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Collections
- `GET /api/collections` - List all collections
- `GET /api/collections/{id}` - Get collection details
- `GET /api/collections?supplier_id={id}` - Filter by supplier
- `GET /api/collections?product_id={id}` - Filter by product
- `POST /api/collections` - Create new collection
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

### Payments
- `GET /api/payments` - List all payments
- `GET /api/payments/{id}` - Get payment details
- `GET /api/payments?supplier_id={id}` - Filter by supplier
- `GET /api/payments/calculate/{supplier_id}` - Calculate total owed
- `POST /api/payments` - Create new payment
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

## Security

- All endpoints (except `/api/health`) require authentication
- JWT tokens are used for authentication
- Passwords are hashed using Argon2id
- Data is encrypted at rest and in transit (HTTPS required in production)
- RBAC and ABAC enforce proper authorization

## Testing

Run tests:
```bash
composer test
```

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Generate secure random strings for `JWT_SECRET` and `ENCRYPTION_KEY`
4. Configure proper database credentials
5. Enable HTTPS
6. Configure CORS for your frontend domain
7. Set up proper logging and monitoring

## License

MIT
