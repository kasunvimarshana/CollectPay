# PayMate - Full-Stack Data Collection & Payment Management System

A production-ready, offline-first full-stack application for data collection and payment management, built with Laravel backend and React Native (Expo) frontend.

## 🏗️ Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│  (Controllers, API Routes, React Native Screens)    │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│                 Application Layer                    │
│      (Services, DTOs, Use Cases, Exceptions)        │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│                   Domain Layer                       │
│   (Entities, Value Objects, Repository Interfaces)  │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│               Infrastructure Layer                   │
│  (Eloquent Models, Repositories, Database, Socket)  │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**

- **Framework:** Laravel 10.x (PHP 8.1+)
- **Database:** MySQL 8.0+
- **Authentication:** JWT (tymon/jwt-auth)
- **Real-time:** Socket.IO (Node.js/Express)
- **Architecture:** Clean Architecture, DDD, Repository Pattern

**Frontend:**

- **Framework:** React Native 0.73 (Expo SDK 50)
- **Language:** TypeScript 5.3
- **State Management:** Zustand
- **Local Database:** SQLite (expo-sqlite)
- **HTTP Client:** Axios
- **Real-time:** Socket.IO Client

**Key Features:**

- ✅ Offline-first functionality with sync queue
- ✅ Real-time event-driven communication
- ✅ RBAC (Role-Based Access Control) with 4 roles
- ✅ ABAC (Attribute-Based Access Control)
- ✅ GPS location capture for suppliers
- ✅ Multi-product collection tracking
- ✅ Multiple payment types (advance, partial, full)
- ✅ Automatic conflict resolution
- ✅ Secure JWT authentication

## 📋 Prerequisites

### Backend Requirements

- PHP >= 8.1
- Composer
- MySQL >= 8.0
- Node.js >= 18.x (for Socket.IO server)
- npm or yarn

### Frontend Requirements

- Node.js >= 18.x
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Studio (for emulator)

## 🚀 Installation & Setup

### 1. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paymate
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Configure JWT secret
JWT_SECRET=your-secret-key-here
JWT_TTL=60

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Generate JWT secret
php artisan jwt:secret

# Start Laravel development server
php artisan serve
# Server runs at http://localhost:8000
```

### 2. Socket.IO Server Setup

```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Start Socket.IO server
node socket-server.js
# Server runs at http://localhost:3000
```

### 3. Frontend Setup (React Native/Expo)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Update API configuration
# Edit src/config/constants.ts and set your API URLs:
# - API_CONFIG.BASE_URL (Laravel backend)
# - SOCKET_CONFIG.URL (Socket.IO server)

# Start Expo development server
npx expo start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Or scan QR code with Expo Go app
```

## 📂 Project Structure

### Backend (Laravel)

```
backend/
├── app/
│   └── Http/
│       ├── Controllers/
│       │   └── Api/
│       │       ├── AuthController.php
│       │       └── UserController.php
│       └── Middleware/
│           └── JWTAuthMiddleware.php
├── config/
│   ├── domain.php              # Domain configuration
│   └── permissions.php         # RBAC/ABAC permissions
├── database/
│   └── migrations/             # Database schema
├── routes/
│   └── api.php                 # API routes
├── src/
│   ├── Application/            # Application layer
│   │   ├── DTO/
│   │   ├── Exceptions/
│   │   └── Services/
│   ├── Domain/                 # Domain layer
│   │   ├── User/
│   │   ├── Supplier/
│   │   ├── Collection/
│   │   ├── Payment/
│   │   └── Shared/
│   │       └── ValueObjects/
│   └── Infrastructure/         # Infrastructure layer
│       └── Persistence/
│           └── Eloquent/
├── socket-server.js            # Socket.IO server
└── package.json
```

### Frontend (React Native)

```
mobile/
├── app/                        # Expo Router screens
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── components/             # Reusable UI components
│   ├── config/
│   │   └── constants.ts        # App configuration
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAppInitialization.ts
│   │   └── useNetworkStatus.ts
│   ├── services/               # Data access layer
│   │   ├── api.ts              # HTTP client
│   │   ├── database.ts         # SQLite persistence
│   │   ├── location.ts         # GPS service
│   │   ├── socket.ts           # Socket.IO client
│   │   └── sync.ts             # Sync orchestration
│   ├── store/                  # Zustand state management
│   │   ├── auth.ts
│   │   ├── suppliers.ts
│   │   ├── collections.ts
│   │   ├── payments.ts
│   │   └── sync.ts
│   ├── types/
│   │   └── index.ts            # TypeScript definitions
│   └── utils/                  # Utility functions
├── app.json
├── package.json
└── tsconfig.json
```

## 🔐 Authentication & Authorization

### User Roles

| Role          | Description        | Permissions                          |
| ------------- | ------------------ | ------------------------------------ |
| **Admin**     | Full system access | All operations (wildcard \*)         |
| **Manager**   | Supervisory access | View, create, update, approve/reject |
| **Collector** | Field operations   | View, create collections/payments    |
| **Viewer**    | Read-only access   | View only                            |

### RBAC Permissions

- `users:view`, `users:create`, `users:update`, `users:delete`
- `suppliers:view`, `suppliers:create`, `suppliers:update`, `suppliers:delete`
- `collections:view`, `collections:create`, `collections:update`, `collections:approve`, `collections:reject`
- `payments:view`, `payments:create`, `payments:confirm`, `payments:cancel`
- `dashboard:view`

### ABAC Attributes

- **Ownership:** Users can only modify their own created resources (unless admin)
- **Location-based:** Restrict access based on supplier location proximity
- **Time-based:** Operations allowed only during business hours

## 🗃️ Database Schema

### Users Table

```sql
- id (UUID, PK)
- name
- email (unique)
- password
- role (admin, manager, collector, viewer)
- is_active
- last_login_at
- created_at, updated_at, deleted_at
```

### Suppliers Table

```sql
- id (UUID, PK)
- name
- contact_number
- address
- location_latitude, location_longitude
- created_by (FK → users)
- is_active
- created_at, updated_at, deleted_at
```

### Collections Table

```sql
- id (UUID, PK)
- supplier_id (FK → suppliers)
- product_type (milk, grains, vegetables)
- quantity_value, quantity_unit
- rate_cents, rate_currency
- total_cents, total_currency
- date
- status (pending, approved, rejected)
- remarks, rejection_reason
- created_by (FK → users), approved_by (FK → users)
- synced, sync_id
- created_at, updated_at, deleted_at
```

### Payments Table

```sql
- id (UUID, PK)
- supplier_id (FK → suppliers)
- amount_cents, amount_currency
- payment_type (advance, partial, full)
- payment_method (cash, bank_transfer, cheque, wallet)
- payment_date
- status (pending, confirmed, cancelled)
- reference_number, notes, cancellation_reason
- created_by (FK → users), confirmed_by (FK → users)
- synced, sync_id
- created_at, updated_at, deleted_at
```

### Sync Queue Table

```sql
- id (INT, PK, auto_increment)
- entity_type (collection, payment, supplier)
- entity_id (UUID)
- operation (create, update, delete)
- payload (JSON)
- status (pending, synced, failed)
- retry_count, error_message
- created_at, updated_at
```

## 🔄 Offline-First Architecture

### How It Works

1. **Local-First Operations:**

   - All create/update operations save to SQLite first
   - UI updates immediately with local data
   - Operations queued in `sync_queue` table

2. **Sync Queue Processing:**

   - Background sync every 5 minutes (configurable)
   - Batch processing (100 items per sync)
   - Automatic retry on failure (max 3 attempts)
   - Conflict resolution: server_wins strategy

3. **Network Detection:**

   - Monitors connectivity with NetInfo
   - Immediate sync when connection restored
   - Queue persists across app restarts

4. **Conflict Resolution:**
   - Each entity has `sync_id` (UUID)
   - Server timestamp comparison
   - Configurable strategy (server_wins, client_wins, last_write_wins)

### Sync Flow Diagram

```
Mobile App                    Sync Queue                Laravel API
    │                             │                          │
    ├─── Create Supplier ─────────►                          │
    │    (Save to SQLite)          │                          │
    │                             │                          │
    ├─── Queue Sync ──────────────► Add to sync_queue       │
    │                             │                          │
    │                             │                          │
    │    (Background Timer)        │                          │
    │                             │                          │
    │◄── Sync Process ─────────────┤                          │
    │                             │                          │
    │                             ├───── POST /suppliers ────►│
    │                             │                          │
    │                             │◄──── Success Response ───┤
    │                             │                          │
    ├──── Update Local ───────────┤ Mark as synced          │
    │     (Update sync_id)        │ Remove from queue       │
    │                             │                          │
```

## 📡 Real-Time Communication

### Socket.IO Events

**Server → Client:**

- `collection:new` - New collection created
- `collection:update` - Collection updated
- `collection:approved` - Collection approved by manager
- `collection:rejected` - Collection rejected
- `payment:new` - New payment recorded
- `payment:confirmed` - Payment confirmed
- `payment:cancelled` - Payment cancelled
- `sync:response` - Sync batch processed
- `sync:status` - Sync progress update

**Client → Server:**

- `collection:created` - Notify about new collection
- `collection:updated` - Notify about collection update
- `payment:created` - Notify about new payment
- `sync:request` - Request manual sync
- `sync:completed` - Sync batch completed

### Room-Based Broadcasting

Users automatically join rooms:

- `user:{userId}` - Personal notifications
- `role:{roleName}` - Role-based notifications

Example: Collection approval notification sent to:

- Creator's personal room
- All managers' role room

## 🧪 API Endpoints

### Authentication

```
POST   /api/v1/auth/login          # Login with email/password
POST   /api/v1/auth/logout         # Logout current user
POST   /api/v1/auth/refresh        # Refresh JWT token
GET    /api/v1/auth/me             # Get current user
```

### Users (Protected)

```
GET    /api/v1/users               # List all users (paginated)
GET    /api/v1/users/{id}          # Get user details
POST   /api/v1/users               # Create new user
PUT    /api/v1/users/{id}          # Update user
DELETE /api/v1/users/{id}          # Delete user (soft)
```

### Suppliers (Protected)

```
GET    /api/v1/suppliers           # List all suppliers
GET    /api/v1/suppliers/{id}      # Get supplier details
POST   /api/v1/suppliers           # Create supplier
PUT    /api/v1/suppliers/{id}      # Update supplier
DELETE /api/v1/suppliers/{id}      # Delete supplier
GET    /api/v1/suppliers/search    # Search suppliers
```

### Collections (Protected)

```
GET    /api/v1/collections                    # List all collections
GET    /api/v1/collections/{id}               # Get collection details
POST   /api/v1/collections                    # Create collection
PUT    /api/v1/collections/{id}               # Update collection
DELETE /api/v1/collections/{id}               # Delete collection
GET    /api/v1/suppliers/{id}/collections     # Get supplier collections
POST   /api/v1/collections/{id}/approve       # Approve collection
POST   /api/v1/collections/{id}/reject        # Reject collection
```

### Payments (Protected)

```
GET    /api/v1/payments                    # List all payments
GET    /api/v1/payments/{id}               # Get payment details
POST   /api/v1/payments                    # Create payment
PUT    /api/v1/payments/{id}               # Update payment
DELETE /api/v1/payments/{id}               # Delete payment
GET    /api/v1/suppliers/{id}/payments     # Get supplier payments
POST   /api/v1/payments/{id}/confirm       # Confirm payment
POST   /api/v1/payments/{id}/cancel        # Cancel payment
```

### Sync (Protected)

```
POST   /api/v1/sync/push           # Push local changes
GET    /api/v1/sync/pull           # Pull server changes
GET    /api/v1/sync/status         # Get sync status
```

### Dashboard (Protected)

```
GET    /api/v1/dashboard/stats              # Get dashboard statistics
GET    /api/v1/dashboard/supplier-balance   # Get supplier balance
```

## 🔧 Configuration

### Backend Configuration

**`.env` Configuration:**

```env
# Application
APP_NAME=PayMate
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paymate
DB_USERNAME=root
DB_PASSWORD=

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_TTL=60
JWT_REFRESH_TTL=20160

# Socket.IO
SOCKET_SERVER_URL=http://localhost:3000
SOCKET_JWT_SECRET=your-socket-secret
```

**Domain Configuration (`config/domain.php`):**

```php
'sync' => [
    'batch_size' => 100,
    'max_retry_attempts' => 3,
    'retry_delay_minutes' => 5,
    'conflict_resolution' => 'server_wins',
],
```

### Frontend Configuration

**`src/config/constants.ts`:**

```typescript
export const API_CONFIG = {
  BASE_URL: "http://localhost:8000", // Update for production
  API_VERSION: "v1",
  TIMEOUT: 30000,
};

export const SOCKET_CONFIG = {
  URL: "http://localhost:3000", // Update for production
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 3000,
};

export const SYNC_CONFIG = {
  SYNC_INTERVAL: 300000, // 5 minutes
  BATCH_SIZE: 100,
  MAX_RETRY_ATTEMPTS: 3,
};
```

## 🚀 Deployment

### Backend Deployment

**Requirements:**

- PHP 8.1+ with extensions: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- MySQL 8.0+
- Composer
- Web server (Apache/Nginx)
- Node.js 18+ (for Socket.IO)

**Steps:**

1. Clone repository to server
2. Run `composer install --optimize-autoloader --no-dev`
3. Configure `.env` with production settings
4. Run `php artisan migrate --force`
5. Set up web server to point to `public/` directory
6. Configure SSL certificate
7. Start Socket.IO server with process manager (PM2)

**Nginx Configuration Example:**

```nginx
server {
    listen 80;
    server_name api.paymate.com;
    root /var/www/paymate/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### Frontend Deployment

**Build for Production:**

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android

# Or use EAS Build (recommended)
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

**Update Configuration:**

- Set production API URLs in `src/config/constants.ts`
- Configure app signing certificates
- Update `app.json` with production metadata

## 🧪 Testing

### Backend Tests

```bash
# Run PHPUnit tests
./vendor/bin/phpunit

# With coverage
./vendor/bin/phpunit --coverage-html coverage
```

### Frontend Tests

```bash
# Run Jest tests
npm test

# With coverage
npm test -- --coverage
```

## 📝 Development Guidelines

### Code Style

**Backend (PHP):**

- Follow PSR-12 coding standard
- Use type hints for all method parameters and return types
- Document public methods with PHPDoc
- Keep methods small (<30 lines)
- Apply SOLID principles

**Frontend (TypeScript):**

- Use TypeScript strict mode
- Prefer functional components with hooks
- Follow React best practices
- Use meaningful variable names
- Extract reusable logic into custom hooks

### Git Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Write/update tests
4. Create pull request
5. Code review
6. Merge after approval

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Contributors

- Backend Architecture: Laravel + Clean Architecture
- Frontend Architecture: React Native + Expo
- Database Design: MySQL with optimized indexes
- Real-time: Socket.IO event system

## 📞 Support

For issues, questions, or feature requests, please contact the development team.

---

Built with ❤️ using Laravel & React Native
