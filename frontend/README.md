# Frontend - Data Collection and Payment Management System

React Native (Expo) mobile application following Clean Architecture principles.

## 📁 Project Structure

```
src/
├── domain/               # Domain Layer (Business Entities)
│   ├── entities/        # Domain entities
│   ├── repositories/    # Repository interfaces
│   └── usecases/       # Business use cases
├── application/         # Application Layer
│   ├── services/       # Application services (AuthService, etc.)
│   └── dtos/          # Data Transfer Objects
├── infrastructure/      # Infrastructure Layer
│   ├── api/           # API client implementation
│   ├── storage/       # Local storage (SQLite, AsyncStorage)
│   └── repositories/  # Repository implementations
├── presentation/        # Presentation Layer
│   ├── screens/       # Screen components
│   ├── components/    # Reusable UI components
│   ├── navigation/    # Navigation configuration
│   └── state/        # State management
└── core/               # Core utilities
    ├── constants/     # Application constants
    ├── utils/        # Utility functions
    └── hooks/        # Custom React hooks
```

## 🏗️ Clean Architecture

This project follows Clean Architecture principles with clear separation of concerns:

### Domain Layer
- **Entities**: Pure business objects (User, Supplier, Product, etc.)
- **Repositories**: Interfaces for data access
- **Use Cases**: Business logic and rules

### Application Layer
- **Services**: Orchestrate business logic (AuthService, etc.)
- **DTOs**: Data structures for transferring data between layers

### Infrastructure Layer
- **API Client**: HTTP client for backend communication
- **Storage**: Local data persistence
- **Repositories**: Concrete implementations of repository interfaces

### Presentation Layer
- **Screens**: Full-page views
- **Components**: Reusable UI components
- **Navigation**: App navigation structure
- **State**: State management (Context API)

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x+
- npm 10.x+
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS (macOS only)
npm run web      # Web browser
```

## 🔧 Configuration

### API Configuration

Update the API base URL in `src/core/constants/api.ts`:

```typescript
export const API_BASE_URL = 'http://your-backend-url:8000/api';
```

Or set the environment variable:
```bash
export EXPO_PUBLIC_API_URL=http://your-backend-url:8000/api
```

## 📱 Features

### Implemented
- ✅ Clean Architecture structure
- ✅ API client with token authentication
- ✅ Domain entities (User, Supplier, Product, Collection, Payment)
- ✅ Authentication service
- ✅ Constants and configuration

### To Be Implemented
- ⏳ Navigation setup
- ⏳ Authentication screens (Login, Register)
- ⏳ CRUD screens for all entities
- ⏳ State management (Context API)
- ⏳ Offline storage
- ⏳ UI components library
- ⏳ Form validation
- ⏳ Error handling

## 🎨 Design Principles

### SOLID Principles
- **Single Responsibility**: Each class/module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes can substitute base classes
- **Interface Segregation**: Many specific interfaces vs. one general
- **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)
- Reusable components and utilities
- Shared constants and configurations
- Common API patterns

### KISS (Keep It Simple, Stupid)
- Clear, readable code
- Simple solutions over complex ones
- Minimal abstractions

## 🔐 Security

- JWT token authentication
- Secure storage for sensitive data
- API request timeout handling
- Error handling and validation

## 📚 Dependencies

### Core
- **React Native**: Mobile framework
- **Expo**: Development platform
- **TypeScript**: Type safety

### State Management
- **React Context API**: Planned for state management

### Navigation
- **React Navigation**: App navigation

### Storage
- **AsyncStorage**: Local key-value storage
- **SQLite**: Planned for offline data

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 📖 Documentation

- [API Constants](src/core/constants/api.ts)
- [Domain Entities](src/domain/entities/)
- [Authentication Service](src/application/services/AuthService.ts)
- [API Client](src/infrastructure/api/apiClient.ts)

## 🤝 Contributing

Follow Clean Architecture principles:
1. Keep layers separated
2. Use dependency injection
3. Write tests for business logic
4. Document complex logic
5. Follow TypeScript best practices

## 📄 License

[Specify your license here]
