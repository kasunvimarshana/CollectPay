# TrackVault Mobile App

Production-ready React Native (Expo) mobile application for the TrackVault Data Collection and Payment Management System.

## Architecture

This application follows **Clean Architecture** principles:

```
frontend/
├── src/
│   ├── domain/             # Business logic
│   │   ├── entities/       # Domain entities (TypeScript interfaces)
│   │   ├── repositories/   # Repository interfaces
│   │   └── services/       # Domain services
│   ├── application/        # Use cases and state
│   │   ├── useCases/       # Application use cases
│   │   ├── state/          # State management
│   │   └── validation/     # Input validation
│   ├── infrastructure/     # External concerns
│   │   ├── api/            # API client
│   │   ├── storage/        # Local storage
│   │   └── security/       # Security utilities
│   └── presentation/       # UI layer
│       ├── screens/        # Screen components
│       ├── components/     # Reusable components
│       └── navigation/     # Navigation setup
├── assets/                 # Images and static resources
└── __tests__/              # Tests
```

## Features

- **User Management**: User authentication and profile management
- **Supplier Management**: Create and manage supplier profiles
- **Product Management**: Manage products with versioned rates
- **Collection Tracking**: Record collections with multi-unit support
- **Payment Management**: Track advance, partial, and full payments
- **Automated Calculations**: Real-time payment calculations
- **Offline Support**: Local persistence during connectivity loss
- **Secure Storage**: Encrypted data storage on device
- **Multi-User Support**: Concurrent operations across devices

## Requirements

- Node.js 18+ and npm/yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android)

## Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   # Create .env file with API endpoint
   echo "API_BASE_URL=http://localhost:8000/api" > .env
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Run on device/emulator**:
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## Project Structure

### Domain Layer
Contains business entities, repository interfaces, and domain logic independent of frameworks.

### Application Layer
Implements use cases, manages application state, and handles validation.

### Infrastructure Layer
Handles external concerns like API calls, local storage, and encryption.

### Presentation Layer
Contains UI components, screens, and navigation setup.

## Key Screens

- **Login/Authentication**: User authentication
- **Dashboard**: Overview of recent collections and payments
- **Suppliers**: List and manage suppliers
- **Products**: List and manage products
- **Collections**: Record and view collections
- **Payments**: Record and view payments
- **Reports**: View financial reports and analytics

## State Management

The application uses a lightweight state management solution with React Context API for:
- Authentication state
- User session
- Cached data
- UI state

## Security

- **Secure Storage**: Sensitive data encrypted using expo-secure-store
- **JWT Authentication**: Token-based authentication
- **HTTPS**: All API calls over HTTPS (production)
- **Input Validation**: Client-side validation before API calls

## Testing

Run tests:
```bash
npm test
```

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Environment Variables

Create a `.env` file with:
```
API_BASE_URL=https://your-api-domain.com/api
```

## License

MIT
