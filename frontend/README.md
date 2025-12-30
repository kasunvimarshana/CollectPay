# FieldPay Ledger - React Native (Expo) Frontend

A production-ready, Clean Architecture React Native (Expo) mobile application for data collection and payment management.

## 🏗️ Architecture

This frontend follows **Clean Architecture** principles, ensuring clear separation of concerns and maintainability.

```
frontend/
├── src/
│   ├── domain/                  # Business Logic (Framework-independent)
│   │   ├── entities/           # Core business entities
│   │   ├── valueObjects/       # Immutable value objects
│   │   └── repositories/       # Repository interfaces
│   ├── application/            # Use Cases & Business Workflows
│   │   ├── useCases/          # Application-specific logic
│   │   └── dtos/              # Data Transfer Objects
│   ├── infrastructure/         # External Services & Data
│   │   ├── api/               # API client
│   │   ├── storage/           # Local storage
│   │   └── repositories/      # Repository implementations
│   └── presentation/           # UI Layer
│       ├── screens/           # Screen components
│       ├── components/        # Reusable UI components
│       ├── navigation/        # Navigation setup
│       └── state/            # State management (Zustand)
├── assets/                    # Images, fonts, etc.
└── App.tsx                   # Application entry point
```

## 🎯 Features

### Implemented
- ✅ Clean Architecture with SOLID principles
- ✅ TypeScript for type safety
- ✅ Domain entities and value objects
- ✅ Repository pattern with dependency inversion
- ✅ State management with Zustand
- ✅ API client with authentication
- ✅ Offline storage with AsyncStorage
- ✅ Navigation with React Navigation
- ✅ Reusable UI components
- ✅ Supplier management screens (List, Create)
- ✅ Product management screens (List, Create)
- ✅ Collection management screens (List)
- ✅ Payment management screens (List)
- ✅ **Offline-first architecture**
- ✅ **Network state monitoring**
- ✅ **Automatic sync queue**
- ✅ **Conflict resolution**
- ✅ **Optimistic UI updates**

### Next Priority
- 🔴 Authentication flow (Login, Register)
- 🔴 Create/Edit forms for Collections & Payments
- 🟡 Detail views for all entities
- 🟡 Role-based access control
- 🟡 Advanced conflict resolution UI

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator
- Backend API running at http://localhost:8000

### Installation

```bash
cd frontend
npm install
```

### Configuration

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Update the API URL in `.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator (macOS only)
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

## 📱 Core Concepts

### Domain Layer

The domain layer contains pure business logic, independent of any framework:

**Entities:**
- `User` - System users with roles
- `Supplier` - Supplier profiles
- `Product` - Products with units
- `Rate` - Versioned product rates
- `Collection` - Collection transactions
- `Payment` - Payment records

**Value Objects:**
- `UserId` - UUID identifiers
- `Email` - Validated email addresses
- `Money` - Currency-aware amounts
- `Quantity` - Multi-unit quantities
- `Unit` - Measurement units

### Application Layer

Use cases implement application-specific business workflows:

- `CreateSupplierUseCase`
- `ListSuppliersUseCase`
- `CreateCollectionUseCase`
- `CreatePaymentUseCase`

### Infrastructure Layer

Handles external dependencies:

- **ApiClient**: HTTP communication with backend
- **StorageService**: Local data persistence
- **Repositories**: Data access implementations

### Presentation Layer

React Native UI components and screens:

- **Components**: Button, Input, Card, Loading
- **Screens**: Home, Suppliers, CreateSupplier
- **State**: Zustand stores for state management
- **Navigation**: React Navigation setup

## 🔐 Security

- Secure token storage using Expo SecureStore
- API authentication with Bearer tokens
- Input validation on all forms
- HTTPS for all API communication
- Offline data caching with integrity checks
- Automatic sync with conflict detection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Building

### Development Build

```bash
expo build:android
expo build:ios
```

### Production Build with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 🎨 UI/UX Guidelines

- Follow iOS Human Interface Guidelines and Material Design
- Use consistent spacing (8px grid system)
- Maintain color consistency throughout the app
- Provide clear feedback for user actions
- Support both light and dark modes (future)

## 🔧 Development Workflow

1. **Domain First**: Start with domain entities and value objects
2. **Use Cases**: Implement application logic
3. **Infrastructure**: Create repository implementations
4. **Presentation**: Build UI components and screens
5. **Testing**: Write tests for each layer
6. **Documentation**: Update documentation

## 📝 Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful variable and function names
- Add JSDoc comments for complex logic
- Keep functions small and focused (KISS principle)
- Avoid code duplication (DRY principle)

## 🤝 Contributing

1. Follow Clean Architecture principles
2. Write tests for new features
3. Update documentation
4. Use meaningful commit messages
5. Create pull requests for review

## 📄 License

MIT License

## 🙏 Acknowledgments

- Laravel Backend API
- React Native Community
- Expo Team
- Clean Architecture by Uncle Bob

---

**Status**: 🟡 **In Development**

**Last Updated**: December 27, 2025
