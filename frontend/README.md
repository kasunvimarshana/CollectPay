# FieldLedger Platform - Mobile Frontend

## Overview

This is a production-ready React Native (Expo) mobile application implementing **Clean Architecture** principles for a data collection and payment management system. The application follows SOLID, DRY, and KISS principles with clear separation of concerns.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Architecture**: Clean Architecture with Domain-Driven Design

## Project Structure

```
frontend/
├── src/
│   ├── domain/                   # Business logic (pure TypeScript)
│   │   ├── entities/            # Domain entities
│   │   ├── repositories/        # Repository interfaces
│   │   └── value-objects/       # Immutable value objects
│   ├── application/             # Application business rules
│   │   ├── usecases/           # Use cases
│   │   └── dtos/               # Data Transfer Objects
│   ├── infrastructure/          # External frameworks and tools
│   │   ├── api/                # API clients
│   │   ├── storage/            # Local storage (SQLite/AsyncStorage)
│   │   └── repositories/       # Repository implementations
│   └── presentation/            # UI layer
│       ├── screens/            # Screen components
│       ├── components/         # Reusable UI components
│       ├── navigation/         # Navigation configuration
│       └── hooks/              # Custom React hooks
├── App.tsx                     # Application entry point
└── package.json
```

## Architecture Principles

### Layer Dependencies

- **Domain** layer has no dependencies (pure TypeScript)
- **Application** layer depends only on Domain
- **Infrastructure** layer depends on Domain and Application
- **Presentation** layer depends on Application and Infrastructure

This follows the **Dependency Rule**: dependencies point inward, toward the domain.

### Key Patterns

1. **Repository Pattern**: Abstracts data access
2. **Use Case Pattern**: Encapsulates business operations
3. **Dependency Injection**: Loose coupling between layers
4. **Immutable Entities**: Domain entities are immutable
5. **Value Objects**: Encapsulate domain validation

## Features

### Implemented
- ✅ Clean Architecture structure
- ✅ TypeScript type safety
- ✅ Navigation setup
- ✅ State management foundation
- ✅ API client configuration

### Planned
- 🔄 Supplier management screens
- 🔄 Product management screens
- 🔄 Collection entry screens
- 🔄 Payment management screens
- 🔄 Offline-first data persistence
- 🔄 Data synchronization
- 🔄 Authentication
- 🔄 Multi-unit quantity tracking
- 🔄 Versioned rate management

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Configuration

Create a `.env` file in the frontend directory:

```env
API_BASE_URL=http://localhost:8000/api/v1
```

## Domain Model

### Entities

#### Supplier
- **Purpose**: Represents suppliers in the system
- **Key Attributes**:
  - `id`: UUID
  - `name`: string
  - `code`: string (unique)
  - `email`: Email value object
  - `phone`: PhoneNumber value object
  - `address`: string
  - `active`: boolean
  - `version`: number (optimistic locking)

### Value Objects

Value objects encapsulate validation and ensure data integrity:

- **UUID**: Globally unique identifier
- **Email**: Validated email address
- **PhoneNumber**: Validated phone number

## API Integration

The application communicates with the Laravel backend API:

- **Base URL**: `http://localhost:8000/api/v1`
- **Authentication**: Laravel Sanctum tokens (to be implemented)
- **Data Format**: JSON

### Example API Calls

```typescript
// List suppliers
GET /suppliers?page=1&per_page=15&search=term

// Get single supplier
GET /suppliers/{id}

// Create supplier
POST /suppliers
Body: { name, code, email, phone, address }

// Update supplier
PUT /suppliers/{id}
Body: { name, email, phone, address }

// Delete supplier
DELETE /suppliers/{id}
```

## State Management

Using Zustand for lightweight, scalable state management:

```typescript
// Example store
interface SupplierStore {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: CreateSupplierDTO) => Promise<void>;
}
```

## Offline Support

### Strategy
1. **Local Storage**: SQLite for structured data
2. **Sync Queue**: Track pending operations
3. **Conflict Resolution**: Last-write-wins with version control
4. **Background Sync**: Automatic synchronization when online

### Data Flow
```
User Action → Local Storage → Sync Queue → Backend API
                ↓                               ↓
          Optimistic UI Update         Confirmation/Conflict
```

## Testing Strategy

### Unit Tests
- Domain entities and value objects
- Use cases
- Validation logic

### Integration Tests
- Repository implementations
- API clients
- State management

### E2E Tests
- Critical user workflows
- Offline/online transitions
- Data synchronization

## Security

### Implemented
- TypeScript type safety
- Input validation
- HTTPS for API calls

### Planned
- Token-based authentication
- Secure token storage
- Biometric authentication
- Data encryption at rest
- Certificate pinning

## Performance Optimizations

1. **Lazy Loading**: Load screens on demand
2. **Memoization**: Cache computed values
3. **Virtual Lists**: Optimize long lists
4. **Image Optimization**: Compress and cache images
5. **Code Splitting**: Reduce initial bundle size

## Best Practices

1. **Always use TypeScript**: Type safety prevents bugs
2. **Keep components pure**: Separate business logic from UI
3. **Use custom hooks**: Encapsulate reusable logic
4. **Write tests**: Test critical business logic
5. **Document code**: Clear comments for complex logic
6. **Handle errors gracefully**: User-friendly error messages
7. **Optimize renders**: Use React.memo and useMemo appropriately

## Deployment

### Development
```bash
npm start
```

### Production Build

#### iOS
```bash
eas build --platform ios
eas submit --platform ios
```

#### Android
```bash
eas build --platform android
eas submit --platform android
```

## Troubleshooting

### Common Issues

**Metro bundler not starting**
```bash
npx expo start --clear
```

**Dependencies not installing**
```bash
rm -rf node_modules
npm install
```

**iOS simulator not launching**
```bash
xcrun simctl boot <device-id>
```

## Contributing

Follow the established architecture patterns:
1. Domain entities are immutable
2. Use cases handle business logic
3. Repositories abstract data access
4. UI components are presentational

## License

MIT

## Contact

For questions or support, contact the development team.
