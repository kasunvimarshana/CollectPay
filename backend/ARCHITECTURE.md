# FieldPay Ledger - Laravel Backend

## Architecture Overview

This project implements a **Clean Architecture** backend for a data collection and payment management system using Laravel 10 (LTS).

### Clean Architecture Layers

```
backend/
├── src/
│   ├── Domain/                    # Enterprise Business Rules
│   │   ├── Entities/             # Core business entities
│   │   ├── ValueObjects/         # Immutable value objects
│   │   ├── Repositories/         # Repository interfaces
│   │   ├── Services/             # Domain services
│   │   └── Events/               # Domain events
│   ├── Application/              # Application Business Rules
│   │   ├── UseCases/            # Use case implementations
│   │   ├── DTOs/                # Data Transfer Objects
│   │   └── Contracts/           # Application interfaces
│   └── Infrastructure/           # Frameworks & Drivers
│       ├── Persistence/         # Database implementations
│       ├── Security/            # Security implementations
│       └── Logging/             # Logging implementations
└── app/                         # Laravel Presentation Layer
    └── Http/                    # Controllers, Middleware, Resources
```

## Domain Layer

### Entities

The core business entities representing the problem domain:

- **User**: System users with roles and permissions (RBAC/ABAC)
- **Supplier**: Suppliers from whom collections are made
- **Product**: Products with multi-unit support
- **Rate**: Versioned product rates (time-based, historical preservation)
- **Collection**: Collection transactions with quantities
- **Payment**: Payment tracking (advance, partial, final)

### Value Objects

Immutable objects representing domain concepts:

- **UserId**: Unique user identifier (UUID)
- **Email**: Validated email address
- **Money**: Monetary amounts with currency support
- **Quantity**: Quantities with unit of measurement
- **Unit**: Multi-unit system (kg, g, l, ml, etc.) with automatic conversions

### Repository Interfaces

Following the **Dependency Inversion Principle**, the Domain layer defines interfaces:

- `UserRepositoryInterface`
- `SupplierRepositoryInterface`
- `ProductRepositoryInterface`
- `RateRepositoryInterface`
- `CollectionRepositoryInterface`
- `PaymentRepositoryInterface`

### Domain Services

Business logic that doesn't belong to a single entity:

- **PaymentCalculationService**: Automated payment calculations based on collections, rates, and prior payments

## Database Schema

### Tables

- **users**: System users with UUID primary keys, roles (JSON), soft deletes
- **suppliers**: Supplier profiles with unique codes
- **products**: Products with default units
- **rates**: Versioned product rates with effective date ranges
- **collections**: Collection transactions linking suppliers, products, and rates
- **payments**: Payment records (advance, partial, final) linked to suppliers
- **audit_logs**: Immutable audit trail for all changes

### Key Features

- UUID primary keys for distributed systems support
- Foreign key constraints for referential integrity
- Indexes for optimized queries
- Soft deletes for data preservation
- Timestamps for audit trails
- Multi-currency support
- Multi-unit quantity tracking

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
Each entity, value object, and service has one reason to change.

### Open/Closed Principle (OCP)
Entities are closed for modification but open for extension through composition.

### Liskov Substitution Principle (LSP)
Value objects can be substituted without breaking the application.

### Interface Segregation Principle (ISP)
Repository interfaces are focused and specific to each entity.

### Dependency Inversion Principle (DIP)
Domain layer depends on abstractions (interfaces), not concrete implementations.

## Multi-Unit Support

The system supports multiple units of measurement with automatic conversions:

### Weight Units
- **kg** (kilogram) - base: 1000g
- **g** (gram) - base unit
- **mg** (milligram) - base: 0.001g
- **lb** (pound) - base: 453.592g
- **oz** (ounce) - base: 28.3495g

### Volume Units
- **l** (liter) - base: 1000ml
- **ml** (milliliter) - base unit
- **gal** (gallon) - base: 3785.41ml

### Count Units
- **unit**, **piece**, **dozen**

Example usage:
```php
$quantity = Quantity::create(2.5, Unit::fromString('kg'));
$inGrams = $quantity->convertTo(Unit::fromString('g')); // 2500g
```

## Versioned Rate Management

Rates are time-based and historical:

- Each product can have multiple rates over time
- `effective_from` and `effective_to` define validity periods
- Historical rates are preserved for audit and calculation accuracy
- New collections automatically use the latest effective rate

## Payment Calculation

The `PaymentCalculationService` provides:

- **Total Collections**: Sum of all collection amounts for a supplier
- **Total Payments**: Sum of all payments made to a supplier
- **Balance Owed**: Total collections minus total payments
- **Outstanding Balance Check**: Determines if payment is due

## Security Features

### Authentication & Authorization
- Laravel Sanctum for API authentication (planned)
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)

### Data Protection
- Encrypted data at rest (planned)
- Encrypted data in transit (HTTPS)
- Audit logs for all operations
- Soft deletes for data recovery

### Multi-User/Multi-Device Support
- UUID-based primary keys
- Optimistic locking (planned)
- Transaction management
- Conflict detection and resolution (planned)

## Installation

### Requirements
- PHP 8.1 or higher
- Composer
- MySQL/PostgreSQL
- Laravel 10

### Setup

1. Install dependencies:
```bash
cd backend
composer install
```

2. Configure environment:
```bash
cp .env.example .env
php artisan key:generate
```

3. Configure database in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fieldpay_ledger
DB_USERNAME=root
DB_PASSWORD=
```

4. Run migrations:
```bash
php artisan migrate
```

## Testing

Run tests:
```bash
php artisan test
```

## API Documentation

API documentation will be available via OpenAPI/Swagger (planned).

## Contributing

Follow Clean Architecture principles:
1. Domain logic stays in the Domain layer
2. Use cases go in the Application layer
3. Framework-specific code stays in Infrastructure/App layers
4. Follow SOLID principles
5. Write tests for new features

## License

MIT License
