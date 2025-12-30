# FieldLedger Platform - Complete System Documentation

## Project Overview

**FieldLedger Platform** is a production-ready, end-to-end data collection and payment management application built with **Clean Architecture** principles. The system provides centralized, authoritative management of suppliers, products, collections, and payments, ensuring strong data integrity, consistency, and reliability across multiple users and devices.

## Technology Stack

### Backend (Laravel)
- **Framework**: Laravel 12 with PHP 8.3
- **Architecture**: Clean Architecture with Domain-Driven Design
- **Database**: SQLite (development), PostgreSQL/MySQL (production)
- **Authentication**: Laravel Sanctum
- **API**: RESTful with JSON responses

### Frontend (React Native/Expo)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Architecture**: Clean Architecture
- **Navigation**: React Navigation
- **State Management**: Zustand
- **HTTP Client**: Axios

## System Architecture

### Clean Architecture Layers

Both frontend and backend follow the same architectural principles:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Controllers, Screens, UI Components)  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│        Application Layer                │
│    (Use Cases, Business Logic)          │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Domain Layer                   │
│ (Entities, Value Objects, Interfaces)   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      Infrastructure Layer               │
│  (Database, API, External Services)     │
└─────────────────────────────────────────┘
```

### Dependency Rule

Dependencies point inward: Presentation → Application → Domain ← Infrastructure

- **Domain** layer is pure, with no external dependencies
- **Application** layer depends only on Domain
- **Infrastructure** and **Presentation** depend on Domain and Application

## Key Design Principles

### SOLID Principles

1. **Single Responsibility**: Each class has one reason to change
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Implementations can be swapped
4. **Interface Segregation**: Specific interfaces, not fat ones
5. **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)
- Value objects encapsulate validation
- Repository pattern eliminates duplication
- Use cases centralize business operations

### KISS (Keep It Simple, Stupid)
- Clear, understandable code
- Minimal abstraction
- Direct implementations

## Domain Model

### Core Entities

#### Supplier
- **Attributes**: UUID, name, code (unique), email, phone, address
- **Business Rules**:
  - Code must be unique
  - Name is required
  - Email and phone validated via value objects
  - Version tracking for optimistic locking

#### Product (Planned)
- **Attributes**: UUID, name, code, rates with versioning
- **Business Rules**:
  - Historical rates preserved
  - New collections use latest rate
  - Multi-unit support (kg, g, liters, etc.)

#### Collection (Planned)
- **Attributes**: UUID, supplier, product, quantity, unit, date
- **Business Rules**:
  - Multi-unit tracking
  - Automatic rate application
  - Immutable after creation

#### Payment (Planned)
- **Attributes**: UUID, supplier, amount, type (advance/partial/final)
- **Business Rules**:
  - Automated calculations from collections
  - Audit trail for transparency
  - Support for advance and partial payments

### Value Objects

- **UUID**: Globally unique identifier
- **Email**: Validated email address
- **PhoneNumber**: Validated phone number
- **Money**: Amount with currency
- **Quantity**: Amount with unit

## Backend Implementation

### Directory Structure

```
backend/
├── src/
│   ├── Domain/
│   │   ├── Entities/          # Business entities
│   │   ├── ValueObjects/      # Immutable value objects
│   │   ├── Repositories/      # Repository interfaces
│   │   └── Services/          # Domain services
│   ├── Application/
│   │   ├── UseCases/          # Application services
│   │   └── DTOs/              # Data transfer objects
│   ├── Infrastructure/
│   │   └── Persistence/       # Database implementation
│   └── Presentation/
│       └── Http/              # API controllers
├── database/migrations/        # Database schema
└── routes/api.php             # API routes
```

### Implemented Features

✅ Complete Supplier CRUD API
✅ Domain entities with business logic
✅ Repository pattern with Eloquent
✅ Request validation
✅ Version control for concurrency
✅ UUID-based identifiers
✅ Comprehensive error handling

### API Endpoints

```
GET    /api/v1/suppliers          - List suppliers
POST   /api/v1/suppliers          - Create supplier
GET    /api/v1/suppliers/{id}     - Get supplier
PUT    /api/v1/suppliers/{id}     - Update supplier
DELETE /api/v1/suppliers/{id}     - Delete supplier
```

## Frontend Implementation

### Directory Structure

```
frontend/
├── src/
│   ├── domain/
│   │   ├── entities/          # Domain models
│   │   ├── repositories/      # Repository interfaces
│   │   └── value-objects/     # Value objects
│   ├── application/
│   │   ├── usecases/          # Business operations
│   │   └── dtos/              # Data transfer objects
│   ├── infrastructure/
│   │   ├── api/               # HTTP client
│   │   ├── storage/           # Local storage
│   │   └── repositories/      # Repository implementations
│   └── presentation/
│       ├── screens/           # App screens
│       ├── components/        # UI components
│       ├── navigation/        # Navigation config
│       └── hooks/             # Custom React hooks
└── App.tsx                    # App entry point
```

### Implemented Features

✅ Clean Architecture structure
✅ TypeScript type safety
✅ HTTP repository for suppliers
✅ API client with interceptors
✅ Domain entities and interfaces

## Data Integrity & Security

### Multi-User Support
- Version control prevents conflicts
- Optimistic locking strategy
- Deterministic conflict resolution

### Security Measures
- Encrypted data in transit (HTTPS)
- Input validation on both layers
- SQL injection prevention (Eloquent ORM)
- Prepared for token authentication

### Audit Trail
- Timestamps on all entities
- Version tracking
- Immutable historical records

## Development Workflow

### Setup Backend

```bash
cd backend
composer install
php artisan migrate
php artisan serve
```

### Setup Frontend

```bash
cd frontend
npm install
npm start
```

### Testing

```bash
# Backend
cd backend
php artisan test

# Frontend
cd frontend
npm test
```

## Offline Support (Planned)

### Strategy
1. Local SQLite database for offline data
2. Sync queue for pending operations
3. Background synchronization
4. Conflict resolution with version control

### Data Flow
```
User Action → Local Storage → Sync Queue → Backend API
                ↓                               ↓
          Optimistic Update            Confirmation/Conflict
```

## Future Roadmap

### Phase 1: Complete Core Entities
- [ ] Product management with versioned rates
- [ ] Collection entry with multi-unit support
- [ ] Payment calculations

### Phase 2: Authentication & Authorization
- [ ] User management
- [ ] Laravel Sanctum integration
- [ ] RBAC/ABAC implementation

### Phase 3: Offline Support
- [ ] Local database setup (SQLite/WatermelonDB)
- [ ] Synchronization mechanism
- [ ] Conflict resolution

### Phase 4: Advanced Features
- [ ] Reporting and analytics
- [ ] Export functionality
- [ ] Multi-language support
- [ ] Dark mode

### Phase 5: Production Readiness
- [ ] Comprehensive test coverage
- [ ] Performance optimization
- [ ] Security audit
- [ ] CI/CD pipeline
- [ ] Deployment documentation

## Testing Strategy

### Backend
- **Unit Tests**: Domain entities, value objects, use cases
- **Integration Tests**: Repository implementations
- **Feature Tests**: API endpoints

### Frontend
- **Unit Tests**: Domain logic, utilities
- **Component Tests**: UI components
- **E2E Tests**: User workflows

## Performance Considerations

- Database indexes on frequently queried fields
- Eager loading to prevent N+1 queries
- Pagination for large datasets
- Caching for read-heavy operations
- Code splitting in frontend

## Documentation

- ✅ `backend/ARCHITECTURE.md` - Backend architecture guide
- ✅ `backend/API.md` - API documentation
- ✅ `frontend/README.md` - Frontend guide
- ✅ `SYSTEM.md` - This system overview

## Contributing

### Code Standards
1. Follow Clean Architecture principles
2. Write self-documenting code
3. Include docblocks for public APIs
4. Add tests for business logic
5. Use TypeScript/PHP type hints

### Git Workflow
1. Create feature branch
2. Implement with tests
3. Code review
4. Merge to main

## License

MIT

## Support

For questions or issues, please contact the development team or create an issue in the repository.

---

**Status**: Foundation Complete  
**Last Updated**: 2025-12-27  
**Version**: 0.1.0-alpha
