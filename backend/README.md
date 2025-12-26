# Paywise Backend API

Laravel backend for the Paywise data collection and payment management application.

## Features

- **RESTful API** with Laravel 11
- **Authentication** using Laravel Sanctum
- **Role-Based Access Control (RBAC)** - Admin, Manager, Collector roles
- **Multi-unit quantity tracking** for collections
- **Versioned product rates** with historical preservation
- **Optimistic locking** for concurrent updates
- **Automated payment calculations** based on collections and rates
- **Soft deletes** for data recovery
- **Transactional operations** for data integrity

## Requirements

- PHP 8.2 or higher
- Composer
- SQLite/MySQL/PostgreSQL
- Laravel 11

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure your database in `.env` (SQLite is configured by default)

6. Run migrations:
```bash
php artisan migrate
```

7. Seed the database with initial users:
```bash
php artisan db:seed
```

## Running the Application

Start the development server:
```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

## Testing the API

You can test the API using:
- **Postman** - Import the endpoints from `API_DOCUMENTATION.md`
- **cURL**
- **HTTPie**

### Example Login Request

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paywise.com","password":"password"}'
```

## Default Users

| Role      | Email                    | Password |
|-----------|--------------------------|----------|
| Admin     | admin@paywise.com        | password |
| Manager   | manager@paywise.com      | password |
| Collector | collector@paywise.com    | password |

## Database Schema

### Core Tables

- **users** - System users with roles
- **suppliers** - Supplier profiles and details
- **products** - Product definitions with units
- **product_rates** - Versioned rates with effective dates
- **collections** - Daily collection records
- **payments** - Payment transactions (advance, partial, full)

### Key Features

- **Optimistic Locking**: `version` field in suppliers, products, collections, and payments
- **Soft Deletes**: All main entities support recovery
- **Foreign Key Constraints**: Maintains referential integrity
- **Indexes**: Optimized for common queries

## API Documentation

See `API_DOCUMENTATION.md` for complete API reference.

## Security Features

- **Token-based authentication** via Laravel Sanctum
- **Password hashing** using bcrypt
- **CSRF protection** for web routes
- **SQL injection prevention** via Eloquent ORM
- **Validation** on all inputs
- **Optimistic locking** prevents lost updates

## Architecture

The backend follows Laravel best practices and Clean Architecture principles:

```
app/
├── Http/
│   └── Controllers/
│       └── Api/          # API controllers
├── Models/               # Eloquent models
└── Providers/           # Service providers

database/
├── migrations/          # Database schema
└── seeders/            # Initial data
```

## Running Tests

```bash
php artisan test
```

## Production Deployment

1. Set up environment variables for production
2. Use a production-grade database (MySQL/PostgreSQL)
3. Enable HTTPS
4. Set `APP_ENV=production` and `APP_DEBUG=false`
5. Configure queue workers for background jobs
6. Set up proper logging and monitoring
7. Use database backups

## License

Proprietary - All rights reserved

