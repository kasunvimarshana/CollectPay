# Frontend Architecture Documentation

## Clean Architecture Implementation

This React Native (Expo) frontend follows **Clean Architecture** principles with clear separation of concerns across five distinct layers.

## Layer Structure

```
src/
├── domain/           # Domain Layer (Core Business Entities)
├── infrastructure/   # Infrastructure Layer (External Dependencies)
├── application/      # Application Layer (Business Logic & Services)
├── core/            # Core Layer (Shared Utilities & Constants)
└── presentation/    # Presentation Layer (UI Components & Screens)
```

## Layer Dependencies

The architecture follows these strict dependency rules:

### Domain Layer (innermost)
- **Location:** `src/domain/`
- **Dependencies:** NONE (must be independent)
- **Purpose:** Define core business entities and types
- **Examples:** User, Supplier, Product, Collection, Payment entities

```typescript
// ✅ ALLOWED
export interface Product {
  id: number;
  name: string;
  // ...
}

// ❌ NOT ALLOWED - No imports from other layers
import { apiClient } from '../../infrastructure/api/apiClient';
```

### Infrastructure Layer
- **Location:** `src/infrastructure/`
- **Dependencies:** Domain layer ONLY
- **Purpose:** External integrations (API, storage, network)
- **Examples:** apiClient, LocalStorageService

```typescript
// ✅ ALLOWED
import { User } from '../../domain/entities/User';
import { API_BASE_URL } from '../../core/constants/api';

// ❌ NOT ALLOWED
import { AuthService } from '../../application/services/AuthService';
```

### Application Layer
- **Location:** `src/application/`
- **Dependencies:** Domain, Infrastructure, Core layers
- **Purpose:** Business logic, use cases, services
- **Examples:** SyncService, AuthService, ConflictResolutionService, useNetworkStatus hook

```typescript
// ✅ ALLOWED
import { User } from '../../domain/entities/User';
import apiClient from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../core/constants/api';

// ❌ NOT ALLOWED
import { HomeScreen } from '../../presentation/screens/HomeScreen';
```

### Core Layer
- **Location:** `src/core/`
- **Dependencies:** Domain layer ONLY
- **Purpose:** Shared utilities, constants, and basic hooks
- **Examples:** constants (colors, API), utilities (permissions), basic hooks (usePagination, useSort)

```typescript
// ✅ ALLOWED
import { User } from '../../domain/entities/User';

// ❌ NOT ALLOWED - Must not depend on application layer
import { SyncService } from '../../application/services/SyncService';
```

### Presentation Layer (outermost)
- **Location:** `src/presentation/`
- **Dependencies:** ALL other layers
- **Purpose:** UI components, screens, navigation, contexts
- **Examples:** LoginScreen, HomeScreen, SyncStatusIndicator

```typescript
// ✅ ALLOWED - Can import from any layer
import { User } from '../../domain/entities/User';
import apiClient from '../../infrastructure/api/apiClient';
import { AuthService } from '../../application/services/AuthService';
import { useNetworkStatus } from '../../application/hooks/useNetworkStatus';
import { COLORS } from '../../core/constants/colors';
import { hasPermission } from '../../core/utils/permissions';
```

## Dependency Flow Diagram

```
┌────────────────────────────────────────┐
│      Presentation Layer                │
│  (Screens, Components, Navigation)     │
│  - Can depend on ALL layers            │
└──────────────┬─────────────────────────┘
               │
               ↓
┌────────────────────────────────────────┐
│      Application Layer                 │
│    (Services, Hooks, Use Cases)        │
│  - Depends on: Domain, Infrastructure  │
│                Core                     │
└──────────────┬─────────────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
┌──────────────┐  ┌──────────────────────┐
│ Core Layer   │  │ Infrastructure Layer │
│ (Constants,  │  │  (API, Storage)      │
│  Utilities)  │  │ - Depends on: Domain │
│ - Depends on:│  │                 Core │
│    Domain    │  └──────────┬───────────┘
└──────┬───────┘             │
       │                     │
       └──────────┬──────────┘
                  ↓
          ┌───────────────┐
          │ Domain Layer  │
          │  (Entities)   │
          │ - Independent │
          └───────────────┘
```

## SOLID Principles Application

### Single Responsibility Principle (SRP)
- Each service handles one specific concern
- Each screen manages one UI view
- Each entity represents one business concept

### Open/Closed Principle (OCP)
- Services are open for extension (inheritance, composition)
- Closed for modification (changes don't break existing code)

### Liskov Substitution Principle (LSP)
- Implementations can be swapped without breaking functionality
- Example: LocalStorageService can be replaced with alternative storage

### Interface Segregation Principle (ISP)
- Small, focused interfaces
- Example: NetworkStatus, SyncStatus separate interfaces

### Dependency Inversion Principle (DIP)
- High-level modules don't depend on low-level modules
- Both depend on abstractions
- Example: Application layer depends on apiClient abstraction, not concrete HTTP library

## Common Architecture Violations to Avoid

### ❌ Circular Dependencies
```typescript
// BAD: Core importing from Application
// src/core/hooks/useNetworkStatus.ts
import { SyncService } from '../../application/services/SyncService';

// FIXED: Move hook to Application layer
// src/application/hooks/useNetworkStatus.ts
import { SyncService } from '../services/SyncService';
```

### ❌ Domain Layer Importing from Other Layers
```typescript
// BAD: Domain importing from Infrastructure
// src/domain/entities/User.ts
import apiClient from '../../infrastructure/api/apiClient';

// FIXED: Domain should be pure
export interface User {
  id: number;
  name: string;
}
```

### ❌ Presentation Logic in Services
```typescript
// BAD: Service importing React components
import { Alert } from 'react-native';

class SomeService {
  doSomething() {
    Alert.alert('Done'); // Presentation concern in service!
  }
}

// FIXED: Return result, let presentation handle UI
class SomeService {
  doSomething() {
    return { success: true, message: 'Done' };
  }
}
```

## Testing Guidelines

### Unit Tests
- Test each layer independently
- Mock dependencies from other layers
- Domain entities should have zero dependencies

### Integration Tests
- Test interaction between layers
- Example: Application → Infrastructure → API

### E2E Tests
- Test complete flows through all layers
- Example: Login flow from screen to API

## File Organization Best Practices

### Naming Conventions
- **Entities:** PascalCase (User.ts, Product.ts)
- **Services:** PascalCase with "Service" suffix (AuthService.ts)
- **Hooks:** camelCase with "use" prefix (useNetworkStatus.ts)
- **Components:** PascalCase (SyncStatusIndicator.tsx)
- **Screens:** PascalCase with "Screen" suffix (HomeScreen.tsx)
- **Constants:** UPPER_SNAKE_CASE (API_BASE_URL)

### Export Patterns
```typescript
// Individual exports for flexibility
export interface User { }
export interface Role { }

// Index files for convenient imports
// src/domain/entities/index.ts
export * from './User';
export * from './Product';
```

## Refactoring Checklist

When adding new features:

1. ✅ Does the new code belong in the correct layer?
2. ✅ Are dependencies flowing in the correct direction?
3. ✅ Is the domain layer still independent?
4. ✅ Are services free from UI concerns?
5. ✅ Are components free from business logic?
6. ✅ Are there any circular dependencies?
7. ✅ Does TypeScript compile without errors?

## Architecture Validation Commands

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for circular dependencies (manual)
# Ensure no imports flow backwards in the dependency diagram

# Verify domain layer independence
grep -r "import.*from" src/domain --include="*.ts" | grep -v "^\s*\*"

# Verify core layer doesn't import from application
grep -r "application" src/core --include="*.ts" --include="*.tsx"
```

## Maintenance Notes

- **Last Architecture Review:** 2025-12-30
- **Known Issues:** None (circular dependency fixed)
- **Future Improvements:**
  - Consider adding a "use cases" subdirectory in application layer
  - May need more granular permission types in core layer
  - Consider extracting navigation logic into separate layer

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
