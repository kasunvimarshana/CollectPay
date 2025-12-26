# Clean Architecture Implementation

This document explains the Clean Architecture refactoring of the TrackVault backend.

## Overview

The backend has been refactored to follow **Clean Architecture** principles, ensuring:
- Clear separation of concerns
- Business logic independence from frameworks
- High testability and maintainability
- SOLID principles throughout
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)

## Architecture Layers

### 1. Domain Layer (`app/Domain/`)

The **innermost layer** containing pure business logic with zero framework dependencies.

#### Components:

**Entities** (`app/Domain/Entities/`)
- Pure business objects representing core domain concepts
- Contain business rules and validation logic
- Example: `SupplierEntity`

```php
$supplier = new SupplierEntity(
    name: 'Green Valley Farms',
    code: 'SUP-001',
    email: 'contact@greenvalley.com'
);
```

**Value Objects** (`app/Domain/ValueObjects/`)
- Immutable objects representing domain concepts
- Encapsulate validation and business logic
- Example: `Money` for financial calculations

```php
$price = new Money(100.50, 'USD');
$total = $price->multiply(2); // Money(201.00, 'USD')
```

**Repository Interfaces** (`app/Domain/Repositories/`)
- Define contracts for data access
- No implementation details, only interfaces
- Example: `SupplierRepositoryInterface`

**Domain Services** (`app/Domain/Services/`)
- Complex business logic that doesn't belong to a single entity
- Example: `SupplierBalanceService` for balance calculations

### 2. Application Layer (`app/Application/`)

The **use case layer** orchestrating business operations.

#### Components:

**Use Cases** (`app/Application/UseCases/`)
- Single-responsibility application services
- Orchestrate domain entities and services
- Examples: `CreateSupplierUseCase`, `UpdateSupplierUseCase`

```php
$useCase = new CreateSupplierUseCase($supplierRepository);
$supplier = $useCase->execute($createSupplierDTO);
```

**DTOs (Data Transfer Objects)** (`app/Application/DTOs/`)
- Simple data containers for transferring data between layers
- Decouple application layer from HTTP layer
- Examples: `CreateSupplierDTO`, `UpdateSupplierDTO`

**Validators** (`app/Application/Validators/`)
- Business rule validation (to be implemented)
- Input validation separate from HTTP validation

### 3. Infrastructure Layer (`app/Infrastructure/`)

The **implementation layer** handling external concerns.

#### Components:

**Repository Implementations** (`app/Infrastructure/Repositories/`)
- Concrete implementations of domain repository interfaces
- Use Eloquent ORM for database access
- Example: `EloquentSupplierRepository`

```php
class EloquentSupplierRepository implements SupplierRepositoryInterface
{
    public function findById(int $id): ?SupplierEntity
    {
        $model = Supplier::find($id);
        return $model ? $this->toEntity($model) : null;
    }
}
```

**Persistence Models** (`app/Models/`)
- Eloquent models used only for data persistence
- No business logic (moved to Domain layer)
- Act as data mappers

### 4. Presentation Layer (`app/Http/Controllers/`)

The **outermost layer** handling HTTP concerns.

#### Components:

**Controllers**
- Thin controllers that handle HTTP requests/responses
- Validate input, delegate to use cases, return responses
- No business logic

```php
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([...]);
    $dto = CreateSupplierDTO::fromArray($validated);
    $supplier = $this->createSupplierUseCase->execute($dto);
    return response()->json($supplier->toArray(), 201);
}
```

## Dependency Flow

```
Presentation Layer (Controllers)
        ↓
Application Layer (Use Cases, DTOs)
        ↓
Domain Layer (Entities, Services, Repository Interfaces)
        ↑
Infrastructure Layer (Repository Implementations)
```

**Key Principle**: Dependencies point inward. Inner layers never depend on outer layers.

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- Each class has one reason to change
- Controllers handle HTTP, Use Cases handle business operations
- Entities handle domain logic, Repositories handle persistence

### Open/Closed Principle (OCP)
- Classes open for extension, closed for modification
- Use interfaces and dependency injection
- Example: New repository implementations without changing domain layer

### Liskov Substitution Principle (LSP)
- Interfaces can be substituted with any implementation
- `SupplierRepositoryInterface` can use Eloquent, MongoDB, or any other implementation

### Interface Segregation Principle (ISP)
- Small, focused interfaces
- Repository interfaces define only necessary methods
- Clients don't depend on methods they don't use

### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions
- Use dependency injection throughout
- `DomainServiceProvider` binds interfaces to implementations

## Benefits of This Architecture

### 1. Testability
- Domain logic can be tested without database or framework
- Use cases can be tested with mock repositories
- Controllers can be tested independently

### 2. Maintainability
- Clear structure makes code easy to navigate
- Changes isolated to specific layers
- Business logic separate from infrastructure

### 3. Flexibility
- Easy to swap implementations (e.g., change from Eloquent to another ORM)
- Can add new features without modifying existing code
- Framework-independent business logic

### 4. Scalability
- Modular structure supports team collaboration
- Easy to add new features following established patterns
- Clear boundaries prevent coupling

## Migration Strategy

The refactoring follows an incremental approach:

1. ✅ **Phase 1**: Create new Clean Architecture structure
   - Domain entities, value objects, interfaces
   - Application use cases and DTOs
   - Infrastructure repository implementations
   - Service provider for dependency injection

2. **Phase 2**: Gradually migrate existing code (in progress)
   - Keep original controllers for backward compatibility
   - Create new controller versions using clean architecture
   - Update routes when ready to switch

3. **Phase 3**: Complete migration
   - Migrate all entities (Product, Collection, Payment)
   - Update all controllers to use use cases
   - Remove old code
   - Update tests

## Usage Examples

### Creating a Supplier

```php
// In Controller
$validated = $request->validate([...]);
$dto = CreateSupplierDTO::fromArray($validated);
$supplier = $this->createSupplierUseCase->execute($dto);
return response()->json($supplier->toArray(), 201);
```

### Updating a Supplier

```php
$dto = UpdateSupplierDTO::fromArray($id, $validated);
$supplier = $this->updateSupplierUseCase->execute($dto);
return response()->json($supplier->toArray());
```

### Balance Calculation

```php
$balanceService = new SupplierBalanceService();
$balance = $balanceService->calculateBalance($totalCollections, $totalPayments);
$percentage = $balanceService->calculatePaymentPercentage($totalCollections, $totalPayments);
```

## Directory Structure

```
app/
├── Domain/                      # Business logic layer
│   ├── Entities/               # Domain entities
│   ├── ValueObjects/           # Value objects (Money, etc.)
│   ├── Repositories/           # Repository interfaces
│   └── Services/               # Domain services
├── Application/                 # Use case layer
│   ├── UseCases/               # Application services
│   ├── DTOs/                   # Data transfer objects
│   └── Validators/             # Business validators
├── Infrastructure/              # Implementation layer
│   ├── Repositories/           # Repository implementations
│   └── Persistence/            # Database specific code
├── Http/                        # Presentation layer
│   └── Controllers/            # HTTP controllers
├── Models/                      # Eloquent models (persistence only)
└── Providers/                   # Service providers
    └── DomainServiceProvider.php
```

## Testing Strategy

### Unit Tests
- Test domain entities and value objects in isolation
- Test domain services with mock dependencies
- No framework or database required

### Integration Tests
- Test use cases with real repository implementations
- Test repository implementations with test database
- Verify layer interactions

### Feature Tests
- Test complete flows through HTTP endpoints
- Test controllers with mocked use cases
- Verify API contracts

## Best Practices

1. **Keep entities pure**: No framework dependencies in Domain layer
2. **Use value objects**: Encapsulate domain concepts (Money, DateRange, etc.)
3. **Thin controllers**: Only HTTP concerns, delegate to use cases
4. **Interface-driven**: Program to interfaces, not implementations
5. **Immutability**: Prefer immutable objects where possible
6. **Validation**: Validate at boundaries (DTOs) and in domain (entities)
7. **Error handling**: Use domain-specific exceptions
8. **Documentation**: Document business rules and architectural decisions

## Next Steps

1. Migrate remaining entities (Product, Collection, Payment, ProductRate)
2. Create use cases for all business operations
3. Update existing controllers or create new versions
4. Add comprehensive test coverage
5. Update API documentation
6. Create migration guide for developers

## Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

**Last Updated**: December 26, 2025  
**Version**: 1.0.0
