# Clean Architecture Implementation Guide

## Overview

TrackVault has been refactored to follow Clean Architecture principles, ensuring separation of concerns, maintainability, and testability. This guide explains the new architecture and how to work with it.

## Architecture Layers

### 1. Domain Layer (`app/Domain/`)

The innermost layer containing business logic and rules.

**Purpose:** Define core business entities, rules, and interfaces without any framework dependencies.

**Components:**
- **Entities** (`app/Domain/Entities/`): Pure business objects with business logic
- **Repositories Interfaces** (`app/Domain/Repositories/`): Contracts for data persistence
- **Value Objects** (`app/Domain/ValueObjects/`): Immutable objects representing domain concepts
- **Services** (`app/Domain/Services/`): Domain services for complex business logic
- **Exceptions** (`app/Domain/Exceptions/`): Domain-specific exceptions

**Example - SupplierEntity:**
```php
class SupplierEntity
{
    private string $name;
    private string $code;
    private string $status;
    private int $version;
    
    // Business methods
    public function isActive(): bool
    public function activate(): void
    public function deactivate(): void
    public function incrementVersion(): void
    
    // Validation (business rules)
    private function validateName(string $name): void
    private function validateEmail(string $email): void
}
```

**Key Principles:**
- No framework dependencies (no Eloquent, no Laravel classes)
- Pure PHP objects
- Business rules enforced in entities
- Immutable where possible

### 2. Application Layer (`app/Application/`)

Orchestrates the flow of data and coordinates domain objects.

**Purpose:** Implement use cases (application-specific business rules).

**Components:**
- **Use Cases** (`app/Application/UseCases/`): Application-specific business logic
- **DTOs** (`app/Application/DTOs/`): Data Transfer Objects for layer communication
- **Services** (`app/Application/Services/`): Application services

**Example - CreateSupplierUseCase:**
```php
class CreateSupplierUseCase
{
    private SupplierRepositoryInterface $repository;
    
    public function __construct(SupplierRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }
    
    public function execute(SupplierDTO $dto): SupplierEntity
    {
        // Business rule: Code must be unique
        if (!$this->repository->isCodeUnique($dto->code)) {
            throw new \InvalidArgumentException("Code already exists");
        }
        
        // Create domain entity
        $supplier = new SupplierEntity(...);
        
        // Persist
        return $this->repository->save($supplier);
    }
}
```

**Use Cases Created:**
- `CreateSupplierUseCase` - Create new supplier
- `UpdateSupplierUseCase` - Update existing supplier with optimistic locking
- `GetSupplierUseCase` - Retrieve single supplier
- `ListSuppliersUseCase` - List suppliers with filtering
- `DeleteSupplierUseCase` - Delete supplier

**Key Principles:**
- Single Responsibility: Each use case does one thing
- Dependency Inversion: Depends on interfaces, not implementations
- No framework dependencies
- Orchestrates domain objects

### 3. Infrastructure Layer (`app/Infrastructure/`)

Implements interfaces defined in domain layer using framework-specific code.

**Purpose:** Provide concrete implementations for persistence, external services, etc.

**Components:**
- **Persistence** (`app/Infrastructure/Persistence/`): Database implementations
- **Security** (`app/Infrastructure/Security/`): Auth/encryption implementations
- **Sync** (`app/Infrastructure/Sync/`): Offline synchronization services

**Example - EloquentSupplierRepository:**
```php
class EloquentSupplierRepository implements SupplierRepositoryInterface
{
    public function save(SupplierEntity $entity): SupplierEntity
    {
        $attributes = $this->toModelAttributes($entity);
        
        if ($entity->getId() === null) {
            $model = Supplier::create($attributes);
        } else {
            $model = Supplier::findOrFail($entity->getId());
            $model->update($attributes);
        }
        
        return $this->toDomainEntity($model);
    }
    
    private function toDomainEntity(Supplier $model): SupplierEntity
    {
        return new SupplierEntity(...);
    }
}
```

**Key Principles:**
- Implements domain interfaces
- Bridges domain and framework
- Handles conversions between domain entities and framework models

### 4. Interface/Presentation Layer (`app/Http/`)

Handles HTTP requests and responses.

**Purpose:** Receive requests, validate input, call use cases, return responses.

**Components:**
- **Controllers** (`app/Http/Controllers/Api/`): API controllers
- **Requests** (`app/Http/Requests/`): Form request validation
- **Middleware** (`app/Http/Middleware/`): Request/response middleware

**Example - Refactored SupplierController:**
```php
class SupplierController extends Controller
{
    private SupplierRepositoryInterface $repository;
    
    public function __construct(SupplierRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }
    
    public function store(Request $request)
    {
        // 1. Validate input
        $validator = Validator::make(...);
        
        // 2. Create DTO
        $dto = SupplierDTO::fromArray($request->all());
        
        // 3. Execute use case
        $useCase = new CreateSupplierUseCase($this->repository);
        $supplier = $useCase->execute($dto);
        
        // 4. Return response
        return response()->json([
            'success' => true,
            'data' => $supplier->toArray()
        ], 201);
    }
}
```

**Key Principles:**
- Thin controllers - delegate to use cases
- Input validation at presentation layer
- Error handling and response formatting
- No business logic in controllers

## Dependency Injection

Register repository implementations in `AppServiceProvider`:

```php
public function register(): void
{
    $this->app->bind(
        SupplierRepositoryInterface::class, 
        EloquentSupplierRepository::class
    );
}
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each use case has one responsibility
- Entities contain only related business logic
- Controllers only handle HTTP concerns

### Open/Closed Principle (OCP)
- Use interfaces for extension points
- New use cases can be added without modifying existing code
- Repository pattern allows switching implementations

### Liskov Substitution Principle (LSP)
- Any implementation of `SupplierRepositoryInterface` can replace another
- Derived classes maintain behavior contracts

### Interface Segregation Principle (ISP)
- Focused repository interfaces
- Each interface has only methods clients need
- DTOs are specific to use cases

### Dependency Inversion Principle (DIP)
- High-level modules (use cases) depend on abstractions (repository interfaces)
- Low-level modules (repositories) implement those abstractions
- Achieved through constructor injection

## Offline Synchronization Support

### SyncService (`app/Infrastructure/Sync/SyncService.php`)

Handles offline data synchronization with conflict detection and resolution.

**Features:**
- Version-based optimistic locking
- Conflict detection
- Multiple resolution strategies (server_wins, client_wins, merge)
- Transaction support
- Audit logging

**Sync Flow:**
1. Mobile device sends data with local_id, server_id, and version
2. Server checks if record exists (server_id)
3. If exists, compare versions for conflict detection
4. If conflict, return conflict data for resolution
5. If no conflict, apply changes and increment version
6. Return success with new version and server_id

**API Endpoints:**
- `POST /api/sync` - Sync data from device
- `GET /api/sync/changes` - Get server changes since last sync
- `POST /api/sync/resolve-conflict` - Resolve conflict with strategy
- `GET /api/sync/status` - Check sync status

**Example Sync Request:**
```json
{
  "suppliers": [
    {
      "local_id": "uuid-1234",
      "id": 5,
      "version": 2,
      "name": "Updated Supplier Name",
      "code": "SUP001",
      ...
    }
  ]
}
```

**Conflict Resolution Strategies:**
- `server_wins` - Keep server data, discard client changes
- `client_wins` - Apply client changes, overwrite server
- `merge` - Intelligent merge of both (client takes precedence for non-null fields)

### Version Control

Every entity has a `version` field:
- Starts at 1
- Incremented on every update
- Used for optimistic locking
- Prevents concurrent update conflicts

**Update Flow with Version Check:**
```php
// Client sends version from their copy
$clientVersion = $request->version;

// Server checks current version
$serverVersion = $supplier->getVersion();

if ($clientVersion !== $serverVersion) {
    throw new \RuntimeException('Conflict: data modified by another user');
}

// If versions match, proceed with update and increment version
$supplier->setVersion($serverVersion + 1);
```

## Testing Clean Architecture

### Unit Tests for Domain Layer
```php
class SupplierEntityTest extends TestCase
{
    public function test_validates_email()
    {
        $this->expectException(\InvalidArgumentException::class);
        
        new SupplierEntity(
            name: 'Test',
            code: 'CODE',
            email: 'invalid-email'
        );
    }
}
```

### Integration Tests for Use Cases
```php
class CreateSupplierUseCaseTest extends TestCase
{
    public function test_creates_supplier_with_unique_code()
    {
        $repository = Mockery::mock(SupplierRepositoryInterface::class);
        $repository->shouldReceive('isCodeUnique')->andReturn(true);
        $repository->shouldReceive('save')->andReturn(new SupplierEntity(...));
        
        $useCase = new CreateSupplierUseCase($repository);
        $dto = new SupplierDTO(...);
        
        $result = $useCase->execute($dto);
        
        $this->assertInstanceOf(SupplierEntity::class, $result);
    }
}
```

## Migration Path

### Step 1: Extend to Other Modules

Apply the same pattern to Products, Collections, and Payments:

1. Create domain entities
2. Create repository interfaces
3. Create use cases
4. Create infrastructure implementations
5. Refactor controllers
6. Register in AppServiceProvider

### Step 2: Add More Features

- Implement domain events
- Add command/query separation (CQRS)
- Enhance validation with specification pattern
- Add caching layer in infrastructure

### Step 3: Frontend Integration

Update frontend to work with versioning:
- Include version in all update requests
- Handle 409 Conflict responses
- Implement conflict resolution UI
- Use sync endpoints for offline support

## Best Practices

1. **Keep Domain Pure**: No framework dependencies in domain layer
2. **Single Source of Truth**: Domain entities define business rules
3. **Explicit Dependencies**: Use constructor injection
4. **Immutable DTOs**: Use readonly properties
5. **Version Everything**: Always include version for updates
6. **Handle Conflicts**: Provide clear conflict resolution strategies
7. **Audit Everything**: Log all changes for traceability
8. **Test at All Layers**: Unit tests for domain, integration tests for use cases

## Benefits Achieved

✅ **Maintainability**: Clear separation of concerns
✅ **Testability**: Easy to test each layer independently
✅ **Flexibility**: Easy to swap implementations
✅ **Scalability**: Add features without modifying existing code
✅ **Data Integrity**: Version control prevents conflicts
✅ **Offline Support**: Robust sync with conflict resolution
✅ **SOLID Principles**: All 5 principles implemented
✅ **Clean Code**: Readable, self-documenting code

## Next Steps

1. Apply pattern to remaining modules (Product, Collection, Payment)
2. Add comprehensive test suite
3. Document API changes
4. Update frontend to use versioning
5. Add performance monitoring
6. Implement caching strategies
