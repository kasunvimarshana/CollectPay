# Collectix Backend

Laravel-based backend for the Data Collection and Payment Management System.

## Requirements

- PHP 8.2 or higher
- Composer
- MySQL 8.0 or PostgreSQL 13+
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

4. Configure database in `.env` file

5. Run migrations:
```bash
php artisan migrate
```

6. (Optional) Seed database:
```bash
php artisan db:seed
```

## Running the Application

Development server:
```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

## API Documentation

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (requires auth)
- `GET /api/user` - Get authenticated user (requires auth)

### Suppliers

- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/{id}/balance` - Get supplier balance

### Products

- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/{id}/current-rates` - Get current rates
- `POST /api/products/{id}/rates` - Add new rate

### Collections

- `GET /api/collections` - List all collections
- `POST /api/collections` - Create collection
- `GET /api/collections/{id}` - Get collection details
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

### Payments

- `GET /api/payments` - List all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment details
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment
- `POST /api/payments/{id}/approve` - Approve payment

## Security Features

- Laravel Sanctum for API authentication
- Role-Based Access Control (RBAC)
- Encrypted data storage
- HTTPS support
- Optimistic locking for concurrent updates
- Audit logging for all operations

## Architecture

The backend follows Clean Architecture principles with:

- **Models**: Domain entities with business logic
- **Controllers**: API request handling
- **Services**: Business logic layer (to be implemented)
- **Migrations**: Database schema versioning
- **Audit Logs**: Complete transaction history

## Testing

Run tests:
```bash
php artisan test
```

## License

MIT
