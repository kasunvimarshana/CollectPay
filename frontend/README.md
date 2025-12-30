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
- ✅ Authentication service with login and registration
- ✅ Navigation with 23 screens
- ✅ RBAC/ABAC security with permission-based access control
- ✅ Server-side pagination, sorting, and filtering
- ✅ Offline support with SQLite storage
- ✅ Sync service for offline-online data synchronization
- ✅ Conflict resolution service
- ✅ Reusable UI components (Pagination, SortButton, Loading, EmptyState, ErrorMessage, Card, Header)
- ✅ Reports and analytics dashboard
- ✅ Multi-unit tracking for products and collections
- ✅ Rate versioning with historical preservation
- ✅ Automated payment calculations
- ✅ Constants and configuration

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
- [Sync Service](src/application/services/SyncService.ts)
- [API Client](src/infrastructure/api/apiClient.ts)
- [RBAC/ABAC Permissions](src/core/utils/permissions.ts)
- [Reusable Components](src/presentation/components/)

## 📱 Complete Screen List

### Authentication
- LoginScreen - User authentication
- RegisterScreen - User registration

### Main Navigation
- HomeScreen - Dashboard with role-based menu
- ReportsScreen - Analytics and financial summaries

### Suppliers
- SupplierListScreen - List with pagination, search, sort
- SupplierFormScreen - Create/Edit supplier
- SupplierDetailScreen - View supplier details and balance

### Products & Rates
- ProductListScreen - List with pagination, search, sort
- ProductFormScreen - Create/Edit product with multi-unit support
- ProductDetailScreen - View product details
- RateHistoryScreen - Historical rate versions

### Collections
- CollectionListScreen - List with pagination, search, sort
- CollectionFormScreen - Create/Edit collection with auto-calculation
- CollectionDetailScreen - View collection details

### Payments
- PaymentListScreen - List with pagination, search, sort
- PaymentFormScreen - Create/Edit payment (advance/partial/full)
- PaymentDetailScreen - View payment details

### Users & Roles
- UserListScreen - List with pagination, search, sort
- UserFormScreen - Create/Edit user with role assignment
- UserDetailScreen - View user details
- RoleListScreen - List roles with permissions
- RoleFormScreen - Create/Edit roles
- RoleDetailScreen - View role details and permissions

## 🤝 Contributing

Follow Clean Architecture principles:
1. Keep layers separated
2. Use dependency injection
3. Write tests for business logic
4. Document complex logic
5. Follow TypeScript best practices

## 📄 License

[Specify your license here]
