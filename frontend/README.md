# PayMaster Mobile App

Production-ready React Native (Expo) mobile application for data collection and payment management.

## Architecture

This application follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── domain/              # Core business logic (framework-independent)
│   ├── entities/       # Business entities (TypeScript interfaces)
│   ├── repositories/   # Repository interfaces
│   └── usecases/       # Business use cases
├── application/         # Application layer
│   ├── services/       # Application services
│   └── state/          # State management (Context API)
├── infrastructure/      # External concerns
│   ├── api/            # API client implementations
│   ├── storage/        # Local storage (SQLite, SecureStore)
│   └── sync/           # Synchronization services
└── presentation/        # UI layer
    ├── screens/        # Screen components
    ├── components/     # Reusable UI components
    └── navigation/     # Navigation configuration
```

## Core Features

### 1. Offline-First Architecture
- **Local Storage**: SQLite for structured data, SecureStore for sensitive data
- **Automatic Sync**: Event-driven synchronization (network restoration, app foreground)
- **Manual Sync**: User-initiated sync with progress indicators
- **Conflict Resolution**: Version-based conflict detection and resolution
- **Sync Status**: Visual indicators for sync state (synced, pending, syncing, error)

### 2. Authentication & Authorization
- Secure login with token-based authentication
- Role-based UI rendering (admin, manager, collector)
- Permission-based feature access
- Secure token storage (SecureStore)
- Automatic session management

### 3. User Management
- User profile viewing and editing
- User role and permission display
- User activity tracking

### 4. Supplier Management
- Create, view, update suppliers
- Supplier profile with detailed information
- Regional filtering
- Supplier balance display
- Search and filter capabilities

### 5. Product Management
- Product catalog management
- Multi-unit support (kg, g, lbs, etc.)
- Product status tracking
- Current rate display

### 6. Collection Management
- Daily collection entry
- Automatic rate application based on date
- Quantity tracking with unit display
- Collection history view
- Offline collection with auto-sync
- Edit and delete capabilities (with conflict handling)

### 7. Payment Management
- Record advance payments
- Record partial payments
- Record final payments
- Payment history tracking
- Balance validation before payment
- Offline payment with auto-sync

### 8. Financial Dashboard
- Supplier balance summary
- Collection statistics
- Payment history
- Period-based reporting
- Real-time calculations

### 9. Rate Management
- View current rates
- View rate history
- Rate versioning display
- Effective date ranges

### 10. Synchronization
- Automatic sync triggers:
  - Network connectivity restored
  - App comes to foreground
  - After successful authentication
- Manual sync button
- Sync progress indicators
- Conflict resolution UI
- Sync history and logs

## Key Screens

### Authentication
- **Login Screen**: Email/password authentication
- **Register Screen**: New user registration (if enabled)

### Dashboard
- **Home Dashboard**: Overview of key metrics
- **Financial Summary**: Balances and statistics

### Suppliers
- **Supplier List**: Searchable list of all suppliers
- **Supplier Detail**: Detailed supplier information and balance
- **Add/Edit Supplier**: Form for supplier management

### Products
- **Product List**: List of all products with current rates
- **Product Detail**: Product information and rate history
- **Add/Edit Product**: Form for product management

### Collections
- **Collection List**: History of all collections
- **Add Collection**: Form to record new collection
  - Supplier selection
  - Product selection
  - Quantity input
  - Date selection
  - Auto-rate application
  - Notes field
- **Collection Detail**: View and edit collection

### Payments
- **Payment List**: History of all payments
- **Add Payment**: Form to record payment
  - Supplier selection
  - Amount input
  - Payment type (advance/partial/final)
  - Date selection
  - Balance validation
  - Notes field
- **Payment Detail**: View and edit payment

### Rates
- **Rate List**: Current rates for all products
- **Rate History**: Historical rate changes
- **Add Rate**: Form to create new rate (admin/manager only)

### Settings
- **Profile**: User profile and settings
- **Sync Settings**: Configure sync behavior
- **About**: App information and version

## Data Flow

### Online Mode
```
User Input → Validation → API Request → Backend → Response → Update Local DB → Update UI
```

### Offline Mode
```
User Input → Validation → Save to Local DB → Mark as Pending → Update UI → (Auto Sync when online)
```

### Sync Process
```
Pending Records → Batch Preparation → API Sync Request → Conflict Check → Resolve → Update Local DB → Mark as Synced
```

## State Management

Using React Context API for minimal complexity:

### Contexts
- **AuthContext**: User authentication state
- **SyncContext**: Synchronization state and operations
- **DataContext**: Main application data (suppliers, products, etc.)
- **NetworkContext**: Network connectivity status

### State Pattern
```typescript
{
  loading: boolean,
  error: string | null,
  data: T | null,
  lastSynced: Date | null,
  pendingSync: boolean
}
```

## Local Database Schema

SQLite tables mirror backend schema:
- users
- suppliers
- products
- product_rates
- collections
- payments
- sync_queue (tracks pending sync items)

Each table includes:
- All entity fields
- `sync_status`: 'synced' | 'pending' | 'error'
- `last_synced_at`: timestamp
- `version`: for conflict detection

## API Integration

### API Client
- Base URL configuration
- Automatic token injection
- Request/response interceptors
- Error handling
- Retry logic for failed requests
- Timeout handling

### Endpoints
All endpoints match backend API structure (see backend README.md)

## Security

### Authentication
- Secure token storage using expo-secure-store
- Automatic token refresh
- Session timeout handling

### Data Protection
- Encrypted local storage for sensitive data
- Secure communication (HTTPS only)
- Input validation and sanitization
- XSS prevention

### Authorization
- Role-based UI rendering
- Permission-based feature access
- Secure API calls with token

## Offline Support

### Data Storage
- SQLite for structured data
- SecureStore for tokens and sensitive data
- AsyncStorage for app preferences

### Sync Strategy
- Event-driven (not polling)
- Batch operations for efficiency
- Conflict detection via version numbers
- Last-write-wins with user notification for conflicts
- Idempotent operations (duplicate prevention via sync_id)

### Conflict Resolution
1. Version mismatch detected
2. User notified of conflict
3. Options presented:
   - Keep local changes
   - Accept server changes
   - Manual merge
4. Resolution applied and synced

## Performance Optimization

### Data Loading
- Lazy loading
- Pagination
- Infinite scroll
- Pull-to-refresh

### Rendering
- Memoization (React.memo, useMemo, useCallback)
- Virtual lists for long lists
- Image optimization
- Minimal re-renders

### Storage
- Indexed queries
- Batch operations
- Efficient data structures

## Testing

### Unit Tests
- Business logic tests
- Utility function tests
- Service tests

### Integration Tests
- API integration tests
- Storage integration tests
- Sync process tests

### E2E Tests
- Critical user flows
- Authentication flows
- Offline/online transitions

## Build & Deployment

### Development
```bash
npm install
npm start
```

### Production Build
```bash
# iOS
npm run ios
eas build --platform ios

# Android
npm run android
eas build --platform android
```

### Environment Configuration
```
API_BASE_URL=https://api.paymaster.com
API_TIMEOUT=30000
SYNC_RETRY_ATTEMPTS=3
SYNC_RETRY_DELAY=5000
```

## Requirements

### System
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Emulator or device (for Android development)

### Devices
- iOS 13.0+
- Android 6.0+ (API Level 23+)

## Getting Started

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   - Create `config/environment.ts`
   - Set API base URL

3. **Run Development Server**
   ```bash
   npm start
   ```

4. **Run on Device**
   - Scan QR code with Expo Go app
   - Or press 'a' for Android, 'i' for iOS

## User Guide

### First-Time Setup
1. Install app
2. Login with credentials
3. Wait for initial data sync
4. Start using app

### Daily Workflow (Tea Leaf Collection Example)
1. Open app
2. Navigate to Collections
3. Tap "Add Collection"
4. Select supplier
5. Select product (Tea Leaves)
6. Enter quantity (e.g., 25.5 kg)
7. Rate is auto-applied based on current date
8. Add notes if needed
9. Save (works offline)
10. Collection auto-syncs when online

### Making Payments
1. Navigate to Payments
2. Tap "Add Payment"
3. Select supplier
4. View current balance
5. Enter payment amount
6. Select payment type
7. Add reference/notes
8. Save

### Viewing Balances
1. Navigate to Suppliers
2. Tap on supplier
3. View detailed balance:
   - Total collected
   - Total paid
   - Current balance
4. View collection history
5. View payment history

## Troubleshooting

### Sync Issues
- Check network connection
- Use manual sync button
- Check sync logs in settings
- Contact support if persists

### Data Conflicts
- Review conflict notification
- Choose resolution option
- Contact admin if unsure

### App Crashes
- Clear app cache
- Reinstall app
- Contact support with error details

## Support

For issues and questions, please refer to the project repository.

## License

MIT License
