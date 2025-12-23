# TransacTrack Backend API

Laravel-based REST API for the TransacTrack data collection and payment management system.

## Features

- **Authentication**: JWT-based authentication using Laravel Sanctum
- **Supplier Management**: Create, read, update, delete supplier profiles with location tracking
- **Product Management**: Manage products with flexible unit types and dynamic pricing
- **Collection Tracking**: Record product collections with automatic payment calculations
- **Payment Management**: Track advance, partial, and full payments
- **Offline Sync**: Robust synchronization with conflict detection and resolution
- **Multi-user Support**: Role-based access control (RBAC) for different user types
- **Data Security**: Encrypted data handling and secure transactions

## Requirements

- PHP >= 8.1
- MySQL >= 5.7 or MariaDB >= 10.3
- Composer

## Installation

1. Copy environment file:
```bash
cp .env.example .env
```

2. Install dependencies:
```bash
composer install
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Configure database in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=transactrack
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

7. Start development server:
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get authenticated user

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Create new supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Collections
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create new collection
- `GET /api/collections/{id}` - Get collection details
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create new payment
- `GET /api/payments/{id}` - Get payment details
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

### Sync
- `POST /api/sync` - Synchronize offline data
- `POST /api/sync/conflicts/{id}/resolve` - Resolve sync conflict

## Security

- All API endpoints (except register/login) require authentication
- Uses Laravel Sanctum for token-based authentication
- CORS configured for cross-origin requests
- Input validation on all endpoints
- SQL injection protection via Eloquent ORM
- XSS protection via Laravel's built-in escape functions

## Architecture

The backend follows clean architecture principles:

- **Models**: Eloquent models representing database entities
- **Controllers**: API controllers handling HTTP requests
- **Migrations**: Database schema definitions
- **Policies**: Authorization logic (RBAC/ABAC)
- **Services**: Business logic layer (to be expanded)
- **Repositories**: Data access layer (to be expanded)

## Database Schema

- `users` - System users with roles
- `suppliers` - Supplier profiles
- `products` - Product catalog
- `product_rates` - Historical product pricing
- `collections` - Product collection records
- `payments` - Payment transactions
- `sync_conflicts` - Conflict tracking for offline sync

## Testing

Run tests with:
```bash
php artisan test
```

## License

MIT License
