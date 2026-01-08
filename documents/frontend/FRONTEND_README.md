# Frontend - Data Collection and Payment Management System

React Native (Expo) mobile application following Clean Architecture principles.

> **📌 Latest Update**: Upgraded to **Expo SDK 54** (latest stable version) with React 19.1.0 and React Native 0.81.5

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
- **Node.js 20.x** (v20.17.0 or later recommended)
- **npm 10.x** (v10.0.0 or later)
- **Expo SDK 54** (latest stable)
- iOS Simulator (macOS) or Android Emulator

> ⚠️ **Important**: This project requires Node.js v20.x and npm v10.x. Do NOT use Node.js v24.x with npm v11.6.x as it has a known bug that causes "Class extends value undefined is not a constructor or null" error. This is related to compatibility issues between React Native and Node.js v24. For more details, see the [Expo compatibility documentation](https://docs.expo.dev/guides/troubleshooting-errors/).

### Installation

#### Step 1: Verify Node and npm Versions

```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

If you're using the wrong version, use nvm (Node Version Manager) to switch:

```bash
# Install nvm if you haven't already (see https://github.com/nvm-sh/nvm)

# Use Node v20
nvm use 20

# Or install Node v20 if not available
nvm install 20
```

#### Step 2: Install Dependencies

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
- ✅ Reusable UI components (Pagination, SortButton, Loading, EmptyState, ErrorMessage, Card, Header, DateTimePicker)
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
- **React 19.1.0**: UI library
- **React Native 0.81.5**: Mobile framework
- **Expo SDK 54**: Development platform and tooling
- **TypeScript 5.9**: Type safety

### State Management
- **React Context API**: State management

### Navigation
- **React Navigation 7**: App navigation

### Storage
- **AsyncStorage 2.2**: Local key-value storage
- **SQLite 16**: Offline data persistence

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
- [DateTimePicker Component Guide](DATETIMEPICKER_GUIDE.md) - Native date/time picker

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

## 🐛 Troubleshooting

### Expo SDK 54 Migration Notes

**Important Changes:**
- **expo-file-system**: The legacy API (documentDirectory, createDownloadResumable) must be imported from `'expo-file-system/legacy'`
- **React 19**: Upgraded from React 18 - minor behavioral changes may apply
- **TypeScript 5.9**: Required for SDK 54 compatibility (was 5.3)
- **moduleResolution**: Changed to "bundler" in tsconfig.json

**If you encounter issues after upgrading:**
1. Clean install:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear Metro bundler cache:
   ```bash
   npx expo start --clear
   ```

### npm Error: "Class extends value undefined is not a constructor or null"

**Problem**: This error occurs when using npm v11.6.x (bundled with Node.js v24.x) due to a bug in the minizlib package.

**Solution**:
1. Switch to Node.js v20.x using nvm:
   ```bash
   nvm use 20
   ```
2. Verify your versions:
   ```bash
   node --version  # Should show v20.x.x
   npm --version   # Should show 10.x.x
   ```
3. Clear npm cache and reinstall:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

### Other Common Issues

**Error: "Cannot find module 'expo'"**
- Run `npm install` to install all dependencies

**Metro bundler issues**
- Clear Metro cache: `npx expo start --clear`
- Clear node_modules: `rm -rf node_modules && npm install`

**Network connectivity issues**
- Check your backend API URL in `src/core/constants/api.ts`
- Ensure your backend server is running
- Check your firewall and network settings
