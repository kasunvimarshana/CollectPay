# TransacTrack Mobile App

React Native (Expo) mobile application for data collection and payment management, designed for offline-first operation in rural and low-connectivity environments.

## Features

- **Offline-First Architecture**: Full functionality without internet connection
- **Automatic Sync**: Seamless data synchronization when online
- **Network Monitoring**: Real-time connection status tracking
- **Conflict Resolution**: Robust handling of sync conflicts
- **Secure Authentication**: JWT-based authentication with secure storage
- **Supplier Management**: Create and manage supplier profiles
- **Product Tracking**: Track product collections with multiple units
- **Payment Processing**: Record and manage various payment types
- **Data Encryption**: Secure local data storage
- **Role-Based Access**: Support for different user roles

## Requirements

- Node.js >= 18
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API endpoint in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://your-backend-url:8000/api"
    }
  }
}
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   ├── services/       # API and sync services
│   ├── store/          # Redux store and slices
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── App.tsx             # Main app component
├── app.json            # Expo configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

## State Management

The app uses Redux Toolkit with Redux Persist for state management:

- **auth**: Authentication state and user data
- **app**: Application state (online status, sync status)
- **suppliers**: Supplier data
- **products**: Product catalog
- **collections**: Collection records
- **payments**: Payment transactions
- **sync**: Synchronization state and conflicts

## Offline Functionality

The app implements a comprehensive offline-first strategy:

1. **Local Storage**: All data stored locally using Redux Persist
2. **Network Detection**: Automatic detection of online/offline status
3. **Queue Management**: Pending operations queued for sync
4. **Automatic Sync**: Background sync when connection restored
5. **Conflict Resolution**: Smart conflict detection and resolution UI

## Security Features

- **Secure Storage**: Authentication tokens stored in Expo SecureStore
- **Encrypted Communication**: HTTPS for all API requests
- **Token Refresh**: Automatic token management
- **Data Validation**: Client-side validation before submission
- **Role-Based Access**: UI adapts based on user permissions

## Sync Strategy

The sync process follows these steps:

1. Detect network connectivity change to online
2. Collect pending collections and payments
3. Send batch sync request to server
4. Receive server updates and conflicts
5. Merge server data with local data
6. Present conflicts to user for resolution
7. Update sync timestamp

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Environment Variables

Configure in `app.json` under `extra`:

- `apiUrl`: Backend API base URL

## User Roles

- **Admin**: Full system access
- **Manager**: Manage users and view reports
- **Collector**: Record collections and payments
- **Viewer**: Read-only access

## Known Limitations

- Location services require user permission
- Background sync limited by platform restrictions
- Large datasets may impact performance on older devices

## Troubleshooting

### App won't connect to API
- Check API URL in `app.json`
- Ensure backend is running
- Verify network connectivity

### Sync not working
- Check online status indicator
- Review pending sync count
- Check for conflicts that need resolution

### Build errors
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall
- Update Expo CLI: `npm install -g expo-cli`

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Submit pull request

## License

MIT License
