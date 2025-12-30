# Field Ledger - Clean Architecture Documentation

## Architecture Overview

This application follows **Clean Architecture** principles, ensuring:
- Clear separation of concerns
- Independence from frameworks
- Testability
- Flexibility and maintainability

## Project Structure

### Backend (Laravel)

```
backend/
├── src/
│   ├── Domain/                    # Enterprise Business Rules
│   │   ├── Entities/              # Core business objects
│   │   │   ├── User.php
│   │   │   ├── Supplier.php
│   │   │   ├── Product.php
│   │   │   ├── Collection.php
│   │   │   └── Payment.php
│   │   ├── ValueObjects/          # Immutable values with behavior
│   │   │   ├── Money.php
│   │   │   ├── Quantity.php
│   │   │   ├── Unit.php
│   │   │   ├── Rate.php
│   │   │   ├── Email.php
│   │   │   └── PhoneNumber.php
│   │   ├── Repositories/          # Repository interfaces (contracts)
│   │   │   ├── UserRepositoryInterface.php
│   │   │   ├── SupplierRepositoryInterface.php
│   │   │   ├── ProductRepositoryInterface.php
│   │   │   ├── CollectionRepositoryInterface.php
│   │   │   └── PaymentRepositoryInterface.php
│   │   └── Services/              # Domain services
│   │       └── PaymentCalculatorService.php
│   ├── Application/               # Application Business Rules
│   │   ├── UseCases/              # Application-specific business rules
│   │   └── DTOs/                  # Data Transfer Objects
│   ├── Infrastructure/            # Frameworks & Drivers
│   │   ├── Persistence/           # Database implementations
│   │   ├── Repositories/          # Repository implementations
│   │   └── Services/              # External service implementations
│   └── Presentation/              # Interface Adapters
│       └── Http/
│           ├── Controllers/       # API Controllers
│           ├── Middleware/        # HTTP Middleware
│           └── Requests/          # Request validation
├── database/
│   └── migrations/                # Database schema
└── tests/                         # Tests
```

## Domain Layer (Core Business Logic)

### Entities

#### User
- Represents system users with roles and permissions
- Supports RBAC (Role-Based Access Control)
- Manages authentication credentials

#### Supplier
- Represents entities from whom collections are made
- Stores contact information and metadata
- Tracks active/inactive status

#### Product
- Represents collectible items
- Supports **versioned rates** for historical accuracy
- Uses multi-unit support (kg, g, liters, etc.)

#### Collection
- Represents a collection transaction
- Links supplier, product, user, and applied rate
- Calculates and stores total amount at time of collection
- Preserves historical rate for audit trail

#### Payment
- Represents payment transactions
- Supports types: advance, partial, full
- Tracks payment date, reference, and metadata

### Value Objects

#### Money
- Immutable representation of monetary value
- Supports currency
- Provides mathematical operations (add, subtract, multiply)
- Validates currency compatibility

#### Quantity
- Represents measured quantities with units
- Supports unit conversion
- Validates measurements

#### Unit
- Represents measurement units (kg, g, l, ml, etc.)
- Provides conversion factors
- Validates unit compatibility

#### Rate
- Represents price per unit with effective date
- Supports rate versioning
- Calculates amounts based on quantities

#### Email & PhoneNumber
- Validated contact information value objects

### Repositories (Interfaces)

Repositories define contracts for data persistence:
- Decouple business logic from data access
- Enable testability through mocking
- Support multiple implementations (SQL, NoSQL, etc.)

### Domain Services

#### PaymentCalculatorService
- Calculates total collection amounts for suppliers
- Calculates total payments made
- Determines outstanding balances
- Supports date-range queries

## Database Schema

### Tables

1. **users** - System users with roles
2. **suppliers** - Supplier profiles
3. **products** - Product definitions
4. **product_rates** - Versioned product rates
5. **collections** - Collection transactions
6. **payments** - Payment transactions
7. **sync_records** - Offline sync tracking
8. **audit_logs** - Complete audit trail

### Key Features

- **UUID Primary Keys**: Supports distributed systems and offline generation
- **Timestamps**: Created/updated tracking on all entities
- **Foreign Keys**: Maintains referential integrity
- **Indexes**: Optimized for common queries
- **JSON Fields**: Flexible metadata storage

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each class has one reason to change
- Entities focus on business rules
- Repositories handle persistence
- Services coordinate complex operations

### Open/Closed Principle (OCP)
- Entities are open for extension, closed for modification
- Repository interfaces allow multiple implementations
- Value objects are immutable

### Liskov Substitution Principle (LSP)
- Repository implementations can be substituted without breaking code
- Value objects maintain contracts

### Interface Segregation Principle (ISP)
- Repository interfaces are focused and specific
- No client depends on methods it doesn't use

### Dependency Inversion Principle (DIP)
- High-level modules depend on abstractions (interfaces)
- Infrastructure depends on domain, not vice versa
- Dependency injection used throughout

## Data Integrity & Multi-User Support

### Concurrency Handling
- Optimistic locking with timestamps
- Conflict detection in sync layer
- Server-side validation as source of truth

### Multi-Unit Support
- Unit conversions handled by value objects
- Consistent calculations across different units
- Historical rates preserved per collection

### Rate Versioning
- Product rates are timestamped
- Historical rates preserved for auditing
- New collections use current rates
- Old collections maintain original rates

### Audit Trail
- All changes logged to audit_logs table
- Immutable audit records
- User, timestamp, and change details tracked

## Security

### Data Protection
- Encrypted data at rest (database encryption)
- Encrypted data in transit (HTTPS/TLS)
- Password hashing (bcrypt)

### Access Control
- RBAC: Role-Based Access Control
- ABAC: Attribute-Based Access Control
- Authentication via Laravel Sanctum (planned)
- Authorization middleware

### Validation
- Input validation at API layer
- Business rule validation in domain layer
- Type safety through value objects

## Offline Support & Synchronization

### Sync Strategy
- Client-side queue of pending operations
- Server processes sync records sequentially
- Conflict detection based on timestamps
- Deterministic conflict resolution

### Sync Records Table
- Tracks all offline operations
- Stores operation type (create, update, delete)
- Maintains status (pending, processed, conflict, rejected)
- Links to device and user

## Testing Strategy

### Unit Tests
- Domain entities and value objects
- Business logic in domain services
- Pure functions, no external dependencies

### Integration Tests
- Repository implementations
- Database operations
- API endpoints

### End-to-End Tests
- Complete user workflows
- Multi-user scenarios
- Sync and conflict resolution

## Future Enhancements

1. **Application Layer**
   - Use case implementations
   - DTOs for request/response
   - Command/Query separation (CQRS)

2. **Infrastructure Layer**
   - Repository implementations with Eloquent
   - External service integrations
   - Caching layer

3. **Presentation Layer**
   - RESTful API controllers
   - Request validation
   - API documentation

4. **Frontend**
   - React Native (Expo) mobile app
   - Clean Architecture structure
   - Offline-first approach
   - Local database (SQLite)

5. **DevOps**
   - CI/CD pipelines
   - Docker containerization
   - Automated testing
   - Deployment automation

## References

- Clean Architecture by Robert C. Martin
- Domain-Driven Design by Eric Evans
- Laravel Documentation: https://laravel.com/docs
- React Native Documentation: https://reactnative.dev/
- Expo Documentation: https://expo.dev/
