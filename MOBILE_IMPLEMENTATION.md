# Mobile Implementation Summary

## Overview

This document describes the React Native (Expo) mobile frontend implementation for the Collection-Payments-Sync application. The mobile app implements online-first architecture with comprehensive offline support, deterministic synchronization, and real-time collaboration.

## Architecture

### Design Principles

- **Online-First**: Primary data source is server; client queue operations when offline
- **Offline-First Fallback**: Complete offline functionality; seamless sync when online
- **Deterministic Sync**: Version-based conflict detection; reproducible merge strategies
- **Clean Separation**: Services layer abstracts platform details; UI components remain simple
- **Minimal Dependencies**: Use native APIs; external packages only for core functionality
- **Type Safety**: Full TypeScript coverage for all code

### Technology Stack

- **Framework**: React Native 0.81.5 with Expo 54.0.30
- **Language**: TypeScript ~5.9.2
- **UI Library**: React Native Paper 5.14.5 (Material Design)
- **Navigation**: React Navigation 7.1.26 (native stack + bottom tabs)
- **State Management**: Local storage via AsyncStorage + service layer
- **Storage**: AsyncStorage (regular) + Expo SecureStore (encrypted)
- **HTTP**: Axios 1.13.2 with custom interceptors
- **UUID**: uuid 9.0.2 for deterministic IDs
- **Date**: date-fns 3.6.0 for date manipulation

## Architecture Layers

### 1. Services Layer (Facade Pattern)

Abstracts platform details; provides clean interface to UI components

#### ApiService

Handles all HTTP communication with retry logic and interceptors

- **Base URL**: `http://localhost:8000/api/v1`
- **Token Management**: Stored in encrypted SecureStore with AsyncStorage fallback
- **Interceptors**:
  - Request: Adds Authorization header, Content-Type, User-Agent
  - Response: Handles 401 (logout), 429 (rate limit), 500+ (retry with backoff)
- **Methods**:
  - `register(name, email, password)`: POST /auth/register
  - `login(email, password)`: POST /auth/login
  - `getUser()`: GET /user
  - `logout()`: POST /auth/logout
  - `getCollections(page)`: GET /collections
  - `createCollection(data)`: POST /collections
  - `updateCollection(id, data)`: PUT /collections/{id}
  - `deleteCollection(id)`: DELETE /collections/{id}
  - `getPayments(filters)`: GET /payments
  - `createPayment(data)`: POST /payments
  - `batchCreatePayments(payments)`: POST /payments/batch
  - `getRates()`: GET /rates
  - `getActiveRates()`: GET /rates/active
  - `pullSync(deviceId, since)`: POST /sync/pull
  - `pushSync(deviceId, operations)`: POST /sync/push
  - `resolveConflicts(deviceId, strategy)`: POST /sync/resolve-conflicts
  - `getSyncStatus(deviceId)`: GET /sync/status
  - `retrySync(deviceId)`: POST /sync/retry

#### StorageService

Manages local data persistence with encryption

- **Device ID**:
  - Auto-generated on first run: `device_{timestamp}_{random}`
  - Persisted across app launches
  - Used for conflict detection and multi-device support
- **Secure Storage** (Encrypted):
  - `setSecure(key, value)`: Store sensitive data (tokens, passwords)
  - `getSecure(key)`: Retrieve encrypted data
  - `deleteSecure(key)`: Erase sensitive data
  - Fallback to AsyncStorage if SecureStore unavailable
- **Regular Storage**:
  - `setItem(key, value)`: Store JSON data
  - `getItem(key)`: Retrieve JSON data
  - `removeItem(key)`: Delete data
- **Collections Management**:
  - `getCollection(id)`: Retrieve from local storage
  - `getCollections()`: All cached collections
  - `saveCollection(collection)`: Persist collection
  - `saveCollections(collections)`: Bulk save
  - `deleteCollection(id)`: Remove from cache
- **Payments Management**:
  - `getPayment(id)`: Retrieve from local storage
  - `getPayments()`: All cached payments
  - `savePayment(payment)`: Persist payment
  - `savePayments(payments)`: Bulk save
  - `deletePayment(id)`: Remove from cache
- **Rates Management**:
  - `getRate(id)`: Retrieve from local storage
  - `getRates()`: All cached rates
  - `saveRate(rate)`: Persist rate
  - `saveRates(rates)`: Bulk save
  - `deleteRate(id)`: Remove from cache
- **Sync Queue**:
  - `addToSyncQueue(operation)`: Queue operation for sync
  - `getSyncQueue()`: All pending operations
  - `removeFromSyncQueue(operationId)`: Mark as synced
  - `clearSyncQueue()`: Clear all pending operations
- **Sync Tracking**:
  - `saveLastSync(timestamp)`: Record last successful sync
  - `getLastSync()`: Retrieve last sync time
- **Cleanup**:
  - `clearAll()`: Wipe all data except device_id

#### SyncService

Orchestrates offline-first synchronization with conflict resolution

- **Initialization**:
  - `initSync()`: Set up sync intervals and listeners
  - Auto-sync every 5 minutes when online
  - Manual sync on network restoration
  - Manual sync on app foreground
- **Main Sync Flow**:
  - `performSync()`: Main orchestration
    1. Check if online; skip if offline
    2. Pull new data from server
    3. Merge with local storage
    4. Push queued operations
    5. Update last sync timestamp
    6. Report sync status
- **Pull Operations** (`pullFromServer`):
  - GET /sync/pull with `since` timestamp
  - Download collections, payments, rates modified since last sync
  - Merge with local storage using version-based conflict detection
  - Update local cache
- **Push Operations** (`pushToServer`):
  - POST /sync/push with queued operations
  - Server validates idempotency keys
  - Handles duplicate payment prevention
  - Mark operations as synced on success
  - Retry on network error
- **Merge Strategy** (`mergeData`):
  - **Version-Based** (Primary):
    - Compare entity.version numbers
    - Newer version wins
  - **Timestamp-Based** (Secondary):
    - If versions equal, compare last_modified_at
    - Newer timestamp wins
  - **Server-Wins** (Default):
    - When in doubt, server version is authoritative
  - **Conflict Detection**:
    - Collections: version vs timestamp
    - Payments: version vs idempotency_key
    - Rates: version + is_active status
- **Conflict Resolution** (`resolveConflicts`):
  - **Server-Wins** (default): Keep server version
  - **Client-Wins**: Keep local version if device_id matches
  - **Merge**: Three-way merge for compatible data
  - Manual resolution UI for critical conflicts
- **Retry Logic** (`retryFailed`):
  - Exponential backoff: 1s, 2s, 4s, 8s, 16s
  - Max 5 retry attempts per operation
  - Manual retry via UI button
  - Logs errors for debugging
- **Sync Status**:
  - Track pending operations count
  - Track synced operations count
  - Track failed operations count
  - Last sync timestamp
  - Next auto-sync time
  - Current sync progress

#### Authentication State

Global auth context using React Context API

- `currentUser`: Authenticated user object
- `token`: Stored in SecureStore
- `isLoading`: Auth state initialization
- `isAuthenticated`: Boolean flag
- `login(email, password)`: Authenticate
- `logout()`: Clear auth state
- `register(name, email, password)`: Create account

### 2. Type Definitions (TypeScript)

Located in `mobile/src/types/index.ts`

```typescript
// User
interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  is_active: boolean;
  device_id: string;
  created_at: string;
  updated_at: string;
}

// Collection
interface Collection {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  amount: number;
  status: "active" | "completed" | "cancelled";
  version: number;
  device_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  creator_id: number;
  updater_id: number;
}

// Payment
interface Payment {
  id: number;
  uuid: string;
  collection_id: number;
  amount: number;
  payment_date: string;
  status: "pending" | "completed" | "failed";
  version: number;
  idempotency_key: string;
  device_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  payer_id: number;
  rate_id?: number;
  creator_id: number;
  updater_id: number;
}

// Rate
interface Rate {
  id: number;
  uuid: string;
  name: string;
  base_amount: number;
  version: number;
  is_active: boolean;
  rate_date: string;
  device_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Sync Operation
interface SyncOperation {
  id: string;
  type: "create" | "update" | "delete";
  entity: "collection" | "payment" | "rate";
  entity_id?: string;
  data: any;
  idempotency_key: string;
  device_id: string;
  timestamp: string;
  status: "pending" | "failed" | "synced";
  error?: string;
}

// Sync Status
interface SyncStatus {
  pending: number;
  synced: number;
  failed: number;
  lastSync: string;
  nextSync: string;
  isOnline: boolean;
  isSyncing: boolean;
}
```

### 3. UI Components

Using React Native Paper for consistent Material Design

#### Navigation Structure

- **Stack Navigation** (Authentication)
  - LoginScreen
  - RegisterScreen
- **Bottom Tab Navigation** (Post-Auth)
  - HomeStack (Home, Collections detail)
  - CollectionsStack (Collections list, add, edit)
  - PaymentsStack (Payments list, add, batch)
  - RatesStack (Rates list, versions)
  - SettingsStack (User, sync status, logout)

#### Screens

**LoginScreen** (`mobile/src/screens/LoginScreen.tsx`)

- Email input with validation
- Password input
- Login button with loading state
- Error message display
- Register link
- Keyboard handling
- Network status indicator

**RegisterScreen** (To be created)

- Name input
- Email input with validation
- Password input with requirements
- Confirm password
- Register button with loading state
- Error display
- Login link

**HomeScreen** (`mobile/src/screens/HomeScreen.tsx`)

- Welcome message with user name
- Sync status indicator
  - Last sync time
  - Auto-sync countdown
  - Manual sync button
  - Pending operations count
- Quick stats
  - Total collections
  - Total payments
  - Pending sync
- Quick action buttons
  - New collection
  - New payment
  - View all collections
  - View all payments
- Network status indicator

**CollectionsScreen** (`mobile/src/screens/CollectionsScreen.tsx`)

- List of collections (paginated)
  - Collection name, amount, status
  - Payment count, latest rate
  - Edit/delete buttons
- Add collection button
- Pull-to-refresh
- Search/filter options
- Empty state message
- Loading state with skeleton

**Collection Detail Modal**

- View full details
- Payment summary
  - Total amount, total paid, remaining
  - Latest rate applied
- Payment list for collection
- Add payment button
- Edit collection button
- Delete collection button (with confirmation)

**PaymentsScreen** (`mobile/src/screens/PaymentsScreen.tsx`)

- List of payments (paginated)
  - Payment date, amount, status
  - Collection reference, payer name
  - Edit/delete buttons
- Add payment button
- Batch import button
- Filters
  - By collection
  - By status
  - By date range
- Pull-to-refresh
- Loading state
- Empty state

**Add/Edit Payment Modal**

- Collection selector (dropdown)
- Amount input
- Payment date picker
- Payer selector
- Rate selector (with auto-selection)
- Submit button
- Validation errors
- Loading state

**Batch Payment Import**

- CSV/JSON import option
- Preview data
- Validation results
- Confirm import button
- Error handling for invalid rows

**RatesScreen** (`mobile/src/screens/RatesScreen.tsx`)

- List of all rates
  - Rate name, version, base amount
  - Status (active/inactive)
  - Rate date
- Active rates highlighted
- View version history button
- Create rate button

**Rate Versions Modal**

- Timeline of rate versions
  - Version number, date, amount
  - Change from previous version
- Create new version button
- Deactivate current button

**SettingsScreen** (To be created)

- User profile
  - Name, email
  - Device ID
  - Last login
- Sync settings
  - Auto-sync toggle
  - Sync interval (5, 10, 15, 30 min)
  - Last sync timestamp
  - Pending operations
- Data management
  - Clear local cache button
  - Export data button
  - Import data button
- Logout button (with confirmation)
- App version

#### Reusable Components

- **SyncStatusBar**: Shows sync status with indicator
- **OfflineIndicator**: Network status banner
- **PendingOperationsList**: Shows queued operations
- **ConflictResolutionDialog**: Manual conflict resolution UI
- **LoadingOverlay**: Full-screen loading state
- **ErrorMessage**: Standardized error display
- **SuccessMessage**: Notification for successful operations

### 4. State Management

Using combination of:

1. **React Context**: Global auth state
2. **AsyncStorage**: Persisted local state
3. **Component State**: UI-local state (inputs, modal visibility)

**Global State Structure**:

```javascript
{
  auth: {
    currentUser: User | null,
    token: string | null,
    isLoading: boolean,
    isAuthenticated: boolean
  },
  sync: {
    status: SyncStatus,
    isOnline: boolean,
    lastError?: string
  },
  data: {
    collections: Collection[],
    payments: Payment[],
    rates: Rate[]
  }
}
```

## Key Features

### 1. Offline-First Architecture

- **Full Offline Capability**: All operations work offline
- **Operation Queueing**: Failed operations queued automatically
- **Automatic Sync**: Sync when network restored
- **Visual Feedback**: Clear offline/online indicators
- **Pending Operations**: Show what's queued to sync

### 2. Deterministic Sync

- **Version-Based Conflict Detection**: Each entity has version field
- **Timestamp-Based Resolution**: Secondary conflict detection
- **Server-Authoritative**: Server wins on conflicts (default)
- **Three-Way Merge**: Compatible data merged automatically
- **Manual Resolution**: UI for critical conflicts

### 3. Idempotency

- **Idempotency Keys**: Each operation has unique key
- **Duplicate Prevention**: Same operation never processed twice
- **Device ID**: Included in all operations for multi-device tracking
- **Key Format**: `{device_id}_{timestamp}_{random}`

### 4. Security

- **Encrypted Storage**: Tokens in SecureStore (encrypted)
- **Token Refresh**: Handle token expiry gracefully
- **HTTPS**: All API calls over HTTPS (production)
- **Device Tracking**: Device ID on all operations
- **Secure Headers**: Authorization, Content-Type, User-Agent

### 5. User Experience

- **Responsive UI**: Smooth animations and transitions
- **Loading States**: Clear feedback during operations
- **Error Handling**: User-friendly error messages
- **Network Status**: Visual indicator of connectivity
- **Sync Status**: Show pending operations and last sync time
- **Empty States**: Helpful messages when no data

## File Structure

```
mobile/
├── App.tsx                          # Root component with navigation
├── index.ts                         # Entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx       # To create
│   │   ├── HomeScreen.tsx
│   │   ├── CollectionsScreen.tsx
│   │   ├── PaymentsScreen.tsx
│   │   ├── RatesScreen.tsx
│   │   └── SettingsScreen.tsx       # To create
│   ├── services/
│   │   ├── ApiService.ts            # HTTP client
│   │   ├── StorageService.ts        # Local storage
│   │   └── SyncService.ts           # Offline-first sync
│   ├── types/
│   │   └── index.ts                 # TypeScript definitions
│   ├── context/
│   │   └── AuthContext.tsx          # Auth state management
│   ├── components/
│   │   ├── SyncStatusBar.tsx
│   │   ├── OfflineIndicator.tsx
│   │   ├── PendingOperationsList.tsx
│   │   ├── ConflictResolutionDialog.tsx
│   │   └── (other reusable components)
│   └── utils/
│       ├── validators.ts            # Input validation
│       ├── formatters.ts            # Data formatting
│       └── constants.ts             # App constants
└── assets/
    └── images/
```

## Setup Instructions

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Install dependencies**:

   ```bash
   cd mobile
   npm install
   ```

2. **Configure API endpoint**:

   - Update `ApiService.ts` with backend URL
   - Development: `http://localhost:8000/api/v1`
   - Production: Set production backend URL

3. **Start development server**:

   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device**:
   - **iOS**: Press `i` in terminal
   - **Android**: Press `a` in terminal
   - **Web**: Press `w` in terminal

### Development

**Hot Reload**:

- Changes auto-reload in development
- `r` to reload manually
- `m` to toggle menu

**Debugging**:

```bash
# React Native debugger
npm install -g react-native-debugger
react-native-debugger
```

## Testing Strategy

### Unit Tests

- Service functions (ApiService, StorageService, SyncService)
- Utility functions (validators, formatters)
- Type checking with TypeScript

### Integration Tests

- Complete auth flow (login, register, logout)
- Collection CRUD operations
- Payment creation with idempotency
- Sync operations with conflicts

### E2E Tests

- Multi-screen navigation
- Offline operation queuing
- Network restoration sync
- Payment batch import
- Rate version creation

### Key Test Scenarios

```
1. Offline Collection Creation
   - Create collection while offline
   - Verify queued in sync queue
   - Sync when online
   - Verify created on server

2. Duplicate Payment Prevention
   - Create payment
   - Network interruption
   - User retries (same idempotency key)
   - Verify only one payment created

3. Conflict Resolution
   - Offline: Update collection
   - Server: Update same collection
   - Sync: Conflict detected
   - Verify resolution based on version/timestamp

4. Multi-Device Sync
   - Device A: Create collection
   - Device B: Sync
   - Verify collection appears on Device B
   - Device A: Update collection
   - Device B: Sync
   - Verify update on Device B
```

## Performance Optimization

1. **Lazy Loading**: Screens load data on demand
2. **Pagination**: List endpoints paginated (50 items per page)
3. **Caching**: Local AsyncStorage cache for offline access
4. **Memoization**: React.memo for reusable components
5. **Image Optimization**: Use appropriate dimensions
6. **Bundle Size**: Tree-shake unused dependencies

## Deployment

### Development

```bash
npm start
expo start
```

### Staging

```bash
# Build APK for Android
expo build:android

# Build IPA for iOS
expo build:ios
```

### Production

```bash
# Use Expo managed workflow or EAS Build
eas build --platform all --auto-submit
eas submit --platform all
```

## Environment Variables

Create `.env` file:

```
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_LOG_LEVEL=debug
```

For production:

```
EXPO_PUBLIC_API_URL=https://api.production.com/api/v1
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_LOG_LEVEL=error
```

## Troubleshooting

### Common Issues

**Connection Refused**:

- Ensure backend is running on `http://localhost:8000`
- Check `ApiService.ts` base URL is correct
- iOS simulator: Use `10.0.2.2` instead of `localhost`

**Storage Not Persisting**:

- Clear app cache: `npm start -- --clear`
- Check AsyncStorage implementation
- Verify SecureStore availability

**Sync Not Working**:

- Check network connectivity
- Verify backend `/sync/pull` and `/sync/push` endpoints
- Check SyncService logs
- Manual retry via SettingsScreen

**Auth Token Issues**:

- Token may be expired; try logout/login
- Check SecureStore is storing token
- Verify token format in header

## Future Enhancements

1. **Real-Time Collaboration**: WebSocket support for live updates
2. **Offline Analytics**: Track offline metrics
3. **Advanced Filtering**: Complex query filters
4. **Data Visualization**: Charts and analytics
5. **Push Notifications**: Real-time notifications
6. **Biometric Auth**: Fingerprint/Face ID login
7. **Data Export**: Export to CSV/PDF
8. **Multi-Language**: i18n support
9. **Dark Mode**: System dark mode support
10. **Voice Input**: Voice-to-text for payments
