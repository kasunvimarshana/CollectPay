# Frontend Architecture Documentation

## Overview

The FieldPay Ledger frontend is built using React Native (Expo) following Clean Architecture principles. This document describes the architectural decisions, patterns, and guidelines used in the application.

## Clean Architecture Layers

### 1. Domain Layer (Inner Circle)

**Purpose**: Contains pure business logic, independent of any framework or external dependencies.

**Components**:

#### Entities
Core business objects that encapsulate enterprise-wide business rules:
- `User`: System users with roles and permissions
- `Supplier`: Supplier entities with contact information
- `Product`: Products with multi-unit support
- `Rate`: Versioned product rates
- `Collection`: Collection transaction records
- `Payment`: Payment transaction records

#### Value Objects
Immutable objects that represent domain concepts:
- `UserId`: UUID-based user identifier
- `Email`: Validated email address
- `Money`: Currency-aware monetary amount
- `Quantity`: Multi-unit quantity with unit conversion
- `Unit`: Measurement unit types (kg, g, l, ml, etc.)

**Characteristics**:
- No dependencies on outer layers
- Pure TypeScript/JavaScript
- Immutable where appropriate
- Self-validating
- Business logic lives here

### 2. Application Layer

**Purpose**: Orchestrates business workflows and implements use cases.

**Components**:

#### Use Cases
Application-specific business workflows:
- `CreateSupplierUseCase`: Create new supplier
- `ListSuppliersUseCase`: Retrieve all suppliers
- `CreateCollectionUseCase`: Record new collection
- `CreatePaymentUseCase`: Process payment

#### Repository Interfaces
Define contracts for data access (Dependency Inversion Principle):
- `SupplierRepository`
- `ProductRepository`
- `CollectionRepository`
- `PaymentRepository`

**Characteristics**:
- Depends only on Domain layer
- Framework-independent
- Testable in isolation
- Single Responsibility Principle

### 3. Infrastructure Layer

**Purpose**: Implements technical capabilities and external integrations.

**Components**:

#### API Client
- `ApiClient`: HTTP communication with backend
- Axios-based implementation
- Authentication token management
- Request/response interceptors
- Error handling

#### Storage Service
- `StorageService`: Local data persistence
- AsyncStorage implementation
- Secure token storage with SecureStore
- Offline data caching

#### Repository Implementations
Concrete implementations of repository interfaces:
- `ApiSupplierRepository`
- `ApiProductRepository`
- `ApiCollectionRepository`
- `ApiPaymentRepository`

**Characteristics**:
- Implements interfaces from Application layer
- Handles external dependencies
- Data transformation (DTO mapping)
- Network and storage operations

### 4. Presentation Layer (Outer Circle)

**Purpose**: User interface and user interaction handling.

**Components**:

#### Screens
Full-page components:
- `HomeScreen`: Main dashboard
- `SuppliersScreen`: List of suppliers
- `CreateSupplierScreen`: Supplier creation form

#### Components
Reusable UI elements:
- `Button`: Configurable button component
- `Input`: Form input with validation
- `Card`: Container component
- `Loading`: Loading indicator

#### State Management
Zustand stores for application state:
- `useAuthStore`: Authentication state
- `useSupplierStore`: Supplier data and operations
- `useCollectionStore`: Collection data and operations

#### Navigation
React Navigation setup:
- Stack Navigator
- Screen routing
- Navigation params

**Characteristics**:
- Depends on all inner layers
- React Native specific
- User interaction handling
- State management
- Routing and navigation

## Design Patterns

### 1. Repository Pattern
Abstracts data access logic behind interfaces. Allows easy swapping of data sources (API, local storage, mock data).

```typescript
// Interface (Domain/Application Layer)
interface SupplierRepository {
  findAll(): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  create(supplier: Supplier): Promise<Supplier>;
}

// Implementation (Infrastructure Layer)
class ApiSupplierRepository implements SupplierRepository {
  // Implementation details
}
```

### 2. Use Case Pattern
Encapsulates business workflows in single-purpose classes.

```typescript
class CreateSupplierUseCase {
  constructor(private repository: SupplierRepository) {}
  
  async execute(dto: CreateSupplierDTO): Promise<Supplier> {
    // Business logic
  }
}
```

### 3. Value Object Pattern
Immutable objects that represent domain concepts with built-in validation.

```typescript
class Email {
  private constructor(private value: string) {}
  
  static create(value: string): Email {
    if (!Email.isValid(value)) {
      throw new Error('Invalid email');
    }
    return new Email(value);
  }
}
```

### 4. Dependency Injection
Dependencies are provided from outer layers, following Dependency Inversion Principle.

```typescript
// Repository injected into use case
const repository = new ApiSupplierRepository();
const useCase = new CreateSupplierUseCase(repository);
```

## SOLID Principles

### Single Responsibility Principle (SRP)
Each class has one reason to change:
- Use cases handle one workflow
- Components render one UI element
- Services handle one type of operation

### Open/Closed Principle (OCP)
Open for extension, closed for modification:
- Repository interfaces allow different implementations
- Value objects can be extended through composition

### Liskov Substitution Principle (LSP)
Subtypes must be substitutable for their base types:
- Repository implementations are interchangeable
- Value objects maintain invariants

### Interface Segregation Principle (ISP)
Clients shouldn't depend on interfaces they don't use:
- Repository interfaces are focused and specific
- Use cases depend only on what they need

### Dependency Inversion Principle (DIP)
Depend on abstractions, not concretions:
- Use cases depend on repository interfaces
- Infrastructure implements those interfaces

## State Management Strategy

### Zustand Stores

We use Zustand for simple, performant state management:

**Benefits**:
- Minimal boilerplate
- No context providers needed
- TypeScript support
- Easy to test
- Small bundle size

**Store Structure**:
```typescript
interface Store {
  // State
  data: T[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetch: () => Promise<void>;
  create: (data: T) => Promise<void>;
  clearError: () => void;
}
```

## Data Flow

1. **User Action** → Component handles event
2. **Component** → Calls store action
3. **Store** → Invokes use case
4. **Use Case** → Validates and orchestrates
5. **Repository** → Fetches/persists data
6. **API Client** → Communicates with backend
7. **Store** → Updates state
8. **Component** → Re-renders with new data

## Error Handling

### Layers:
1. **Domain**: Throws domain-specific errors
2. **Application**: Catches and wraps errors
3. **Infrastructure**: Handles network/storage errors
4. **Presentation**: Displays user-friendly messages

### Strategy:
- Use try-catch blocks appropriately
- Log errors for debugging
- Show user-friendly messages
- Prevent app crashes

## Testing Strategy

### Unit Tests
- Domain entities and value objects
- Use cases
- Repository implementations
- Utility functions

### Integration Tests
- API client interactions
- Storage operations
- Use case workflows

### Component Tests
- UI component rendering
- User interactions
- Form validation

### E2E Tests
- Critical user flows
- Multi-screen workflows
- Offline/online scenarios

## Performance Considerations

1. **Lazy Loading**: Load screens on demand
2. **Memoization**: Use React.memo for expensive components
3. **Virtualization**: FlatList for long lists
4. **Image Optimization**: Compress and cache images
5. **Bundle Splitting**: Code splitting where possible

## Security Considerations

1. **Token Storage**: Use SecureStore for sensitive data
2. **API Communication**: HTTPS only
3. **Input Validation**: Validate all user inputs
4. **Authorization**: Check permissions before actions
5. **Data Encryption**: Encrypt sensitive offline data

## Offline Support

### Implementation

The application now includes comprehensive offline support following Clean Architecture:

1. **Network Monitoring**: Real-time connectivity tracking with NetInfo
2. **Local Storage**: AsyncStorage-based caching for all entities
3. **Sync Queue**: Automatic queuing of offline operations
4. **Conflict Resolution**: Multiple strategies for handling data conflicts
5. **Optimistic Updates**: Immediate UI feedback with background sync

### Key Components

- **NetworkMonitoringService**: Monitors network state changes
- **LocalDatabaseService**: Provides local key-value storage
- **SyncQueueRepository**: Manages pending sync operations
- **Offline*Repository**: Decorators adding offline support to repositories
- **useSyncStore**: State management for sync operations
- **NetworkStatus**: UI component showing network/sync status

See [OFFLINE-SUPPORT.md](./OFFLINE-SUPPORT.md) for detailed documentation.

## Future Enhancements

1. ✅ **Offline Support**: Complete offline-first architecture - IMPLEMENTED
2. ✅ **Sync Mechanism**: Conflict resolution and data sync - IMPLEMENTED
3. **Real-time Updates**: WebSocket integration for live updates
4. **Analytics**: User behavior tracking
5. **Internationalization**: Multi-language support
6. **Accessibility**: Full accessibility compliance
7. **Dark Mode**: Theme support
8. **WatermelonDB**: Replace AsyncStorage for better performance
9. **Background Sync**: Sync while app is in background
10. **Data Encryption**: Encrypt offline data at rest

---

**Last Updated**: December 27, 2025
**Version**: 2.0.0 - Offline Support
