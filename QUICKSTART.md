# TransacTrack Quick Start Guide

This guide will help you get TransacTrack up and running quickly.

## Prerequisites

### Backend
- PHP 8.2 or higher
- Composer 2.x
- SQLite (included with PHP)

### Frontend
- Node.js 18.x or higher
- npm or yarn
- Expo CLI (will be installed automatically)
- Expo Go app on your mobile device (from App Store or Play Store)

## Quick Setup (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/kasunvimarshana/TransacTrack.git
cd TransacTrack
```

### Step 2: Setup Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve
```

The backend will be running at `http://localhost:8000`

**Test Accounts Created:**
- Admin: `admin@transactrack.com` / `password`
- Manager: `manager@transactrack.com` / `password`
- Collector: `collector@transactrack.com` / `password`

### Step 3: Setup Frontend

Open a new terminal window:

```bash
cd ../frontend
npm install
npm start
```

### Step 4: Run on Mobile Device

1. Install "Expo Go" app on your phone:
   - iOS: App Store
   - Android: Play Store

2. Scan the QR code shown in the terminal with:
   - iOS: Camera app
   - Android: Expo Go app

3. **Important**: Configure the API URL for your device:
   - Edit `frontend/src/utils/config.js`
   - Replace `localhost` with your computer's IP address
   - Example: `http://192.168.1.100:8000/api`

### Step 5: Login and Test

1. Login with one of the test accounts
2. Try creating a supplier
3. Record a collection
4. Process a payment (admin/manager only)

## Key Features

### ✅ Offline-First Architecture
- All data operations work without internet
- Automatic sync when connection restored
- Visual indicators for sync status

### ✅ Supplier Management
- Create and edit supplier profiles
- View balances and transactions
- Search and filter suppliers

### ✅ Collection Tracking
- Record product collections with multiple units (grams, kg, liters, ml)
- Automatic rate and amount calculations
- Link to suppliers and products

### ✅ Payment Processing
- Support for advance, partial, and full payments
- Real-time balance calculations
- Payment history tracking

### ✅ Role-Based Access Control
- **Collector**: Create collections, view suppliers
- **Manager**: All collector features + payment processing
- **Admin**: Full system access including rate management

### ✅ Security
- Token-based authentication
- Encrypted data storage
- Audit logging
- RBAC and ABAC authorization

## Usage Tips

### 1. Working Offline
- Turn off WiFi/data to test offline mode
- Orange dot (●) indicates unsynced items
- Green/red status dot shows connection state

### 2. Creating Collections
1. Go to Collections tab
2. Tap the + button
3. Select supplier and product
4. Enter quantity and unit
5. Rate is automatically fetched
6. Total amount is calculated

### 3. Processing Payments
1. Go to Payments tab (admin/manager only)
2. Tap the + button
3. Select supplier to see current balance
4. Choose payment type:
   - **Advance**: Payment before collection
   - **Partial**: Part payment
   - **Full**: Settles entire balance
   - **Adjustment**: Balance corrections

### 4. Managing Suppliers
1. Go to Suppliers tab
2. Tap + to create new supplier
3. Tap supplier card to view details
4. View balance and transaction history
5. Edit or delete as needed

## Troubleshooting

### Backend Issues

**"Class not found" errors:**
```bash
composer dump-autoload
```

**Database errors:**
```bash
php artisan migrate:fresh --seed
```

**Port 8000 in use:**
```bash
php artisan serve --port=8001
```

### Frontend Issues

**"Network request failed":**
- Check backend is running
- Verify API URL in `src/utils/config.js`
- Use IP address, not localhost for physical devices
- Ensure phone and computer on same network

**"Database initialization error":**
- Clear app data and reinstall
- Check device storage space

**"Module not found":**
```bash
rm -rf node_modules
npm install
```

### Connection Issues

**Expo not connecting:**
- Ensure phone and computer on same WiFi
- Try disabling firewall temporarily
- Use tunnel mode: `npx expo start --tunnel`

## Development Workflow

### 1. Backend Development
```bash
cd backend
php artisan serve

# Run tests
php artisan test

# Check code style
./vendor/bin/pint

# Create migration
php artisan make:migration create_table_name
```

### 2. Frontend Development
```bash
cd frontend
npm start

# Clear cache
npx expo start -c

# Run on specific platform
npm run android  # Android emulator
npm run ios      # iOS simulator (macOS only)
npm run web      # Web browser
```

### 3. Testing Sync
1. Turn off network
2. Create/edit data
3. Note orange unsync indicator
4. Turn on network
5. Watch automatic sync

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Collections
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create collection
- `GET /api/collections/{id}` - Get collection details
- `GET /api/my-collections` - Get current user's collections

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create payment (admin/manager)
- `GET /api/payments/{id}` - Get payment details

### Sync
- `POST /api/sync/push` - Push local changes
- `GET /api/sync/pull` - Pull server updates
- `GET /api/sync/status` - Get sync status

## Architecture Overview

```
┌─────────────────────────────────────┐
│     React Native / Expo App         │
│  ┌───────────┐    ┌──────────────┐ │
│  │  SQLite   │    │   Network    │ │
│  │ (Offline) │    │  Monitoring  │ │
│  └─────┬─────┘    └──────┬───────┘ │
│        │                  │         │
│        └────►┌───────────┴────┐    │
│              │   Sync Queue   │    │
│              └────────┬───────┘    │
└───────────────────────┼────────────┘
                        │
                  ┌─────▼──────┐
                  │  REST API  │
                  └─────┬──────┘
                        │
┌───────────────────────┼────────────┐
│      Laravel Backend               │
│  ┌───────────┐   ┌────┴──────┐    │
│  │ Sanctum   │◄──┤Controllers│    │
│  │   Auth    │   └────┬──────┘    │
│  └───────────┘   ┌────▼──────┐    │
│  ┌───────────┐   │  Models   │    │
│  │   RBAC/   │   │(Eloquent) │    │
│  │   ABAC    │   └────┬──────┘    │
│  └───────────┘   ┌────▼──────┐    │
│                  │ Database  │    │
│                  │(SQLite/SQL)│    │
│                  └───────────┘    │
└────────────────────────────────────┘
```

## Next Steps

1. **Explore the App**: Try all features with test data
2. **Read Full Docs**: Check `/docs` folder for detailed guides
3. **Customize**: Modify for your specific needs
4. **Deploy**: Follow production deployment guides
5. **Contribute**: Submit issues and pull requests

## Support

- **Issues**: [GitHub Issues](https://github.com/kasunvimarshana/TransacTrack/issues)
- **Documentation**: See `/docs` folder
- **API Docs**: `/docs/API.md`
- **Architecture**: `/docs/ARCHITECTURE.md`

## License

MIT License - See LICENSE file for details
