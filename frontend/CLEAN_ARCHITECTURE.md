# Frontend Clean Architecture Guide

This document outlines the Clean Architecture implementation for the TrackVault React Native frontend.

## Architecture Overview

The frontend follows Clean Architecture principles with clear separation of concerns across four layers:

```
┌─────────────────────────────────────────────┐
│     Presentation Layer (UI Components)      │
│  React Native Screens, Components, Hooks    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│       Application Layer (Use Cases)         │
│   Business Logic, State Management, DTOs    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        Domain Layer (Core Business)         │
│  Entities, Value Objects, Business Rules    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│    Infrastructure Layer (External APIs)     │
│  API Clients, Storage, Device Services      │
└─────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Domain Layer (`src/domain/`)

**Purpose**: Pure business logic with zero framework dependencies

**Components**:
- **Entities** (`src/domain/entities/`): Core business objects
- **Value Objects** (`src/domain/valueObjects/`): Immutable domain concepts
- **Interfaces** (`src/domain/interfaces/`): Repository and service contracts

**Principles**:
- No React or React Native dependencies
- No external API calls
- Pure TypeScript/JavaScript
- Framework-agnostic
- Contains business rules and validation

**Example**:
```typescript
// src/domain/entities/Supplier.ts
export class SupplierEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly code: string,
    // ... other properties
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Supplier name is required');
    }
    // ... other validations
  }

  getTotalBalance(collections: number, payments: number): number {
    return collections - payments;
  }
}
```

### 2. Application Layer (`src/application/`)

**Purpose**: Orchestrate business operations and manage application state

**Components**:
- **Use Cases** (`src/application/useCases/`): Application-specific business logic
- **Interfaces** (`src/application/interfaces/`): Service contracts
- **DTOs**: Data transfer objects (can be included in use cases)

**Principles**:
- Depends only on domain layer
- Orchestrates domain entities
- Manages state transitions
- No UI concerns
- No direct API calls (uses repository interfaces)

**Example**:
```typescript
// src/application/useCases/CreateSupplierUseCase.ts
export class CreateSupplierUseCase {
  constructor(private supplierRepository: ISupplierRepository) {}

  async execute(data: CreateSupplierDTO): Promise<SupplierEntity> {
    // Validate business rules
    await this.validateUniqueCode(data.code);
    
    // Create domain entity
    const supplier = new SupplierEntity(
      0, // temp ID
      data.name,
      data.code,
      // ...
    );

    // Persist through repository
    return await this.supplierRepository.create(supplier);
  }

  private async validateUniqueCode(code: string): Promise<void> {
    const existing = await this.supplierRepository.findByCode(code);
    if (existing) {
      throw new Error('Supplier code already exists');
    }
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Implement external dependencies and integrations

**Components**:
- **Repositories** (API clients moved here): Implement domain repository interfaces
- **Storage Services**: Local storage, secure storage implementations
- **External Services**: Print service, sync service, device manager

**Principles**:
- Implements domain and application interfaces
- Handles external API communication
- Manages persistence
- Can depend on framework-specific code

**Example**:
```typescript
// src/infrastructure/repositories/SupplierRepository.ts
export class SupplierRepository implements ISupplierRepository {
  constructor(private apiClient: ApiClient) {}

  async create(supplier: SupplierEntity): Promise<SupplierEntity> {
    const response = await this.apiClient.post('/suppliers', {
      name: supplier.name,
      code: supplier.code,
      // ...
    });
    return this.toEntity(response.data);
  }

  async findByCode(code: string): Promise<SupplierEntity | null> {
    try {
      const response = await this.apiClient.get('/suppliers', {
        params: { search: code }
      });
      return response.data.length > 0 
        ? this.toEntity(response.data[0]) 
        : null;
    } catch {
      return null;
    }
  }

  private toEntity(data: any): SupplierEntity {
    return new SupplierEntity(
      data.id,
      data.name,
      data.code,
      // ...
    );
  }
}
```

### 4. Presentation Layer (`src/screens/`, `src/components/`)

**Purpose**: Handle UI rendering and user interactions

**Components**:
- **Screens**: Full-screen views
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for UI logic
- **Contexts**: React Context for state management

**Principles**:
- Thin presentation layer
- Delegates to use cases
- No business logic
- React/React Native specific code
- Handles only UI concerns

**Example**:
```typescript
// src/screens/SuppliersScreen.tsx
export const SuppliersScreen = () => {
  const [suppliers, setSuppliers] = useState<SupplierEntity[]>([]);
  const createSupplierUseCase = useCreateSupplierUseCase(); // Custom hook

  const handleCreate = async (data: CreateSupplierDTO) => {
    try {
      const supplier = await createSupplierUseCase.execute(data);
      setSuppliers([...suppliers, supplier]);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View>
      {/* UI components */}
    </View>
  );
};
```

## Dependency Rules

1. **Dependencies point inward**: Outer layers depend on inner layers, never the reverse
2. **Domain layer is pure**: No external dependencies
3. **Use interfaces**: Program to interfaces, not implementations
4. **Dependency injection**: Pass dependencies through constructors

## Benefits

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Clear structure makes code easy to navigate
3. **Flexibility**: Easy to swap implementations (e.g., API → Mock)
4. **Scalability**: Modular structure supports team collaboration
5. **Framework independence**: Business logic isn't tied to React Native

## Migration Strategy

### Phase 1: Create Structure (Current Phase)
- Create domain entities
- Define repository interfaces
- Create use cases
- Refactor infrastructure

### Phase 2: Refactor Screens
- Update screens to use use cases
- Remove business logic from components
- Thin down component logic

### Phase 3: Testing
- Add unit tests for domain
- Add integration tests for use cases
- Add UI tests for screens

## Best Practices

1. **Keep entities pure**: No framework dependencies in domain layer
2. **Use value objects**: Encapsulate domain concepts (Money, Email, etc.)
3. **Thin components**: Delegate to use cases, only handle UI
4. **Interface-driven**: Define interfaces before implementations
5. **Immutability**: Prefer immutable objects where possible
6. **Error handling**: Use domain-specific errors
7. **Consistent naming**: Follow established conventions

## Naming Conventions

- **Entities**: `SupplierEntity`, `ProductEntity`
- **Value Objects**: `Money`, `Email`, `PhoneNumber`
- **Interfaces**: `ISupplierRepository`, `IStorageService`
- **Use Cases**: `CreateSupplierUseCase`, `UpdateSupplierUseCase`
- **DTOs**: `CreateSupplierDTO`, `UpdateSupplierDTO`
- **Repositories**: `SupplierRepository`, `ProductRepository`

## Directory Structure

```
frontend/src/
├── domain/                      # Domain layer
│   ├── entities/               # Business entities
│   ├── valueObjects/           # Value objects
│   └── interfaces/             # Repository interfaces
├── application/                 # Application layer
│   ├── useCases/               # Use cases
│   └── interfaces/             # Service interfaces
├── infrastructure/              # Infrastructure layer
│   ├── repositories/           # API repository implementations
│   ├── storage/                # Storage implementations
│   └── services/               # External service adapters
├── screens/                     # Presentation layer
├── components/                  # Reusable UI components
├── hooks/                       # Custom React hooks
├── contexts/                    # React Context
├── navigation/                  # App navigation
└── utils/                       # Shared utilities
```

## Next Steps

1. Create core domain entities (Supplier, Product, Collection, Payment)
2. Define repository interfaces
3. Create use cases for CRUD operations
4. Refactor API clients to repositories
5. Update screens to use use cases
6. Add comprehensive tests

---

**Version**: 1.0.0  
**Last Updated**: December 26, 2025
