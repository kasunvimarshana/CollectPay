# TrackVault Backend API

Laravel 11 backend API for the TrackVault Data Collection and Payment Management System.

## 🏗️ Architecture

This backend follows **Clean Architecture** principles with clear separation of concerns across four distinct layers. See [CLEAN_ARCHITECTURE.md](CLEAN_ARCHITECTURE.md) for detailed documentation.

### Layer Overview

```
┌─────────────────────────────────────────┐
│     Presentation Layer (Controllers)    │  ← HTTP/API Layer
├─────────────────────────────────────────┤
│   Application Layer (Use Cases, DTOs)   │  ← Business Operations
├─────────────────────────────────────────┤
│ Domain Layer (Entities, Services, VOs)  │  ← Core Business Logic
├─────────────────────────────────────────┤
│ Infrastructure Layer (Repositories, DB)  │  ← Framework & Database
└─────────────────────────────────────────┘
```

### Key Principles

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY**: Don't Repeat Yourself - business logic centralized
- **KISS**: Keep It Simple - clear, focused classes
- **Clean Code**: Readable, maintainable, testable
- **Domain-Driven Design**: Business logic separate from infrastructure

## Overview

This backend provides a RESTful API for managing:
- Users with role-based access control (Admin, Collector, Finance)
- Suppliers with detailed profiles
- Products with versioned rates and multi-unit support
- Collections with automated rate application
- Payments with automated calculations

## Features

- **Authentication**: Laravel Sanctum token-based authentication
- **Authorization**: Role-based (RBAC) and attribute-based (ABAC) access control
- **Data Integrity**: Version-based concurrency control to prevent conflicts
- **Multi-unit Support**: Handle quantities in different units (kg, g, liters, etc.)
- **Rate Versioning**: Historical rate preservation with automatic application
- **Automated Calculations**: Automatic payment calculations based on collections and rates
- **Audit Trail**: Soft deletes and version tracking for all entities

## Prerequisites

- PHP 8.2 or higher
- Composer
- SQLite (default) or MySQL/PostgreSQL

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

4. Run database migrations:
```bash
php artisan migrate
```

5. Seed the database with sample users:
```bash
php artisan db:seed
```

This creates three default users:
- Admin: `admin@trackvault.com` / `password`
- Collector: `collector@trackvault.com` / `password`
- Finance: `finance@trackvault.com` / `password`

## Running the Application

Start the development server:
```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

## API Documentation

### Authentication

**Register**
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password",
  "role": "collector"
}
```

**Login**
```
POST /api/auth/login
{
  "email": "admin@trackvault.com",
  "password": "password"
}
```

**Logout**
```
POST /api/auth/logout
Headers: Authorization: Bearer {token}
```

**Get Current User**
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
```

### Resources

All resource endpoints require authentication via `Authorization: Bearer {token}` header.

**Suppliers**
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

**Products**
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

**Product Rates**
- `GET /api/product-rates` - List rates
- `POST /api/product-rates` - Create rate
- `GET /api/product-rates/{id}` - Get rate
- `PUT /api/product-rates/{id}` - Update rate
- `DELETE /api/product-rates/{id}` - Delete rate

**Collections**
- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection
- `GET /api/collections/{id}` - Get collection
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

**Payments**
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment
- `GET /api/suppliers/{id}/balance` - Get supplier balance

## Database Schema

### Key Tables

- **users**: System users with roles and permissions
- **suppliers**: Supplier profiles with contact information
- **products**: Products with multi-unit support
- **product_rates**: Versioned rates for products by unit and date
- **collections**: Daily collection records with quantities and calculated amounts
- **payments**: Payment records (advance, partial, full)

### Version Control

All entities include a `version` field for optimistic locking to prevent concurrent update conflicts.

## Testing

Run the test suite:
```bash
php artisan test
```

## Architecture

The backend follows Clean Architecture principles:
- **Domain Layer** (`app/Domain/`): Pure business logic with entities, value objects, services, and repository interfaces
- **Application Layer** (`app/Application/`): Use cases, DTOs, and business orchestration
- **Infrastructure Layer** (`app/Infrastructure/`): Repository implementations, database access
- **Presentation Layer** (`app/Http/Controllers/`): Thin controllers handling only HTTP concerns

### Benefits

- **Testability**: Business logic can be tested without database or framework
- **Maintainability**: Clear structure with single responsibility
- **Flexibility**: Easy to swap implementations (e.g., database, cache)
- **Scalability**: Modular architecture supports growth

For complete architecture documentation, see [CLEAN_ARCHITECTURE.md](CLEAN_ARCHITECTURE.md).

## Security

- API authentication via Laravel Sanctum tokens
- Password hashing with bcrypt
- HTTPS required for production
- Role-based access control
- Version-based concurrency control
- Input validation on all endpoints

## License

MIT License

