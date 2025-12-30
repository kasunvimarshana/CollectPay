# LedgerFlow Collections - Architecture Documentation

## Overview

This document describes the Clean Architecture implementation of the LedgerFlow Collections application, a data collection and payment management system built with Laravel (backend) and React Native/Expo (frontend).

## Architectural Principles

### Clean Architecture

The application follows **Clean Architecture** (also known as Hexagonal Architecture or Ports and Adapters), which enforces a separation of concerns through layers with dependencies pointing inward:

```
┌──────────────────────────────────────────────────┐
│           Presentation Layer (UI/API)            │
│   Controllers, Views, API Resources, Screens     │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│          Application Layer (Use Cases)           │
│        DTOs, Use Cases, Validators               │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│          Domain Layer (Business Logic)           │
│   Entities, Value Objects, Repository Interfaces │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│       Infrastructure Layer (External)            │
│   Repository Implementations, Database, APIs     │
└──────────────────────────────────────────────────┘
```

**Key Rule**: Dependencies flow inward. Inner layers know nothing about outer layers.

### SOLID Principles

#### Single Responsibility Principle (SRP)
Each class has one reason to change:
- **Entities**: Contain business rules and behavior
- **Use Cases**: Orchestrate single business operations
- **Repositories**: Handle data persistence only
- **Controllers**: Handle HTTP requests/responses only

Example:
```php
// ❌ BAD: Controller doing too much
class SupplierController {
    public function store(Request $request) {
        // Validation
        // Business logic
        // Database operations
        // Response formatting
    }
}

// ✅ GOOD: Single responsibility
class SupplierController {
    public function store(StoreSupplierRequest $request) {
        $dto = SupplierDTO::fromArray($request->validated());
        $supplier = $this->createUseCase->execute($dto);
        return new SupplierResource($supplier);
    }
}
```

#### Open/Closed Principle (OCP)
Open for extension, closed for modification:

```php
// ✅ Repository interface allows different implementations
interface SupplierRepositoryInterface {
    public function findById(int $id): ?Supplier;
}

// Can extend with Eloquent, MongoDB, API, etc.
class EloquentSupplierRepository implements SupplierRepositoryInterface { }
class MongoSupplierRepository implements SupplierRepositoryInterface { }
```

#### Liskov Substitution Principle (LSP)
Any implementation can substitute the interface:

```php
// ✅ Use Case depends on interface, not implementation
class CreateSupplierUseCase {
    public function __construct(
        private SupplierRepositoryInterface $repository
    ) {}
}
```

#### Interface Segregation Principle (ISP)
Clients should not depend on interfaces they don't use:

```php
// ✅ Specific interfaces
interface ReadableRepository {
    public function findById(int $id);
}

interface WritableRepository {
    public function save($entity);
}
```

#### Dependency Inversion Principle (DIP)
Depend on abstractions, not concretions:

```php
// ❌ BAD: Depends on concrete class
class UseCase {
    public function __construct(private EloquentRepository $repo) {}
}

// ✅ GOOD: Depends on abstraction
class UseCase {
    public function __construct(private RepositoryInterface $repo) {}
}
```

## Layer Breakdown

### 1. Domain Layer (Core Business Logic)

**Location**: `backend/app/Domain/`

**Characteristics**:
- Framework independent
- No external dependencies
- Contains business rules
- Pure PHP objects

**Components**:

#### Entities
Business objects with identity and lifecycle:

```php
class Supplier {
    private ?int $id;
    private string $name;
    private string $code;
    
    public function updateDetails(string $name, ?string $address): void {
        if (empty($name)) {
            throw new InvalidArgumentException('Name required');
        }
        $this->name = $name;
        $this->address = $address;
    }
    
    public function activate(): void {
        $this->isActive = true;
    }
}
```

**Purpose**: Encapsulate business rules and behavior.

#### Value Objects
Immutable objects representing values:

```php
class Money {
    public function __construct(
        private readonly float $amount,
        private readonly string $currency
    ) {
        $this->validate();
    }
    
    public function add(Money $other): Money {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Currency mismatch');
        }
        return new Money($this->amount + $other->amount, $this->currency);
    }
}
```

**Purpose**: Represent concepts that are defined by their values, not identity.

#### Repository Interfaces
Contracts for data access:

```php
interface SupplierRepositoryInterface {
    public function findById(int $id): ?Supplier;
    public function save(Supplier $supplier): Supplier;
    public function delete(int $id): bool;
}
```

**Purpose**: Define data access contracts without implementation details.

#### Domain Services
Complex business logic that doesn't fit in entities:

```php
class PaymentCalculationService {
    public function calculateTotalOwed(
        array $collections,
        array $rates
    ): Money {
        // Complex calculation logic
    }
}
```

**Purpose**: Orchestrate complex domain operations.

### 2. Application Layer (Use Cases)

**Location**: `backend/app/Application/`

**Characteristics**:
- Framework independent
- Orchestrates domain objects
- Contains application-specific business rules
- Uses DTOs for data transfer

**Components**:

#### Data Transfer Objects (DTOs)
Simple data containers:

```php
class SupplierDTO {
    public function __construct(
        public readonly ?int $id,
        public readonly string $name,
        public readonly string $code,
        // ... other properties
    ) {}
    
    public static function fromArray(array $data): self {
        return new self(
            id: $data['id'] ?? null,
            name: $data['name'],
            code: $data['code']
        );
    }
}
```

**Purpose**: Transfer data between layers without exposing internal structure.

#### Use Cases
Single application operations:

```php
class CreateSupplierUseCase {
    public function __construct(
        private SupplierRepositoryInterface $repository
    ) {}
    
    public function execute(SupplierDTO $dto): SupplierDTO {
        // 1. Validate business rules
        if ($this->repository->codeExists($dto->code)) {
            throw new InvalidArgumentException('Code exists');
        }
        
        // 2. Create domain entity
        $supplier = new Supplier(
            name: $dto->name,
            code: $dto->code
        );
        
        // 3. Persist via repository
        $saved = $this->repository->save($supplier);
        
        // 4. Return DTO
        return $this->entityToDTO($saved);
    }
}
```

**Purpose**: Implement application-specific business logic.

#### Validators
Business validation logic:

```php
class SupplierValidator {
    public function validate(SupplierDTO $dto): array {
        $errors = [];
        
        if (empty($dto->name)) {
            $errors['name'] = 'Name is required';
        }
        
        return $errors;
    }
}
```

**Purpose**: Centralize validation rules.

### 3. Infrastructure Layer (External Services)

**Location**: `backend/app/Infrastructure/`

**Characteristics**:
- Framework dependent
- Implements domain interfaces
- Handles external communication

**Components**:

#### Repository Implementations
Concrete data access implementations:

```php
class SupplierRepository implements SupplierRepositoryInterface {
    public function __construct(
        private Supplier $model  // Eloquent model
    ) {}
    
    public function findById(int $id): ?SupplierEntity {
        $model = $this->model->find($id);
        return $model ? $this->toEntity($model) : null;
    }
    
    public function save(SupplierEntity $entity): SupplierEntity {
        $model = $this->model->newInstance();
        $model->fill($this->toArray($entity));
        $model->save();
        return $this->toEntity($model);
    }
    
    private function toEntity(Supplier $model): SupplierEntity {
        return new SupplierEntity(
            name: $model->name,
            code: $model->code,
            id: $model->id
        );
    }
}
```

**Purpose**: Implement data persistence using specific technologies.

#### Security Services
Authentication, authorization, encryption:

```php
class AuthenticationService {
    public function authenticate(string $email, string $password): ?User {
        // Laravel Sanctum implementation
    }
}
```

#### External API Clients
Third-party service integrations.

### 4. Presentation Layer (UI/API)

**Location**: `backend/app/Http/`

**Characteristics**:
- Framework dependent
- Handles user interaction
- Transforms data for presentation

**Components**:

#### Controllers
Handle HTTP requests:

```php
class SupplierController extends Controller {
    public function __construct(
        private CreateSupplierUseCase $createUseCase,
        private ListSuppliersUseCase $listUseCase
    ) {}
    
    public function index(Request $request): JsonResponse {
        $result = $this->listUseCase->execute(
            filters: $request->only(['search', 'is_active']),
            page: $request->get('page', 1),
            perPage: $request->get('per_page', 50)
        );
        
        return response()->json([
            'data' => SupplierResource::collection($result['data']),
            'meta' => $result['meta']
        ]);
    }
    
    public function store(StoreSupplierRequest $request): JsonResponse {
        $dto = SupplierDTO::fromArray($request->validated());
        $supplier = $this->createUseCase->execute($dto);
        return response()->json(
            new SupplierResource($supplier),
            201
        );
    }
}
```

**Purpose**: Handle HTTP communication.

#### API Resources
Transform data for API responses:

```php
class SupplierResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'created_at' => $this->created_at,
        ];
    }
}
```

**Purpose**: Format data for external consumption.

#### Form Requests
Validate incoming requests:

```php
class StoreSupplierRequest extends FormRequest {
    public function rules(): array {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'unique:suppliers'],
        ];
    }
}
```

**Purpose**: Validate and sanitize user input.

## Data Flow

### Creating a Supplier (Example)

```
1. HTTP POST /api/v1/suppliers
   ↓
2. SupplierController::store(StoreSupplierRequest)
   ↓
3. Request validation (StoreSupplierRequest)
   ↓
4. SupplierDTO::fromArray(validated data)
   ↓
5. CreateSupplierUseCase::execute(dto)
   ├─ Validate business rules
   ├─ Create Supplier entity
   ├─ Call repository->save()
   │  ├─ Convert entity to Eloquent model
   │  ├─ Save to database
   │  └─ Convert back to entity
   └─ Convert entity to DTO
   ↓
6. SupplierResource::toArray()
   ↓
7. JSON response
```

## Dependency Injection

Laravel's service container manages dependencies:

```php
// AppServiceProvider.php
public function register(): void {
    $this->app->bind(
        SupplierRepositoryInterface::class,
        SupplierRepository::class
    );
}
```

Controllers and use cases receive dependencies via constructor injection:

```php
class SupplierController {
    public function __construct(
        private CreateSupplierUseCase $createUseCase
    ) {}
}

class CreateSupplierUseCase {
    public function __construct(
        private SupplierRepositoryInterface $repository
    ) {}
}
```

## Testing Strategy

### Unit Tests
Test domain entities, value objects, and services in isolation:

```php
class MoneyTest extends TestCase {
    public function test_can_add_money_with_same_currency() {
        $money1 = new Money(100, 'USD');
        $money2 = new Money(50, 'USD');
        
        $result = $money1->add($money2);
        
        $this->assertEquals(150, $result->getAmount());
    }
}
```

### Integration Tests
Test use cases with mocked repositories:

```php
class CreateSupplierUseCaseTest extends TestCase {
    public function test_creates_supplier_successfully() {
        $repository = Mockery::mock(SupplierRepositoryInterface::class);
        $repository->shouldReceive('codeExists')->andReturn(false);
        $repository->shouldReceive('save')->andReturn($expectedSupplier);
        
        $useCase = new CreateSupplierUseCase($repository);
        $result = $useCase->execute($dto);
        
        $this->assertEquals($expected, $result);
    }
}
```

### Feature Tests
Test complete API endpoints:

```php
class SupplierApiTest extends TestCase {
    public function test_can_create_supplier_via_api() {
        $response = $this->postJson('/api/v1/suppliers', [
            'name' => 'Test Supplier',
            'code' => 'SUP001'
        ]);
        
        $response->assertStatus(201)
                 ->assertJsonStructure(['id', 'name', 'code']);
    }
}
```

## Benefits of This Architecture

### 1. Testability
- Domain logic can be tested without database or HTTP
- Use cases can be tested with mocked repositories
- Each layer can be tested independently

### 2. Maintainability
- Changes are localized to specific layers
- Clear separation of concerns
- Easy to understand and navigate

### 3. Flexibility
- Can swap implementations (e.g., Eloquent to MongoDB)
- Can change UI framework without affecting business logic
- Can add new features without modifying existing code

### 4. Framework Independence
- Domain layer has no Laravel dependencies
- Business logic can be reused in different contexts
- Easier to migrate to new frameworks if needed

### 5. Security
- Clear boundaries for validation and authorization
- Business rules enforced at domain level
- Infrastructure concerns separated

## Frontend Architecture (To Be Implemented)

The frontend will follow the same Clean Architecture principles:

```
src/
├── domain/              # Business logic (TypeScript)
│   ├── entities/
│   ├── repositories/
│   └── useCases/
├── data/               # Data layer
│   ├── repositories/   # Implementations
│   ├── datasources/    # API & SQLite
│   └── models/
├── presentation/       # UI layer
│   ├── screens/
│   ├── components/
│   └── navigation/
└── infrastructure/     # Platform-specific
    ├── api/
    ├── storage/
    └── sync/
```

### Offline Support Strategy
1. **Write to Local DB**: All operations write to SQLite first
2. **Queue for Sync**: Mark records for synchronization
3. **Background Sync**: Periodically sync with backend
4. **Conflict Resolution**: Use timestamps and version numbers
5. **Authoritative Backend**: Backend is source of truth

## Conclusion

This architecture provides:
- **Separation of Concerns**: Each layer has a specific responsibility
- **Dependency Rule**: Dependencies point inward
- **Testability**: Easy to unit test business logic
- **Flexibility**: Easy to change implementations
- **Maintainability**: Clear structure and organization
- **Scalability**: Can grow without becoming unwieldy

By following Clean Architecture and SOLID principles, we ensure the codebase remains maintainable, testable, and adaptable to changing requirements.
