# Paywise Frontend - React Native (Expo)

Mobile application for the Paywise data collection and payment management system.

## Features

- **Cross-platform** - Works on iOS, Android, and Web
- **Authentication** - Secure login with token-based auth
- **Real-time data** - Live updates from backend API
- **Offline-ready** - Local storage with AsyncStorage
- **Clean Architecture** - Modular and maintainable codebase
- **User-friendly UI** - Intuitive interface for data entry and management

## Tech Stack

- **React Native** with Expo
- **React Navigation** for routing
- **Axios** for HTTP requests
- **AsyncStorage** for local data persistence
- **Context API** for state management

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (installed automatically with npx)
- iOS Simulator (macOS) or Android Emulator
- Or use Expo Go app on your physical device

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API base URL in `src/api/client.js`:
```javascript
const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';
```

For local development:
- **iOS Simulator**: `http://localhost:8000/api`
- **Android Emulator**: `http://10.0.2.2:8000/api`
- **Physical Device**: Use your computer's local IP address

## Running the App

### Start the development server:
```bash
npm start
```

### Run on specific platforms:

**iOS (requires macOS):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web:**
```bash
npm run web
```

### Using Expo Go (Easiest Method)

1. Install Expo Go app on your iOS or Android device
2. Run `npm start`
3. Scan the QR code with your device
4. Make sure your device and computer are on the same network

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.js     # Axios configuration
│   │   └── index.js      # API methods
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers
│   │   └── AuthContext.js
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.js
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── SuppliersScreen.js
│   │   ├── ProductsScreen.js
│   │   ├── CollectionsScreen.js
│   │   └── PaymentsScreen.js
│   ├── utils/            # Utility functions
│   └── constants/        # App constants
├── App.js                # Root component
└── package.json          # Dependencies
```

## Default Login Credentials

Use these credentials to test the application:

| Role      | Email                    | Password |
|-----------|--------------------------|----------|
| Admin     | admin@paywise.com        | password |
| Manager   | manager@paywise.com      | password |
| Collector | collector@paywise.com    | password |

## Key Features

### Authentication
- Secure token-based authentication
- Automatic token refresh
- Persistent login state

### Suppliers Management
- View all suppliers
- Filter by status
- Search by name or code
- Real-time updates

### Products Management
- View products with current rates
- Rate versioning support
- Multi-unit tracking

### Collections
- Record daily collections
- Automatic rate application
- Multi-unit quantity support
- Real-time total calculations

### Payments
- Track advance, partial, and full payments
- Payment history
- Supplier payment status

## Development Tips

### Debugging
- Use `console.log()` for quick debugging
- Use React Native Debugger for advanced debugging
- Check Metro bundler logs for errors

### Hot Reload
- The app automatically reloads when you save changes
- Shake your device or press Cmd+D (iOS) / Cmd+M (Android) for dev menu

### API Configuration
- For testing with a remote server, update `API_BASE_URL` in `src/api/client.js`
- Ensure CORS is properly configured on the backend

## Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

### Using EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### Cannot connect to backend
- Check if backend server is running
- Verify API_BASE_URL is correct
- Ensure device/emulator can reach the backend
- Check firewall settings

### Module not found errors
- Run `npm install` again
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall

### iOS Simulator not loading
- Make sure Xcode is installed
- Run `sudo xcode-select --switch /Applications/Xcode.app`

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## License

Proprietary - All rights reserved
