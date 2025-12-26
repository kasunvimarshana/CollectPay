# Ledgerly Frontend

React Native (Expo) frontend for the Ledgerly Data Collection and Payment Management System.

## Architecture

This frontend follows **Clean Architecture** principles with clear separation of concerns:

### Layers

1. **Domain Layer** (`src/domain/`)
   - **Entities**: Core business entities (TypeScript interfaces)
   - **Repositories**: Repository interfaces defining data access contracts

2. **Application Layer** (`src/application/`)
   - **Use Cases**: Application-specific business rules and orchestration
   - **Services**: Application services for complex operations

3. **Presentation Layer** (`src/presentation/`)
   - **Screens**: UI screens for each feature
   - **Components**: Reusable UI components
   - **Navigation**: Navigation configuration

4. **Infrastructure Layer** (`src/infrastructure/`)
   - **API**: HTTP client and API integration
   - **Storage**: Secure local storage (encrypted)
   - **Auth**: Authentication management

## Key Features

- **Multi-user Support**: Role-based access with RBAC/ABAC
- **Multi-unit Tracking**: Support for kg, g, liters, etc.
- **Offline-Ready UI**: Optimistic UI updates with server synchronization
- **Secure Storage**: Encrypted local storage for sensitive data
- **Intuitive Interface**: User-friendly screens for data entry and reporting

## Core Screens

### Authentication
- Login
- Logout

### Dashboard
- Overview of recent collections
- Payment summaries
- Quick actions

### Suppliers
- List suppliers
- Add/Edit supplier
- View supplier details
- Collection history per supplier

### Products
- List products
- Add/Edit product
- View product details
- Rate history

### Collections
- List collections
- Add new collection (with multi-unit support)
- Edit collection
- View collection details

### Payments
- List payments
- Add payment (advance, partial, final)
- View payment details
- Payment calculator

### Reports
- Collection reports by date range
- Payment summaries
- Supplier balances

## State Management

Simple React state management with Context API:
- AuthContext: User authentication state
- DataContext: Application data (suppliers, products, collections, payments)

## API Integration

REST API integration using Axios:
- Centralized API client
- Token-based authentication (Bearer tokens)
- Error handling and retry logic
- Request/response interceptors

## Security

### Authentication
- JWT token-based authentication
- Secure token storage using expo-secure-store
- Automatic token refresh

### Data Protection
- HTTPS-only communication
- Secure local storage for sensitive data
- No sensitive data in logs

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Design Principles

### Clean Architecture
- Dependency inversion: UI depends on domain, not vice versa
- Clear layer boundaries
- Testable business logic

### SOLID Principles
- **S**ingle Responsibility: Each component has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable
- **I**nterface Segregation: Many specific interfaces over general ones
- **D**ependency Inversion: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)
- Reusable components and hooks
- Shared utilities and helpers

### KISS (Keep It Simple, Stupid)
- Straightforward implementations
- Minimal external dependencies
- Clear, readable code

## Project Structure

```
frontend/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── Supplier.ts
│   │   │   ├── Product.ts
│   │   │   ├── Collection.ts
│   │   │   └── Payment.ts
│   │   └── repositories/
│   │       └── *.ts (interfaces)
│   ├── application/
│   │   ├── usecases/
│   │   │   ├── auth/
│   │   │   ├── suppliers/
│   │   │   ├── products/
│   │   │   ├── collections/
│   │   │   └── payments/
│   │   └── services/
│   ├── presentation/
│   │   ├── screens/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Suppliers/
│   │   │   ├── Products/
│   │   │   ├── Collections/
│   │   │   └── Payments/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── specific/
│   │   └── navigation/
│   └── infrastructure/
│       ├── api/
│       │   ├── client.ts
│       │   └── endpoints/
│       ├── storage/
│       │   └── SecureStorage.ts
│       └── auth/
│           └── AuthManager.ts
├── __tests__/
├── assets/
├── app.json
├── package.json
└── README.md
```

## Development Guidelines

1. Follow Clean Architecture principles
2. Keep components small and focused
3. Use TypeScript for type safety
4. Write tests for business logic
5. Use meaningful variable and function names
6. Document complex logic
7. Handle errors gracefully
8. Provide user feedback for all actions

## Deployment

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## License

MIT
