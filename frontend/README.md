# LedgerFlow Frontend

Mobile application for the LedgerFlow Platform built with React Native (Expo) following Clean Architecture.

## Architecture

This frontend follows **Clean Architecture** with clear layer separation:

- **Domain Layer**: Business entities and use cases
- **Data Layer**: Repository implementations and data sources
- **Presentation Layer**: UI components and screens
- **Infrastructure Layer**: External services (database, network, sync)

## Technology Stack

- React Native
- Expo SDK 51
- TypeScript
- React Navigation
- SQLite (local database)
- Axios (HTTP client)

## Directory Structure

```
frontend/
├── src/
│   ├── domain/              # Business logic
│   │   ├── entities/        # Domain entities
│   │   ├── repositories/    # Repository interfaces
│   │   └── usecases/        # Business use cases
│   ├── data/                # Data access
│   │   ├── datasources/     # Local & remote data sources
│   │   ├── repositories/    # Repository implementations
│   │   └── models/          # Data models
│   ├── presentation/        # UI layer
│   │   ├── screens/         # Screen components
│   │   ├── components/      # Reusable components
│   │   ├── navigation/      # Navigation configuration
│   │   └── state/           # State management
│   └── infrastructure/      # External services
│       ├── database/        # SQLite setup
│       ├── network/         # HTTP client
│       ├── security/        # Authentication
│       └── sync/            # Offline sync
├── assets/                  # Images, fonts
├── __tests__/              # Tests
├── App.tsx                 # Main component
├── index.js                # Entry point
├── app.json                # Expo configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI
- iOS Simulator (Mac) or Android Studio (Android)

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/simulator:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Features

### Core Features
- ✅ User Authentication (JWT)
- ✅ Multi-user support with RBAC
- ✅ Offline-first architecture
- ✅ Automatic sync when online
- ✅ Multi-device support
- ✅ Conflict resolution

### Modules
- **Users**: User management with role assignment
- **Suppliers**: Supplier profile management
- **Products**: Product management with multi-unit support
- **Collections**: Data collection with quantity tracking
- **Payments**: Payment tracking (advance/partial/full)
- **Reports**: Financial reports and analytics

## Development

### Adding New Features

1. Define entities in `src/domain/entities/`
2. Create repository interfaces in `src/domain/repositories/`
3. Implement use cases in `src/domain/usecases/`
4. Create data sources in `src/data/datasources/`
5. Implement repositories in `src/data/repositories/`
6. Build UI components in `src/presentation/`

### Code Style

```bash
npm run lint
```

### Testing

```bash
npm test
```

## Offline Support

The app supports offline operation with automatic synchronization:

1. **Local Storage**: SQLite database for offline data
2. **Queue System**: Pending operations queued when offline
3. **Conflict Detection**: Version-based conflict detection
4. **Automatic Sync**: Background sync when connection restored
5. **Manual Sync**: Pull-to-refresh for manual sync

## State Management

- React Context API for global state
- Custom hooks for business logic
- Repository pattern for data access

## Security

- Secure token storage (Expo SecureStore)
- Encrypted local database
- HTTPS-only communication
- Input validation
- XSS prevention

## Performance

- Lazy loading
- Image optimization
- List virtualization
- Memoization
- Debounced search

## Build & Deploy

### Development Build

```bash
expo build:android
expo build:ios
```

### Production Build

```bash
eas build --platform android
eas build --platform ios
```

## Environment Variables

Create `.env` file:
```
API_BASE_URL=http://localhost:8080/api/v1
API_TIMEOUT=30000
```

## Contributing

1. Follow Clean Architecture principles
2. Write TypeScript with strict mode
3. Create unit tests for use cases
4. Follow React Native best practices
5. Document complex logic

## License

MIT
