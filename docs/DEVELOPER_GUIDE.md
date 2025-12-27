# TrackVault Developer Onboarding Guide

Welcome to TrackVault! This guide will help you understand the codebase structure and start contributing quickly.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Testing](#testing)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

## Architecture Overview

TrackVault follows **Clean Architecture** principles with strict separation of concerns:

### Four Layers

```
┌─────────────────────────────────────────────┐
│     Presentation (UI / HTTP Controllers)     │
├─────────────────────────────────────────────┤
│     Application (Use Cases / Orchestration)  │
├─────────────────────────────────────────────┤
│     Domain (Business Logic / Entities)       │
└─────────────────────────────────────────────┘
                    ▲
                    │
        ┌───────────┴───────────┐
        │  Infrastructure (DB/API)│
        └────────────────────────┘
```

**Key Principle**: Dependencies point inward. Inner layers never depend on outer layers.

### Layer Responsibilities

| Layer | Purpose | Contains | Dependencies |
|-------|---------|----------|--------------|
| **Domain** | Business logic | Entities, Value Objects, Interfaces | None (pure) |
| **Application** | Use cases | Use Cases, DTOs, Validators | Domain only |
| **Infrastructure** | External systems | Repositories, API clients | Domain & Application |
| **Presentation** | User interface | Controllers, Screens, Components | All layers |

## Project Structure

```
TrackVault/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Domain/      # ← Business logic (framework-independent)
│   │   ├── Application/ # ← Use cases & DTOs
│   │   ├── Infrastructure/ # ← Repository implementations
│   │   ├── Http/        # ← Controllers & Middleware
│   │   ├── Models/      # ← Eloquent models (persistence only)
│   │   └── Providers/   # ← Service providers
│   ├── database/
│   ├── routes/
│   └── tests/
├── frontend/            # React Native (Expo)
│   ├── src/
│   │   ├── domain/     # ← Business entities & interfaces
│   │   ├── application/ # ← Use cases
│   │   ├── infrastructure/ # ← Repositories & services
│   │   ├── screens/    # ← Full-screen views
│   │   ├── components/ # ← Reusable UI components
│   │   ├── hooks/      # ← Custom React hooks
│   │   ├── contexts/   # ← React Context
│   │   └── navigation/ # ← App navigation
│   └── package.json
└── docs/               # Documentation
    ├── architecture/   # Architecture guides
    ├── api/           # API documentation
    └── implementation/ # Implementation guides
```

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn
- Git

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Verify Setup

- Backend: Visit `http://localhost:8000/api/documentation`
- Frontend: Scan QR code in Expo Go app

## Development Workflow

### Adding a New Feature

Follow this pattern for consistency:

#### 1. Define Domain Entity (if needed)

```php
// backend/app/Domain/Entities/FeatureEntity.php
class FeatureEntity {
    public function __construct(
        private string $name,
        // ... properties
    ) {
        $this->validate();
    }

    private function validate(): void {
        // Business rules validation
    }

    // Business methods
}
```

#### 2. Create Repository Interface

```php
// backend/app/Domain/Repositories/FeatureRepositoryInterface.php
interface FeatureRepositoryInterface {
    public function findById(int $id): ?FeatureEntity;
    public function save(FeatureEntity $entity): FeatureEntity;
    // ... other methods
}
```

#### 3. Create Use Case

```php
// backend/app/Application/UseCases/CreateFeatureUseCase.php
class CreateFeatureUseCase {
    public function __construct(
        private FeatureRepositoryInterface $repository
    ) {}

    public function execute(CreateFeatureDTO $dto): FeatureEntity {
        // 1. Validate
        // 2. Create entity
        // 3. Persist through repository
        // 4. Return entity
    }
}
```

#### 4. Implement Repository

```php
// backend/app/Infrastructure/Repositories/EloquentFeatureRepository.php
class EloquentFeatureRepository implements FeatureRepositoryInterface {
    public function findById(int $id): ?FeatureEntity {
        $model = Feature::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    private function toEntity(Feature $model): FeatureEntity {
        // Convert model to entity
    }
}
```

#### 5. Create Controller

```php
// backend/app/Http/Controllers/API/FeatureController.php
class FeatureController extends Controller {
    public function __construct(
        private CreateFeatureUseCase $createUseCase
    ) {}

    public function store(Request $request): JsonResponse {
        $validated = $request->validate([...]);
        $dto = CreateFeatureDTO::fromArray($validated);
        $entity = $this->createUseCase->execute($dto);
        return response()->json($entity->toArray(), 201);
    }
}
```

#### 6. Register in Service Provider

```php
// backend/app/Providers/DomainServiceProvider.php
$this->app->bind(FeatureRepositoryInterface::class, EloquentFeatureRepository::class);
$this->app->bind(CreateFeatureUseCase::class, function ($app) {
    return new CreateFeatureUseCase(
        $app->make(FeatureRepositoryInterface::class)
    );
});
```

#### 7. Frontend Implementation

```typescript
// 1. Create domain entity
// frontend/src/domain/entities/FeatureEntity.ts

// 2. Create repository interface
// frontend/src/domain/interfaces/IFeatureRepository.ts

// 3. Create use case
// frontend/src/application/useCases/CreateFeatureUseCase.ts

// 4. Implement repository
// frontend/src/infrastructure/repositories/FeatureRepository.ts

// 5. Use in screen
// frontend/src/screens/FeaturesScreen.tsx
```

## Coding Standards

### Backend (PHP)

- **PSR-12** coding style
- **Type hints** everywhere
- **Strict types** enabled
- **DocBlocks** for public methods
- **Meaningful names** (no abbreviations)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entities;

/**
 * Feature Entity
 * 
 * Represents a feature in the domain.
 */
class FeatureEntity
{
    public function __construct(
        private string $name,
        private bool $isActive
    ) {
        $this->validate();
    }

    public function getName(): string
    {
        return $this->name;
    }
}
```

### Frontend (TypeScript)

- **TypeScript strict mode**
- **Functional components**
- **Hooks over classes**
- **Explicit types** (avoid `any`)
- **Meaningful names**

```typescript
/**
 * Feature Entity
 * 
 * Represents a feature in the domain.
 */
export class FeatureEntity {
  constructor(
    public readonly name: string,
    public readonly isActive: boolean
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name) {
      throw new Error('Name is required');
    }
  }
}
```

### Naming Conventions

| Item | Backend (PHP) | Frontend (TS) |
|------|---------------|---------------|
| Entities | `SupplierEntity` | `SupplierEntity` |
| Interfaces | `SupplierRepositoryInterface` | `ISupplierRepository` |
| Use Cases | `CreateSupplierUseCase` | `CreateSupplierUseCase` |
| DTOs | `CreateSupplierDTO` | `CreateSupplierDTO` |
| Events | `SupplierCreatedEvent` | N/A |
| Components | N/A | `Button`, `Input` (PascalCase) |
| Hooks | N/A | `usePagination` (camelCase) |

## Testing

### Backend Tests

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter SupplierTest

# Run with coverage
php artisan test --coverage
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- SupplierEntity

# Run with coverage
npm test -- --coverage
```

### Test Structure

**Backend (PHPUnit)**:
```php
class SupplierEntityTest extends TestCase
{
    public function test_it_validates_name(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new SupplierEntity('', 'CODE');
    }
}
```

**Frontend (Jest)**:
```typescript
describe('SupplierEntity', () => {
  it('should validate name', () => {
    expect(() => {
      new SupplierEntity(0, '', 'CODE');
    }).toThrow('Supplier name is required');
  });
});
```

## Common Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access

```php
// Interface (Domain layer)
interface SupplierRepositoryInterface {
    public function findById(int $id): ?SupplierEntity;
}

// Implementation (Infrastructure layer)
class EloquentSupplierRepository implements SupplierRepositoryInterface {
    public function findById(int $id): ?SupplierEntity {
        $model = Supplier::find($id);
        return $model ? $this->toEntity($model) : null;
    }
}
```

### 2. Use Case Pattern

**Purpose**: Single-responsibility application service

```php
class CreateSupplierUseCase {
    public function __construct(
        private SupplierRepositoryInterface $repository
    ) {}

    public function execute(CreateSupplierDTO $dto): SupplierEntity {
        // 1. Validate business rules
        // 2. Create domain entity
        // 3. Persist through repository
        // 4. Dispatch domain events
        // 5. Return entity
    }
}
```

### 3. DTO Pattern

**Purpose**: Transfer data between layers

```php
class CreateSupplierDTO {
    public function __construct(
        public readonly string $name,
        public readonly string $code,
        // ...
    ) {}

    public static function fromArray(array $data): self {
        return new self(
            name: $data['name'],
            code: $data['code'],
        );
    }
}
```

### 4. Value Object Pattern

**Purpose**: Immutable domain concept

```php
class Money {
    private function __construct(
        private float $amount,
        private string $currency
    ) {}

    public function add(Money $other): Money {
        $this->assertSameCurrency($other);
        return new Money($this->amount + $other->amount, $this->currency);
    }
}
```

## Troubleshooting

### Common Issues

**1. "Class not found"**
```bash
composer dump-autoload
```

**2. "Interface not bound"**
- Check `DomainServiceProvider::register()`
- Ensure service provider is registered in `config/app.php`

**3. "Version conflict"**
- Refresh the entity before updating
- Use optimistic locking with version field

**4. TypeScript errors**
```bash
npm run type-check
```

### Getting Help

1. Check documentation in `/docs`
2. Review existing code for patterns
3. Ask team members
4. Check GitHub issues

## Resources

- [Clean Architecture Guide](../architecture/CLEAN_ARCHITECTURE_IMPLEMENTATION.md)
- [Backend Architecture](../../backend/CLEAN_ARCHITECTURE.md)
- [Frontend Architecture](../../frontend/CLEAN_ARCHITECTURE.md)
- [API Documentation](../api/API.md)
- [Swagger UI](http://localhost:8000/api/documentation)

---

**Welcome to the team! Happy coding! 🚀**
