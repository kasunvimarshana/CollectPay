# CollectPay Mobile

React Native (Expo) mobile application for offline-first data collection and payment management.

## Features

- Offline-first architecture with WatermelonDB
- Automatic sync when online
- JWT authentication
- Real-time calculations
- Conflict resolution
- Cross-platform (iOS & Android)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API endpoint:
Edit `src/services/api.ts` and set your backend URL.

3. Start development:
```bash
npm start
```

4. Run on device:
- iOS: Press `i`
- Android: Press `a`
- Physical device: Scan QR code with Expo Go

## Building

For production builds:

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Testing

```bash
npm test
```
