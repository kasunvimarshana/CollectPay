# Developer Guide: Extending the Clean Architecture

This guide shows how to add new features following the established Clean Architecture pattern.

## Quick Reference: Adding a New Entity

Follow these steps to add a new entity following the established pattern:

### Step 1: Create Domain Entity

**Location**: `app/Domain/Entities/`

```php
<?php

namespace App\Domain\Entities;

class YourEntity
{
    private ?int $id;
    private string $name;
    // ... other properties

    public function __construct(
        string $name,
        // ... other required parameters
        ?int $id = null
    ) {
        $this->validateName($name);
        $this->id = $id;
        $this->name = $name;
    }

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }

    // Business methods
    public function updateName(string $name): void
    {
        $this->validateName($name);
        $this->name = $name;
    }

    // Validation (business rules)
    private function validateName(string $name): void
    {
        if (empty(trim($name))) {
            throw new \InvalidArgumentException('Name cannot be empty');
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}
```

### Step 2: Create Repository Interface

**Location**: `app/Domain/Repositories/`

```php
<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\YourEntity;

interface YourRepositoryInterface
{
    public function findById(int $id): ?YourEntity;
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;
    public function save(YourEntity $entity): YourEntity;
    public function delete(int $id): bool;
    public function count(array $filters = []): int;
}
```

### Step 3: Create DTOs

**Location**: `app/Application/DTOs/`

```php
<?php

namespace App\Application\DTOs;

class CreateYourEntityDTO
{
    public string $name;
    // ... other properties

    public function __construct(string $name /* ... */)
    {
        $this->name = $name;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            // ...
        );
    }
}

class UpdateYourEntityDTO
{
    public int $id;
    public int $version;
    public ?string $name;
    // ... other properties

    public function __construct(int $id, int $version, ?string $name = null /* ... */)
    {
        $this->id = $id;
        $this->version = $version;
        $this->name = $name;
    }

    public static function fromArray(int $id, array $data): self
    {
        return new self(
            id: $id,
            version: $data['version'],
            name: $data['name'] ?? null,
            // ...
        );
    }
}
```

### Step 4: Create Use Cases

**Location**: `app/Application/UseCases/`

```php
<?php

namespace App\Application\UseCases;

use App\Application\DTOs\CreateYourEntityDTO;
use App\Domain\Entities\YourEntity;
use App\Domain\Repositories\YourRepositoryInterface;

class CreateYourEntityUseCase
{
    private YourRepositoryInterface $repository;

    public function __construct(YourRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function execute(CreateYourEntityDTO $dto): YourEntity
    {
        // Business validation
        // ...

        // Create entity
        $entity = new YourEntity(
            name: $dto->name,
            // ...
        );

        // Persist
        return $this->repository->save($entity);
    }
}
```

Create similar use cases for Update, Get, Delete, List.

### Step 5: Create Repository Implementation

**Location**: `app/Infrastructure/Repositories/`

```php
<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\YourEntity;
use App\Domain\Repositories\YourRepositoryInterface;
use App\Models\YourModel;

class EloquentYourRepository implements YourRepositoryInterface
{
    public function findById(int $id): ?YourEntity
    {
        $model = YourModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = YourModel::query();
        
        // Apply filters
        // ...
        
        $models = $query->skip(($page - 1) * $perPage)->take($perPage)->get();
        return $models->map(fn($model) => $this->toEntity($model))->all();
    }

    public function save(YourEntity $entity): YourEntity
    {
        $data = [
            'name' => $entity->getName(),
            // ...
        ];

        if ($entity->getId()) {
            $model = YourModel::findOrFail($entity->getId());
            $model->update($data);
        } else {
            $model = YourModel::create($data);
        }

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        $model = YourModel::find($id);
        return $model ? $model->delete() : false;
    }

    public function count(array $filters = []): int
    {
        $query = YourModel::query();
        // Apply filters
        return $query->count();
    }

    private function toEntity(YourModel $model): YourEntity
    {
        return new YourEntity(
            name: $model->name,
            // ...
            id: $model->id
        );
    }
}
```

### Step 6: Create Controller

**Location**: `app/Http/Controllers/API/`

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Application\UseCases\CreateYourEntityUseCase;
use App\Application\UseCases\UpdateYourEntityUseCase;
use App\Application\UseCases\GetYourEntityUseCase;
use App\Application\DTOs\CreateYourEntityDTO;
use App\Application\DTOs\UpdateYourEntityDTO;
use App\Domain\Repositories\YourRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class YourController extends Controller
{
    private YourRepositoryInterface $repository;
    private CreateYourEntityUseCase $createUseCase;
    private UpdateYourEntityUseCase $updateUseCase;
    private GetYourEntityUseCase $getUseCase;

    public function __construct(
        YourRepositoryInterface $repository,
        CreateYourEntityUseCase $createUseCase,
        UpdateYourEntityUseCase $updateUseCase,
        GetYourEntityUseCase $getUseCase
    ) {
        $this->repository = $repository;
        $this->createUseCase = $createUseCase;
        $this->updateUseCase = $updateUseCase;
        $this->getUseCase = $getUseCase;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [/* extract from request */];
        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 15), 100);

        $entities = $this->repository->findAll($filters, $page, $perPage);
        $total = $this->repository->count($filters);

        return response()->json([
            'data' => array_map(fn($e) => $e->toArray(), $entities),
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([/* rules */]);

        try {
            $dto = CreateYourEntityDTO::fromArray($validated);
            $entity = $this->createUseCase->execute($dto);
            return response()->json($entity->toArray(), 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $entity = $this->getUseCase->execute($id);
            return response()->json($entity->toArray());
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([/* rules */]);

        try {
            $dto = UpdateYourEntityDTO::fromArray($id, $validated);
            $entity = $this->updateUseCase->execute($dto);
            return response()->json($entity->toArray());
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (VersionConflictException $e) {
            return response()->json(['error' => $e->getMessage()], 409);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->repository->delete($id);
        
        if (!$deleted) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json(['message' => 'Deleted successfully']);
    }
}
```

### Step 7: Register in Service Provider

**Location**: `app/Providers/DomainServiceProvider.php`

```php
public function register(): void
{
    // Bind repository
    $this->app->bind(
        YourRepositoryInterface::class,
        EloquentYourRepository::class
    );

    // Register use cases
    $this->app->bind(CreateYourEntityUseCase::class, function ($app) {
        return new CreateYourEntityUseCase(
            $app->make(YourRepositoryInterface::class)
        );
    });

    $this->app->bind(UpdateYourEntityUseCase::class, function ($app) {
        return new UpdateYourEntityUseCase(
            $app->make(YourRepositoryInterface::class)
        );
    });

    $this->app->bind(GetYourEntityUseCase::class, function ($app) {
        return new GetYourEntityUseCase(
            $app->make(YourRepositoryInterface::class)
        );
    });
}
```

### Step 8: Add Routes

**Location**: `routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('your-entities', YourController::class);
});
```

## Common Patterns

### Value Objects

When you have a complex value that needs validation and operations:

```php
namespace App\Domain\ValueObjects;

class Email
{
    private string $value;

    public function __construct(string $value)
    {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
        $this->value = $value;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(Email $other): bool
    {
        return $this->value === $other->value;
    }
}
```

### Domain Services

When logic doesn't fit in a single entity:

```php
namespace App\Domain\Services;

class YourDomainService
{
    public function complexBusinessLogic($param1, $param2)
    {
        // Complex logic involving multiple entities
        // ...
    }
}
```

### Domain Events

For loose coupling between bounded contexts:

```php
namespace App\Domain\Events;

class YourEntityCreated
{
    public YourEntity $entity;

    public function __construct(YourEntity $entity)
    {
        $this->entity = $entity;
    }
}
```

## Testing

### Unit Test (Domain Entity)

```php
use Tests\TestCase;
use App\Domain\Entities\YourEntity;

class YourEntityTest extends TestCase
{
    public function test_can_create_entity()
    {
        $entity = new YourEntity('Test Name');
        
        $this->assertEquals('Test Name', $entity->getName());
    }

    public function test_validates_name()
    {
        $this->expectException(\InvalidArgumentException::class);
        new YourEntity('');
    }
}
```

### Integration Test (Repository)

```php
use Tests\TestCase;
use App\Infrastructure\Repositories\EloquentYourRepository;
use App\Domain\Entities\YourEntity;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EloquentYourRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_save_and_retrieve()
    {
        $repository = new EloquentYourRepository();
        $entity = new YourEntity('Test');
        
        $saved = $repository->save($entity);
        $retrieved = $repository->findById($saved->getId());
        
        $this->assertEquals($saved->getName(), $retrieved->getName());
    }
}
```

### Feature Test (Controller)

```php
use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class YourControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_via_api()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/your-entities', [
                'name' => 'Test Name',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'name']);
    }
}
```

## Best Practices

1. **Keep Entities Pure**: No framework dependencies in domain layer
2. **Single Responsibility**: One class, one job
3. **Validate Early**: Validate in constructors and setters
4. **Use Value Objects**: For complex values with behavior
5. **Repository Pattern**: Abstract data access
6. **Use Cases**: One use case per business operation
7. **DTOs**: Transfer data between layers
8. **Exceptions**: Use domain-specific exceptions
9. **Immutability**: Prefer immutable objects where possible
10. **Test**: Write tests at each layer

## Checklist for New Feature

- [ ] Create domain entity with validation
- [ ] Create repository interface
- [ ] Create DTOs (Create, Update)
- [ ] Create use cases (Create, Update, Get, Delete, List)
- [ ] Create repository implementation
- [ ] Create or update controller
- [ ] Register bindings in service provider
- [ ] Add routes
- [ ] Write unit tests for entity
- [ ] Write integration tests for repository
- [ ] Write feature tests for API
- [ ] Update API documentation

---

**Remember**: The goal is clean, maintainable, testable code. Follow the patterns, but don't be dogmatic. Adapt as needed while maintaining the principles.
