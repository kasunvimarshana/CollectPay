# FieldSync Payments - Mobile App

A React Native (Expo) mobile application for data collection and payment management, designed for tea leaf collection and agricultural supply chain operations.

## Features

- **Offline-first architecture**: Full functionality without internet connectivity
- **Real-time sync**: Automatic synchronization when online
- **Supplier management**: Track suppliers, balances, and contact info
- **Collection tracking**: Record product collections with rate snapshots
- **Payment processing**: Multiple payment methods (cash, bank transfer, cheque, mobile money)
- **Role-based access control**: Admin, Manager, and Collector roles

## Tech Stack

- **React Native** with **Expo SDK 52**
- **Expo Router 4.0** for file-based navigation
- **expo-sqlite** for local offline storage
- **expo-secure-store** for secure token storage
- **TypeScript** for type safety
- **Clean Architecture** with domain-driven design

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Devices

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Physical device (scan QR code with Expo Go app)
npx expo start
```

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (app)/             # Main app (tabs)
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── suppliers.tsx
│   │   ├── collections.tsx
│   │   ├── payments.tsx
│   │   └── settings.tsx
│   ├── suppliers/         # Supplier screens
│   ├── collections/       # Collection screens
│   ├── payments/          # Payment screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry redirect
├── src/
│   ├── components/        # Reusable UI components
│   │   └── ui/           # Button, Card, TextInput, Badge
│   ├── domain/           # Business logic
│   │   ├── entities/     # TypeScript interfaces
│   │   ├── repositories/ # Repository interfaces
│   │   └── services/     # Domain services
│   ├── hooks/            # React hooks
│   ├── services/         # Infrastructure services
│   │   ├── api/          # API client
│   │   ├── auth/         # Authentication
│   │   ├── database/     # SQLite repositories
│   │   └── sync/         # Sync engine
│   └── theme/            # Design tokens
├── app.json              # Expo config
├── package.json
└── tsconfig.json
```

## Architecture

### Domain Layer

- **Entities**: User, Supplier, Product, Collection, Payment
- **Services**: CollectionService, PaymentService, PermissionService
- **Repositories**: Abstract interfaces for data access

### Infrastructure Layer

- **DatabaseService**: SQLite initialization and management
- **ApiService**: REST API client with retry logic
- **SyncService**: Bidirectional sync with conflict resolution
- **AuthService**: Token management and session handling

### Presentation Layer

- **Screens**: Expo Router file-based navigation
- **Components**: Reusable UI primitives
- **Hooks**: State management (useAuth, useSync, useSuppliers, etc.)

## Offline Support

The app implements an **online-first with offline fallback** strategy:

1. **Local Storage**: All data is stored in SQLite
2. **Sync Queue**: Changes are queued when offline
3. **Version Control**: Each entity has a version number
4. **Conflict Resolution**: Server-wins strategy with manual override option

## API Integration

The app connects to a Laravel backend:

```typescript
// Configure API base URL in src/services/api/index.ts
const API_BASE_URL = "https://your-api-domain.com/api";
```

## Test Credentials

Use these credentials with the Laravel backend:

| Role      | Email                    | Password |
| --------- | ------------------------ | -------- |
| Admin     | admin@fieldsync.com      | password |
| Manager   | manager@fieldsync.com    | password |
| Collector | collector1@fieldsync.com | password |

## License

MIT License - See LICENSE file for details.
