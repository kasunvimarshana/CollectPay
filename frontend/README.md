# Field Ledger - Frontend (React Native / Expo)

## Architecture Overview

This frontend application follows **Clean Architecture** principles, ensuring separation of concerns, testability, and maintainability.

## Project Structure

```
src/
├── domain/                 # Business Logic Layer (Framework Independent)
│   ├── entities/          # Core business entities (User, Supplier, Product, etc.)
│   ├── repositories/      # Repository interfaces (contracts)
│   ├── usecases/          # Business use cases
│   └── valueobjects/      # Value objects (Money, Quantity, etc.)
│
├── data/                  # Data Layer
│   ├── datasources/       # Data sources (API, Local DB)
│   │   ├── api/          # API data sources
│   │   └── local/        # Local storage data sources
│   ├── repositories/      # Repository implementations
│   └── models/            # Data models
│
├── presentation/          # Presentation Layer
│   ├── screens/          # Screen components
│   ├── components/       # Reusable UI components
│   ├── navigation/       # Navigation configuration
│   └── state/            # State management (Zustand)
│
└── core/                  # Core Utilities
    ├── network/          # API client, network utilities
    ├── storage/          # Local storage, offline queue
    ├── utils/            # Helper functions
    └── constants/        # App constants, configurations
```

## Layers Explained

### 1. Domain Layer (Business Logic)
- **Entities**: Pure TypeScript interfaces representing business objects
- **Repositories**: Interfaces defining data operations contracts
- **Use Cases**: Business logic operations
- **Framework Independent**: No React Native or external dependencies

### 2. Data Layer
- **Repositories**: Concrete implementations of repository interfaces
- **Data Sources**: API clients and local database access
- **Models**: Data transformation between API and domain entities

### 3. Presentation Layer
- **Screens**: Full-page components
- **Components**: Reusable UI components
- **Navigation**: React Navigation configuration
- **State Management**: Zustand for global state

### 4. Core Layer
- **Network**: API client with authentication
- **Storage**: AsyncStorage wrapper, offline queue manager
- **Utils**: Common utilities
- **Constants**: API endpoints, configuration

## Key Features

### Clean Architecture Benefits
- ✅ **Testability**: Business logic can be tested without UI
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Scalability**: Easy to add new features
- ✅ **Flexibility**: Can swap implementations easily

### Offline Support
- Local data persistence with AsyncStorage
- Offline operation queue
- Automatic sync when connection restored
- Conflict detection and resolution

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage
- Role-based access control

## Dependencies

### Core Dependencies
- **React Native**: Mobile framework
- **Expo**: Development and build tooling
- **React Navigation**: Navigation library
- **Zustand**: Lightweight state management
- **Axios**: HTTP client
- **AsyncStorage**: Local storage

### Development Dependencies
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Jest**: Testing framework

## Getting Started

### Prerequisites
```bash
# Node.js 18+ required
node --version

# npm or yarn
npm --version
```

### Installation
```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Configuration

1. **API Configuration**
   - Update `src/core/constants/api.ts`
   - Set `API_BASE_URL` to your backend URL

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Configure API endpoint and other settings

## Development Guidelines

### Adding a New Feature

1. **Define Domain Entity** (if needed)
   ```typescript
   // src/domain/entities/NewEntity.ts
   export interface NewEntity {
     id: string;
     name: string;
     // ... other properties
   }
   ```

2. **Define Repository Interface**
   ```typescript
   // src/domain/repositories/NewRepositoryInterface.ts
   export interface NewRepositoryInterface {
     getAll(): Promise<NewEntity[]>;
     getById(id: string): Promise<NewEntity>;
     // ... other methods
   }
   ```

3. **Implement Repository**
   ```typescript
   // src/data/repositories/NewRepository.ts
   export class NewRepository implements NewRepositoryInterface {
     // Implementation using apiClient
   }
   ```

4. **Create Screen**
   ```tsx
   // src/presentation/screens/NewScreen.tsx
   export const NewScreen = () => {
     // Use repository to fetch data
     // Render UI
   }
   ```

### Folder Structure Rules

- **Domain Layer**: No external dependencies (pure TypeScript)
- **Data Layer**: Can import from Domain and Core
- **Presentation Layer**: Can import from all layers
- **Core Layer**: No dependencies on other layers

### Code Style

- Use TypeScript for all new files
- Follow functional component patterns
- Use hooks for state management
- Follow Clean Architecture principles
- Write meaningful comments
- Keep components small and focused

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Testing Strategy
- **Unit Tests**: Domain entities, use cases, utils
- **Integration Tests**: Repository implementations
- **Component Tests**: UI components
- **E2E Tests**: Critical user workflows

## Build & Deployment

### Build for Production
```bash
# Build Android APK
expo build:android

# Build iOS IPA
expo build:ios

# Build for Web
expo build:web
```

### App Configuration
- Update `app.json` with your app details
- Configure splash screen and icon
- Set up environment-specific builds

## Troubleshooting

### Common Issues

**Problem**: API connection fails
- Check `API_BASE_URL` in `src/core/constants/api.ts`
- Ensure backend is running
- Check network connectivity

**Problem**: Dependencies not installing
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall
- Update npm/node to latest versions

**Problem**: TypeScript errors
- Run `npm install` to install types
- Check `tsconfig.json` configuration
- Restart TypeScript server in IDE

## Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## License

Private - All Rights Reserved
