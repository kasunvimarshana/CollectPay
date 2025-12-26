# FieldLedger Mobile Frontend

React Native (Expo) mobile application for field data collection and payment management with offline-first capabilities.

## Features

- **Offline-First**: Works seamlessly without internet connection
- **Automatic Sync**: Synchronizes data when connection is restored
- **Secure Storage**: Encrypted local data storage
- **Real-time Updates**: Live network status monitoring
- **Cross-Platform**: Runs on iOS, Android, and Web

## Tech Stack

- React Native with Expo
- TypeScript for type safety
- Expo Router for navigation
- Zustand for state management
- Expo SQLite for offline storage
- Expo SecureStore for sensitive data
- Axios for API communication
- TanStack Query for data fetching

## Project Structure

```
frontend/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   │   └── login.tsx
│   ├── (tabs)/            # Main application screens
│   │   └── home.tsx
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── src/
│   ├── api/               # API client
│   │   └── client.ts
│   ├── database/          # Local database
│   │   └── localDb.ts
│   ├── services/          # Business logic
│   │   └── syncManager.ts
│   ├── store/             # State management
│   │   ├── authStore.ts
│   │   └── networkStore.ts
│   └── types/             # TypeScript types
│       └── index.ts
├── components/            # Reusable components
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

3. Start development server:
```bash
npm start
```

4. Run on platform:
```bash
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

## Environment Variables

- `EXPO_PUBLIC_API_URL`: Backend API URL

## Key Features

### Authentication
- Secure login with device registration
- Token-based authentication
- Automatic token refresh
- Biometric authentication ready

### Offline Support
- Local SQLite database
- Automatic sync queue
- Conflict detection and resolution
- Network status monitoring

### Data Management
- Supplier CRUD operations
- Transaction recording
- Payment tracking
- Balance calculations

### Security
- Expo SecureStore for sensitive data
- Token encryption
- Secure API communication
- Session management

## Development

### Code Quality
```bash
npm run lint
```

### Testing
```bash
npm test
```

### Building
```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform ios
eas build --profile production --platform android
```

## API Integration

The app communicates with the Laravel backend API. All requests include:
- Bearer token authentication
- JSON content type
- 30-second timeout
- Automatic retry on failure

## State Management

### Auth Store (Zustand)
- User authentication state
- Token management
- Device registration

### Network Store (Zustand)
- Connection status
- Network type
- Reachability

## Offline Sync

The sync manager automatically:
1. Detects network connectivity
2. Queues offline operations
3. Syncs when connection restored
4. Handles conflicts
5. Updates local database

## License

MIT License
