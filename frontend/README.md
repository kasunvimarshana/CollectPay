# PayCore Frontend

## Overview
React Native (Expo) mobile application for the PayCore Data Collection and Payment Management System.

## Features
- **Authentication**: Secure login and registration
- **Supplier Management**: Create, view, and manage suppliers
- **Product Management**: Manage products with multi-unit support
- **Collection Tracking**: Record daily collections with automatic rate application
- **Payment Management**: Track advance, partial, and full payments
- **Real-time Data**: Multi-user and multi-device synchronization
- **Secure Storage**: Encrypted token storage using Expo SecureStore

## Tech Stack
- React Native with Expo
- TypeScript
- React Navigation
- Axios for API calls
- Expo SecureStore for secure token storage
- Context API for state management

## Prerequisites
- Node.js >= 18
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

## Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**
   Edit `src/constants/index.ts` to set your backend API URL:
   ```typescript
   export const API_BASE_URL = 'http://YOUR_BACKEND_IP:8000/api';
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Emulator**
   - Press `a` for Android
   - Press `i` for iOS (Mac only)
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/         # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/      # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/         # Screen components
│   │   ├── Auth/
│   │   ├── Home/
│   │   ├── Suppliers/
│   │   ├── Products/
│   │   ├── Collections/
│   │   └── Payments/
│   ├── services/        # API services
│   │   └── api.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── constants/       # App constants and config
│   │   └── index.ts
│   └── utils/           # Utility functions
├── App.tsx              # Root component
├── package.json
└── tsconfig.json
```

## Key Features Implementation

### Authentication
- Secure token-based authentication using Laravel Sanctum
- Persistent login with encrypted token storage
- Auto-logout on token expiration

### Multi-Unit Support
- Configurable unit types (kg, g, l, ml, etc.)
- Unit conversion support
- Consistent unit display across app

### Data Integrity
- Optimistic UI updates with rollback on error
- Conflict resolution for concurrent operations
- Local data validation before API calls

### Security
- Encrypted token storage via Expo SecureStore
- HTTPS-only API communication
- No sensitive data in logs or async storage

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## API Integration

All API calls go through the centralized `ApiService` class located in `src/services/api.ts`. This handles:
- Authentication token injection
- Response/error handling
- Token expiration management

Example usage:
```typescript
import ApiService from '../services/api';

const suppliers = await ApiService.getSuppliers({ is_active: true });
```

## Contributing
- Follow TypeScript best practices
- Use functional components with hooks
- Keep components small and focused
- Add proper error handling

## License
Proprietary - All rights reserved
