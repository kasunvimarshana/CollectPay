# FieldLedger Platform - Backend Architecture

## Overview

This is a production-ready Laravel backend API implementing **Clean Architecture** principles for a data collection and payment management system. The application follows SOLID, DRY, and KISS principles with clear separation of concerns.

## Architecture

### Clean Architecture Layers

```
backend/
├── src/
│   ├── Domain/              # Business logic and rules (pure PHP, framework-independent)
│   │   ├── Entities/        # Core business entities
│   │   ├── ValueObjects/    # Immutable value objects
│   │   ├── Repositories/    # Repository interfaces
│   │   └── Services/        # Domain services
│   ├── Application/         # Application business rules
│   │   ├── UseCases/        # Use cases (application services)
│   │   ├── DTOs/            # Data Transfer Objects
│   │   └── Mappers/         # Domain to DTO mappers
│   ├── Infrastructure/      # External frameworks and tools
│   │   ├── Persistence/     # Database implementations
│   │   │   ├── Eloquent/    # Eloquent models
│   │   │   └── Repositories/# Repository implementations
│   │   ├── Auth/            # Authentication implementations
│   │   └── Logging/         # Logging implementations
│   └── Presentation/        # Interface adapters
│       └── Http/            # HTTP layer
│           ├── Controllers/ # API controllers
│           ├── Requests/    # Form requests (validation)
│           ├── Resources/   # JSON resources (transformers)
│           └── Middleware/  # HTTP middleware
└── app/                     # Laravel app structure (legacy)
```

### Layer Dependencies

- **Domain** layer has no dependencies (pure PHP)
- **Application** layer depends only on Domain
- **Infrastructure** layer depends on Domain and Application
- **Presentation** layer depends on Application and Infrastructure

This follows the **Dependency Rule**: dependencies point inward, toward the domain.

## Key Principles

### 1. SOLID Principles

#### Single Responsibility Principle (SRP)
- Each class has one reason to change
- Use cases handle one specific operation
- Entities encapsulate single business concepts

#### Open/Closed Principle (OCP)
- Entities are open for extension, closed for modification
- New functionality added through new classes, not modifying existing ones

#### Liskov Substitution Principle (LSP)
- Repository implementations can be swapped without affecting business logic
- Domain interfaces define contracts

#### Interface Segregation Principle (ISP)
- Repository interfaces are specific to entity needs
- No fat interfaces with unused methods

#### Dependency Inversion Principle (DIP)
- High-level modules (Use Cases) don't depend on low-level modules (Repositories)
- Both depend on abstractions (Interfaces)

### 2. DRY (Don't Repeat Yourself)
- Value objects encapsulate validation logic
- Repository pattern eliminates data access duplication
- Use cases centralize business operations

### 3. KISS (Keep It Simple, Stupid)
- Clear, understandable code
- Minimal abstraction where appropriate
- Direct implementations without over-engineering

## Domain Model

### Entities

#### Supplier
- **Purpose**: Represents suppliers in the system
- **Key Business Rules**:
  - Supplier code must be unique
  - Name and code are required
  - Email and phone are validated via value objects
  - Version tracking for optimistic locking
- **Immutability**: Entities are immutable; updates create new instances

### Value Objects

#### UUID
- Generates and validates UUIDs
- Used as entity identifiers

#### Email
- Validates email format
- Immutable

#### PhoneNumber
- Validates phone number format
- Normalizes input

### Repositories

Repository interfaces define contracts for data persistence without exposing implementation details.

## Application Layer

### Use Cases

Use cases represent application-specific business rules:

- `CreateSupplierUseCase`: Create a new supplier with validation
- `UpdateSupplierUseCase`: Update existing supplier
- `GetSupplierUseCase`: Retrieve single supplier
- `ListSuppliersUseCase`: List suppliers with filtering and pagination
- `DeleteSupplierUseCase`: Delete supplier

### DTOs

Data Transfer Objects carry data between layers without business logic.

## Infrastructure Layer

### Database

- **Driver**: SQLite (development), PostgreSQL/MySQL (production)
- **ORM**: Eloquent
- **Migrations**: Version-controlled schema changes

### Repositories

Eloquent implementations of domain repository interfaces.

## Security

### Authentication
- Laravel Sanctum for API token authentication
- Stateless authentication for mobile apps

### Authorization
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Policy-based authorization

### Data Protection
- Encrypted sensitive data at rest
- HTTPS required for all API calls
- Input validation and sanitization
- SQL injection prevention via Eloquent

## API Design

### RESTful Principles
- Resource-based URLs
- HTTP methods for CRUD operations
- Proper status codes
- JSON request/response format

### Endpoints

```
POST   /api/suppliers          - Create supplier
GET    /api/suppliers          - List suppliers (with pagination/filters)
GET    /api/suppliers/{id}     - Get single supplier
PUT    /api/suppliers/{id}     - Update supplier
DELETE /api/suppliers/{id}     - Delete supplier
```

## Testing

### Test Structure
```
tests/
├── Unit/           # Domain and application logic tests
├── Feature/        # API endpoint tests
└── Integration/    # Repository and infrastructure tests
```

### Testing Principles
- Test domain logic independently
- Mock external dependencies
- Integration tests for database operations
- Feature tests for API endpoints

## Development Setup

### Prerequisites
- PHP 8.2+
- Composer
- SQLite (dev) or PostgreSQL/MySQL (prod)

### Installation

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Running Tests

```bash
php artisan test
```

## Future Modules

Following the established pattern, implement:

- **Products** with versioned rates
- **Collections** with multi-unit tracking
- **Payments** with automated calculations
- **Users** with RBAC/ABAC
- **Audit Logs** for transparency

Each module follows the same Clean Architecture structure demonstrated with Suppliers.

## Best Practices

1. **Always use value objects** for domain concepts with validation
2. **Keep entities immutable** - create new instances for updates
3. **Use dependency injection** - never instantiate dependencies manually
4. **Write tests first** - TDD for business-critical logic
5. **Document public APIs** - clear docblocks for interfaces
6. **Handle errors gracefully** - use exceptions for domain violations
7. **Version your APIs** - prepare for changes
8. **Log important events** - audit trail for compliance

## Performance Considerations

- Database indexes on frequently queried fields
- Eager loading relationships to avoid N+1 queries
- Caching for read-heavy operations
- Queue long-running tasks
- Optimize JSON responses

## Maintenance

- Keep dependencies updated
- Regular security audits
- Performance monitoring
- Database backups
- Code review process

## License

MIT

## Contact

For questions or support, contact the development team.
