# TrackVault Frontend

React Native (Expo) mobile application for the TrackVault Data Collection and Payment Management System.

## Overview

This is the mobile frontend for TrackVault, providing an intuitive interface for:
- User authentication and authorization
- Full CRUD operations for suppliers
- Full CRUD operations for products with multi-unit support
- Collection recording with automatic rate application
- Payment management with advance/partial/full payment support

## Features

- **Cross-Platform**: Runs on iOS and Android
- **Authentication**: Secure token-based authentication with encrypted storage
- **Role-Based Access**: Different UI/features based on user role (Admin, Collector, Finance)
- **Complete CRUD**: Create, Read, Update, Delete functionality for all entities
- **Form Validation**: Real-time validation with user-friendly error messages
- **Clean Architecture**: Modular structure with clear separation of concerns
- **Reusable Components**: Button, Input, Picker, FormModal, FloatingActionButton

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Backend API running (see backend/README.md)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API endpoint:
Create a `.env` file or edit `src/api/client.ts` and update the `API_URL` to point to your backend:
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
```

## Running the Application

Start the development server:
```bash
npm start
```

This will open the Expo DevTools in your browser. From there you can:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your physical device

### Platform-Specific Commands

Run on iOS:
```bash
npm run ios
```

Run on Android:
```bash
npm run android
```

Run on Web (experimental):
```bash
npm run web
```

## Project Structure

```
frontend/
├── src/
│   ├── api/           # API client and service methods
│   │   ├── client.ts      # Axios configuration with interceptors
│   │   ├── auth.ts        # Authentication API
│   │   ├── supplier.ts    # Supplier API
│   │   ├── product.ts     # Product & Rate API
│   │   ├── collection.ts  # Collection API
│   │   └── payment.ts     # Payment API
│   ├── components/    # Reusable UI components
│   │   ├── Button.tsx             # Reusable button component
│   │   ├── Input.tsx              # Text input with validation
│   │   ├── Picker.tsx             # Dropdown picker
│   │   ├── DatePicker.tsx         # Date input component
│   │   ├── FormModal.tsx          # Modal for forms
│   │   ├── FloatingActionButton.tsx # FAB for create actions
│   │   └── index.ts               # Component exports
│   ├── contexts/      # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/    # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/       # Screen components
│   │   ├── LoginScreen.tsx        # User authentication
│   │   ├── HomeScreen.tsx         # Dashboard
│   │   ├── SuppliersScreen.tsx    # Supplier CRUD
│   │   ├── ProductsScreen.tsx     # Product CRUD
│   │   ├── CollectionsScreen.tsx  # Collection CRUD
│   │   └── PaymentsScreen.tsx     # Payment CRUD
│   └── utils/         # Utility functions
│       └── formatters.ts  # Date/amount formatters
├── App.tsx            # Root component
└── package.json
```

## Demo Accounts

The backend provides three demo accounts for testing:

- **Admin**: `admin@trackvault.com` / `password`
  - Full access to all features
  - User management
  - System configuration

- **Collector**: `collector@trackvault.com` / `password`
  - Create and manage collections
  - View suppliers and products
  - Basic reporting

- **Finance**: `finance@trackvault.com` / `password`
  - Manage payments
  - View financial reports
  - Balance reconciliation

## Implemented Features

### Authentication ✅
- Secure login with JWT tokens
- Token stored in Expo SecureStore
- Automatic token refresh handling
- Role-based UI adaptation
- Logout functionality

### Suppliers Management ✅
- List all suppliers with pull-to-refresh
- View supplier details
- Create new suppliers
- Edit existing suppliers
- Delete suppliers with confirmation
- Real-time form validation
- Active/inactive status display

### Products Management ✅
- List all products with pull-to-refresh
- View product details with rates
- Create new products with unit selection
- Edit existing products
- Delete products with confirmation
- Multi-unit support (kg, g, l, ml, unit)
- Form validation for all fields

### Collections Recording ✅
- List all collections with calculated amounts
- Create new collections with:
  - Supplier selection dropdown
  - Product selection dropdown
  - Quantity input with validation
  - Unit selection
  - Date input
  - Optional notes
- Edit existing collections
- Delete collections with confirmation
- Automatic rate application from backend
- Display of collected by user

### Payments Management ✅
- List all payments with type badges
- Create new payments with:
  - Supplier selection
  - Amount input with validation
  - Payment type (advance/partial/full)
  - Payment method selection
  - Reference number
  - Date input
  - Optional notes
- Edit existing payments
- Delete payments with confirmation
- Payment type color coding
- Display of processed by user

## Component Library

### Button
Reusable button with variants:
- `primary` (default): Blue background
- `secondary`: White with blue border
- `danger`: Red background
- Loading state support

### Input
Text input with:
- Label and required indicator
- Error message display
- Placeholder support
- Multiline support
- Keyboard type options

### Picker
Dropdown selector with:
- Modal-based selection
- Label and required indicator
- Error message display
- Search-friendly list

### FormModal
Full-screen modal for forms with:
- Header with title and close button
- Scrollable content
- Keyboard-aware behavior
- Slide-up animation

### FloatingActionButton (FAB)
Circular action button for create operations:
- Fixed position (bottom-right)
- Shadow for elevation
- Customizable icon

## Form Validation

All forms include validation for:
- Required fields
- Email format validation
- Numeric validation for amounts/quantities
- Date format validation
- Real-time error display

## Architecture

The application follows Clean Architecture principles:

- **Presentation Layer**: React components and screens
- **Business Logic Layer**: Context providers and hooks
- **Data Layer**: API services and data models
- **Infrastructure**: Navigation, storage, and utilities

## State Management

- **Auth State**: Global authentication context using React Context
- **Local State**: Component-level state with useState
- **API State**: Loading and error states managed per screen
- **Form State**: Controlled inputs with validation

## Security

- Tokens stored in Expo SecureStore (encrypted)
- HTTPS required for production API calls
- Automatic token expiration handling
- No sensitive data in AsyncStorage
- Server-side validation for all operations

## Error Handling

- User-friendly error messages
- API error propagation
- Confirmation dialogs for destructive actions
- Loading states for async operations
- Network error handling

## Building for Production

Create a production build:

For iOS:
```bash
expo build:ios
```

For Android:
```bash
expo build:android
```

Or use EAS Build (recommended):
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Future Enhancements

- [ ] Advanced date picker component
- [ ] Supplier balance display
- [ ] Search and filter functionality
- [ ] Sorting options
- [ ] Date range filters
- [ ] Product rate management UI
- [ ] Offline support with sync
- [ ] Push notifications
- [ ] Export/reporting features

## Testing

Run tests:
```bash
npm test
```

## Known Limitations

- Web platform support is experimental
- Offline mode not yet implemented
- Date input uses text field (consider using date picker library)

## Contributing

When contributing, please:
1. Follow the existing code structure
2. Use TypeScript for type safety
3. Test on both iOS and Android
4. Update documentation as needed
5. Add validation for all forms
6. Handle errors gracefully

## License

MIT License
