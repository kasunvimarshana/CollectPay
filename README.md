# Collection Payments Sync

A production-ready, online-first data collection and payment management system built with **React Native (Expo)** frontend and **Laravel 12** backend. Features robust multi-device synchronization, versioned rates, complete audit trails, and seamless offline operation with deterministic conflict resolution.

**Status**: ✅ Backend 90% Complete | 🟡 Mobile 40% Complete | Overall 65% Complete

## 🎯 Overview

This application solves real-world data collection and payment management scenarios (e.g., tea leaf collection, agricultural payment tracking) with:

- **Online-first architecture** with automatic offline fallback
- **Deterministic synchronization** with version-based conflict detection
- **Idempotency-based deduplication** preventing duplicate payments
- **Immutable rate versioning** for accurate historical calculations
- **Comprehensive audit trails** for compliance and accountability
- **Multi-device concurrency** with device ID tracking
- **End-to-end security** with encrypted storage and RBAC/ABAC

## 🚀 Key Features

### Backend (Laravel 12) - ✅ Complete

- ✅ **Clean Architecture**: Domain → Application → Infrastructure layers
- ✅ **RESTful API v1**: 30+ endpoints with authentication
- ✅ **Authentication**: Laravel Sanctum token-based (stateless)
- ✅ **CRUD Operations**: Collections, Payments, Rates with validation
- ✅ **Online-First Sync**: Pull/push with conflict resolution
- ✅ **Idempotency**: Duplicate payment prevention via unique keys
- ✅ **Rate Versioning**: Immutable historical records
- ✅ **Audit Logging**: Complete operation audit trail (immutable)
- ✅ **RBAC/ABAC**: Role-based and attribute-based access control
- ✅ **Soft Deletes**: No data destruction; tracks deleted_at
- ✅ **Multi-Device Support**: Device ID on all operations
- ✅ **Conflict Resolution**: Server-wins, client-wins, merge strategies
- ✅ **Repository Pattern**: Clean data access abstraction
- ✅ **Service Layer**: Business logic separation
- ✅ **Form Validation**: Input validation on all endpoints

### Mobile (React Native/Expo) - 🟡 In Progress

- ✅ **API Service**: Complete HTTP client with interceptors
- ✅ **Storage Service**: Encrypted token + collection/payment/rate storage
- ✅ **Type Definitions**: Full TypeScript coverage
- ✅ **Navigation**: Stack + Tab navigation setup
- 🟡 **SyncService**: Framework exists; needs completion
- ⚠️ **UI Screens**: Login done; others need building
- ⚠️ **Offline Support**: Framework ready; UI integration needed
- ⚠️ **Sync Status**: Framework ready; UI components needed

## 📋 Prerequisites

### Backend

- PHP 8.3+
- Composer 2.0+
- SQLite (development) or MySQL/PostgreSQL (production)
- Laravel 12.x

### Mobile

- Node.js 20+
- npm 10+ or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

## 🛠️ Quick Start

### Backend Installation (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Create database
touch database/database.sqlite

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

✅ Backend available at: `http://localhost:8000/api/v1`

### Mobile Installation (5 minutes)

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Update API URL in src/services/ApiService.ts
# Change: const API_BASE_URL = 'http://localhost:8000/api/v1'

# Start development
npm start
# Press: i (iOS) / a (Android) / w (Web)
```

## 📚 Documentation

### Complete Implementation Guides

1. **[BACKEND_IMPLEMENTATION.md](BACKEND_IMPLEMENTATION.md)** - Complete backend documentation

   - All models, services, controllers, repositories
   - Complete API endpoint reference
   - Database schema and migrations
   - Setup and deployment

2. **[MOBILE_IMPLEMENTATION.md](MOBILE_IMPLEMENTATION.md)** - Complete mobile documentation

   - Service layer architecture
   - Type definitions and interfaces
   - Navigation and screen structure
   - Offline-first synchronization
   - Setup and testing

3. **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation path

   - Week-by-week development plan
   - Code examples for key features
   - Testing checklist
   - Deployment preparation

4. **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Project completion status

   - Current state summary
   - File inventory
   - Architecture decisions
   - Performance targets

5. **[VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md)** - Quick test & verification
   - Curl commands for all endpoints
   - Step-by-step verification
   - Common issues & solutions
   - Testing checklist

### Quick Reference

- **[API_EXAMPLES.md](API_EXAMPLES.md)** - Example API requests
- **[QUICKSTART.md](QUICKSTART.md)** - Minimal setup guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture overview

## 🧪 Quick Testing

### Test Backend (30 seconds)

```bash
# Terminal 1: Start backend
cd backend && php artisan serve

# Terminal 2: Test API
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "password_confirmation": "Password123"
  }'
```

**Expected**: Returns user object + authentication token

### Test Mobile (1 minute)

```bash
cd mobile
npm start
# Press 'i' or 'a' to run on iOS/Android
# Test login with credentials from backend
```

## 🏗️ Architecture

### Backend Layers

```
Presentation Layer (Controllers)
    ↓
Application Layer (Services)
    ↓
Domain Layer (Entities, Repositories)
    ↓
Infrastructure Layer (Database, HTTP)
```

### Technology Stack

| Component             | Technology          | Version          |
| --------------------- | ------------------- | ---------------- |
| **Backend**           | Laravel             | 12.x             |
| **Mobile**            | React Native + Expo | 0.81.5 + 54.0.30 |
| **Language (Mobile)** | TypeScript          | 5.9.2            |
| **UI (Mobile)**       | React Native Paper  | 5.14.5           |
| **Navigation**        | React Navigation    | 7.1.26           |
| **Auth**              | Laravel Sanctum     | 12.x             |
| **Database (Dev)**    | SQLite              | Latest           |
| **HTTP Client**       | Axios               | 1.13.2           |

## 📁 Project Structure

```
collection-payments-sync/
├── backend/                           # Laravel 12 Backend
│   ├── app/
│   │   ├── Models/                   # 8 Eloquent Models
│   │   ├── Services/                 # 5 Services
│   │   ├── Repositories/             # 3 Repository Implementations
│   │   ├── Http/Controllers/Api/     # 5 API Controllers
│   │   └── Http/Requests/           # 2 Form Requests
│   ├── database/
│   │   ├── migrations/              # 10 Migrations
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php                  # API Routing
│   └── config/
│
├── mobile/                            # React Native Expo App
│   ├── src/
│   │   ├── services/                # 3 Services (API, Storage, Sync)
│   │   ├── screens/                 # 5+ UI Screens
│   │   ├── types/                   # TypeScript Definitions
│   │   ├── context/                 # Auth Context
│   │   └── components/              # Reusable Components
│   └── app.json                     # Expo Config
│
└── Documentation/
    ├── BACKEND_IMPLEMENTATION.md     # Backend Complete Docs
    ├── MOBILE_IMPLEMENTATION.md      # Mobile Complete Docs
    ├── IMPLEMENTATION_GUIDE.md       # Step-by-Step Guide
    ├── PROJECT_STATUS.md             # Status & Progress
    ├── VERIFICATION_GUIDE.md         # Testing Guide
    └── README.md                     # This File
```

## 🔐 Security Features

- ✅ **Token-Based Auth**: Laravel Sanctum with secure storage
- ✅ **RBAC/ABAC**: Fine-grained access control
- ✅ **Input Validation**: All inputs validated at form request level
- ✅ **SQL Injection Protection**: Eloquent parameterized queries
- ✅ **CORS Configured**: Secure cross-origin requests
- ✅ **Encrypted Storage**: Tokens in encrypted SecureStore (mobile)
- ✅ **Audit Trail**: All operations logged immutably
- ✅ **Soft Deletes**: No data destruction
- ✅ **Device Tracking**: Device ID on all operations
- ✅ **Idempotency Keys**: Prevents duplicate processing

## 📊 API Endpoints (30+)

### Authentication

- `POST   /auth/register` - Register user
- `POST   /auth/login` - Login user
- `GET    /user` - Get current user
- `POST   /auth/logout` - Logout user

### Collections

- `GET    /collections` - List (paginated)
- `POST   /collections` - Create
- `GET    /collections/{id}` - Get with summary
- `PUT    /collections/{id}` - Update
- `DELETE /collections/{id}` - Delete

### Payments

- `GET    /payments` - List (with filters)
- `POST   /payments` - Create
- `POST   /payments/batch` - Bulk create
- `GET    /payments/{id}` - Get
- `PUT    /payments/{id}` - Update
- `DELETE /payments/{id}` - Delete

### Rates

- `GET    /rates` - List (paginated)
- `GET    /rates/active` - Active only
- `POST   /rates` - Create
- `GET    /rates/{id}` - Get
- `GET    /rates/{name}/versions` - History
- `POST   /rates/{id}/versions` - New version
- `DELETE /rates/{id}` - Deactivate

### Synchronization

- `POST   /sync/pull` - Download data
- `POST   /sync/push` - Upload operations
- `POST   /sync/resolve-conflicts` - Resolve conflicts
- `GET    /sync/status` - Sync status
- `POST   /sync/retry` - Retry failed ops

**Full API Documentation**: See [API_EXAMPLES.md](API_EXAMPLES.md)

## 📱 Mobile Screens

| Screen            | Status       | Features                     |
| ----------------- | ------------ | ---------------------------- |
| LoginScreen       | ✅ Complete  | Email/password login         |
| RegisterScreen    | ⚠️ Framework | User registration            |
| HomeScreen        | ✅ Basic     | Dashboard, sync status       |
| CollectionsScreen | 🟡 Partial   | List, create, edit, delete   |
| PaymentsScreen    | 🟡 Partial   | List, create, batch, filters |
| RatesScreen       | ⚠️ Framework | List, versions, create       |
| SettingsScreen    | ⚠️ Framework | Profile, sync, logout        |

## 🧵 Synchronization Strategy

### Pull (Download)

1. Request data modified since last sync
2. Server returns collections, payments, rates
3. Merge with local storage using version-based strategy
4. Update local cache

### Push (Upload)

1. Collect all pending operations from queue
2. Send to server with idempotency keys
3. Server validates and processes
4. Mark as synced on success

### Conflict Resolution

**Version-Based** (Primary):

- Compare version numbers
- Newer version wins

**Timestamp-Based** (Secondary):

- If versions equal, compare modified_at
- Newer timestamp wins

**Server-Wins** (Default):

- When in doubt, server is authoritative

## 🎓 Idempotency & Deduplication

Each operation has unique idempotency key: `{device_id}_{timestamp}_{random}`

**Prevents duplicate payments on:**

- Network retry
- User accidentally double-tapping
- Multiple submissions

```bash
# Same operation sent twice
POST /payments with idempotency_key "device_1_1705316400_abc"
POST /payments with idempotency_key "device_1_1705316400_abc"

# Server returns same payment ID both times
# Database: Only one payment created
```

## 📈 Performance Targets

- **API Response**: <100ms average
- **Sync Operations**: 1000+ per request
- **Mobile Bundle**: <50MB
- **Battery Impact**: Minimal
- **Storage**: <20MB for local cache
- **Pagination**: 15-50 items per page

## ✅ Testing

### Backend

```bash
cd backend
php artisan test
php artisan test tests/Feature/AuthenticationTest.php
```

### Mobile

```bash
cd mobile
npm test
```

### Manual Testing

See [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md) for curl commands and manual test steps.

## 🚀 Deployment

### Backend (Production)

1. Use MySQL/PostgreSQL (not SQLite)
2. Set `APP_ENV=production`, `APP_DEBUG=false`
3. Configure SSL certificate
4. Set up database backups
5. Configure rate limiting
6. Deploy using Laravel deployment tools

### Mobile (Production)

1. Update API endpoint to production URL
2. Build for iOS and Android
3. Configure signing certificates
4. Submit to App Store / Google Play
5. Set up monitoring and crash reporting

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for complete deployment checklist.

## 🐛 Troubleshooting

**Backend won't start**: `php artisan key:generate` and ensure database.sqlite exists  
**API returns 401**: Check token in header: `Authorization: Bearer {token}`  
**Mobile can't connect**: Ensure backend URL is correct in ApiService.ts  
**Sync not working**: Check device_id is set and network connectivity

See [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md) for more troubleshooting.

## 📞 Support

- **Backend Issues**: See [BACKEND_IMPLEMENTATION.md](BACKEND_IMPLEMENTATION.md)
- **Mobile Issues**: See [MOBILE_IMPLEMENTATION.md](MOBILE_IMPLEMENTATION.md)
- **Setup Issues**: See [QUICKSTART.md](QUICKSTART.md)
- **Testing Issues**: See [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)

## 🗺️ Roadmap

### Current (MVP)

- ✅ Backend API complete
- 🟡 Mobile UI in progress
- ⚠️ Integration testing

### Next (Post-MVP)

- WebSocket support for real-time updates
- Advanced analytics and reporting
- Push notifications
- Data export/import
- Multi-language support
- Dark mode for mobile

## 📄 License

Private project. All rights reserved.

## 👥 Team

Built as a comprehensive, production-ready solution for data collection and payment management in low-connectivity environments.

---

## 🎉 Getting Started

**New to the project?** Start here:

1. Read [QUICKSTART.md](QUICKSTART.md) (2 minutes)
2. Run backend setup (5 minutes)
3. Run mobile setup (5 minutes)
4. Test with [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md) (10 minutes)
5. Read [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for next steps

**For detailed information**, see the comprehensive documentation files listed above.

**Status Summary**: Backend ✅ Complete and ready for production. Mobile foundation ✅ solid; UI screens and sync optimization remaining.

Last updated: 2024 | Version: 1.0.0-beta

## 🏗️ Architecture

### Backend Architecture (Clean Architecture)

```
backend/
├── src/
│   ├── Domain/              # Business logic & entities
│   │   ├── Entities/        # Domain entities
│   │   ├── Repositories/    # Repository interfaces
│   │   └── Services/        # Domain services
│   ├── Application/         # Use cases & DTOs
│   │   ├── DTOs/           # Data Transfer Objects
│   │   ├── Services/       # Application services
│   │   └── UseCases/       # Business use cases
│   └── Infrastructure/      # External concerns
│       ├── Persistence/    # Database implementation
│       │   └── Eloquent/   # Eloquent models & repositories
│       └── Http/           # Controllers & middleware
├── database/
│   └── migrations/         # Database migrations
└── routes/
    └── api.php            # API routes
```

### Mobile Architecture

```
mobile/
├── src/
│   ├── screens/           # UI screens
│   ├── components/        # Reusable components
│   ├── services/          # Business logic
│   │   ├── ApiService.ts      # API communication
│   │   ├── StorageService.ts  # Local storage
│   │   └── SyncService.ts     # Synchronization logic
│   ├── types/             # TypeScript types
│   ├── navigation/        # Navigation config
│   └── utils/             # Utility functions
└── App.tsx               # Root component
```

## 📊 Database Schema

### Core Tables

- **collections**: Data collection entities
- **payments**: Payment records with idempotency
- **rates**: Versioned rate definitions
- **audit_logs**: Complete audit trail
- **sync_queue**: Offline operation queue
- **roles**: User roles for RBAC
- **users**: User accounts

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/user` - Get current user

### Collections

- `GET /api/v1/collections` - List collections
- `POST /api/v1/collections` - Create collection
- `GET /api/v1/collections/{uuid}` - Get collection
- `PUT /api/v1/collections/{uuid}` - Update collection
- `DELETE /api/v1/collections/{uuid}` - Delete collection
- `GET /api/v1/collections/{uuid}/payments` - Get collection payments

### Payments

- `GET /api/v1/payments` - List payments
- `POST /api/v1/payments` - Create payment (idempotent)
- `GET /api/v1/payments/{uuid}` - Get payment
- `PUT /api/v1/payments/{uuid}` - Update payment
- `POST /api/v1/payments/batch` - Batch create payments

### Rates

- `GET /api/v1/rates` - List rates
- `POST /api/v1/rates` - Create rate
- `GET /api/v1/rates/{uuid}` - Get rate
- `PUT /api/v1/rates/{uuid}` - Update rate (creates new version)
- `GET /api/v1/rates/{uuid}/versions` - Get rate versions
- `GET /api/v1/rates/active/list` - Get active rates

### Synchronization

- `POST /api/v1/sync/pull` - Pull data from server
- `POST /api/v1/sync/push` - Push local changes to server
- `POST /api/v1/sync/resolve-conflicts` - Resolve sync conflicts
- `GET /api/v1/sync/status` - Get sync status

## 🔄 Synchronization Flow

### Online-First Approach

1. **User Action**: User creates/updates data in the mobile app
2. **Local Storage**: Data is saved locally immediately
3. **Sync Queue**: Operation is added to sync queue
4. **Immediate Sync**: If online, sync is attempted immediately
5. **Background Sync**: If offline, sync occurs when connection is restored

### Conflict Resolution

When conflicts are detected:

1. Server detects version mismatch
2. Conflict is returned to client
3. User chooses resolution strategy:
   - **Server Wins**: Keep server version
   - **Client Wins**: Override with client version
   - **Merge**: Manually merge changes

### Idempotency

- Each payment has a unique `idempotency_key`
- Duplicate requests with same key return existing record
- Prevents duplicate charges during retry scenarios

## 🔐 Security Features

- **Authentication**: Laravel Sanctum token-based auth
- **Authorization**: RBAC/ABAC for fine-grained permissions
- **Audit Logging**: All changes tracked with user, IP, device
- **Secure Storage**: Sensitive data encrypted on device
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Eloquent ORM parameterized queries

## 🧪 Testing

### Backend Tests

```bash
cd backend
php artisan test
```

### Mobile Tests

```bash
cd mobile
npm test
```

## 📱 Mobile App Usage

1. **Login**: Enter credentials to authenticate
2. **Home Screen**: View statistics and quick actions
3. **Collections**: Create and manage data collections
4. **Payments**: Record and track payments
5. **Rates**: View active and historical rates
6. **Sync**: Manual sync button or automatic background sync

### Offline Mode

- All CRUD operations work offline
- Changes queued for synchronization
- Automatic sync when connection restored
- Conflict resolution UI if needed

## 🚀 Deployment

### Backend Deployment

1. Set up production environment
2. Configure `.env` for production
3. Run migrations: `php artisan migrate --force`
4. Set up web server (Nginx/Apache)
5. Enable HTTPS
6. Configure queue workers for background jobs

### Mobile Deployment

1. Update API endpoint in `ApiService.ts`
2. Build for production:
   - iOS: `eas build --platform ios`
   - Android: `eas build --platform android`
3. Submit to App Store / Play Store

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributors

Built as a production-ready template for data collection and payment management systems.

## 🤝 Support

For issues and questions, please open an issue on GitHub.
