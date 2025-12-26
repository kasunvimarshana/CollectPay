"# SyncLedger - Data Collection and Payment Management System

## Overview

SyncLedger is a production-ready, offline-first data collection and payment management application designed for field operations. It features a React Native (Expo) mobile frontend and a Laravel backend API, with comprehensive sync capabilities, conflict resolution, and strong data consistency guarantees.

## Key Features

### Core Functionality
- **Supplier Management**: Complete supplier profiles with contact details and status tracking
- **Product Management**: Multi-unit product catalog with categories
- **Rate Management**: Time-based and versioned product rates with supplier-specific pricing
- **Collection Tracking**: Detailed collection records with automatic rate application
- **Payment Processing**: Advanced payment management with automated balance calculations
- **Multi-user Support**: Role-based access control (Admin, Manager, Collector)

### Synchronization
- **Online-First Architecture**: Backend as single source of truth
- **Controlled Auto-Sync**: Event-driven synchronization (network regain, app foreground, post-auth)
- **Manual Sync Option**: User-initiated sync with clear status indicators
- **Idempotent Operations**: UUID-based deduplication prevents data duplication
- **Conflict Detection**: Version-based conflict detection with server-wins strategy
- **Offline Resilience**: Full offline operation with local SQLite storage

### Security
- **Authentication**: Token-based auth with Laravel Sanctum
- **Authorization**: Combined RBAC (role-based) and ABAC (attribute-based)
- **Encrypted Storage**: Expo SecureStore for sensitive data
- **API Security**: HTTPS, CORS, request validation, SQL injection prevention
- **Audit Trail**: Comprehensive logging of all operations

### Architecture
- **Clean Architecture**: Clear separation of domain, data, and presentation layers
- **SOLID Principles**: Maintainable, testable, and extensible code
- **Repository Pattern**: Abstracted data access layer
- **Service Layer**: Encapsulated business logic

## Technology Stack

### Backend
- **Framework**: Laravel 10+ (PHP 8.1+)
- **Database**: MySQL/MariaDB
- **Authentication**: Laravel Sanctum
- **API**: RESTful JSON API

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **Local Storage**: Expo SQLite
- **Secure Storage**: Expo SecureStore
- **Network**: Axios with interceptors
- **State Management**: React Hooks and Context API

## Project Structure

```
SyncLedger/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Models/            # Eloquent models
│   │   ├── Http/Controllers/  # API controllers
│   │   ├── Services/          # Business logic
│   │   └── Providers/         # Service providers
│   ├── database/
│   │   └── migrations/        # Database migrations
│   ├── routes/
│   │   └── api.php           # API routes
│   └── config/               # Configuration files
│
├── frontend/                  # React Native app
│   ├── src/
│   │   ├── domain/           # Business entities and use cases
│   │   ├── data/             # Repositories and models
│   │   ├── infrastructure/   # Database, network, sync
│   │   └── presentation/     # UI screens and components
│   ├── App.js               # Main app entry
│   └── app.json             # Expo configuration
│
└── docs/                     # Documentation
```

## Quick Start

### Backend Setup

1. **Prerequisites**: PHP 8.1+, Composer, MySQL
2. **Install**:
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
3. **Configure** `.env` with database credentials
4. **Migrate**: `php artisan migrate`
5. **Run**: `php artisan serve`

### Frontend Setup

1. **Prerequisites**: Node.js 16+, Expo CLI
2. **Install**:
   ```bash
   cd frontend
   npm install
   ```
3. **Configure** API URL in `app.json`
4. **Run**: `npm start`

## Features Overview

### Offline-First Operation
- Works completely offline with local SQLite database
- Automatic sync when connection restored
- Queue-based sync with retry logic
- Clear visual indicators for sync status

### Rate Management
- Time-based rate versioning
- Supplier-specific and general rates
- Historical rate preservation
- Automatic rate application on collections

### Payment Calculations
- Automated outstanding balance tracking
- Advance, partial, and full payment support
- Payment validation against outstanding
- Audit trail with calculation details

### Conflict Resolution
- Version-based optimistic locking
- Timestamp-based freshness checks
- Server-wins strategy (configurable)
- Manual resolution for complex conflicts

## API Documentation

See `/docs/API.md` for complete API reference with examples.

## Deployment

### Production Checklist
- [ ] Configure production `.env` files
- [ ] Set up SSL certificates
- [ ] Configure database backups
- [ ] Enable error logging
- [ ] Set up monitoring
- [ ] Test sync in production network
- [ ] Configure rate limiting
- [ ] Review security settings

## License

MIT License

## Version

**v1.0.0** - Production Release" 
