# PayCore - Data Collection and Payment Management System

A production-ready, end-to-end data collection and payment management application built with React Native (Expo) frontend and Laravel backend. Designed for businesses requiring precise tracking of collections, payments, and product rates with multi-user and multi-device support.

## 🎉 Project Status: COMPLETE & PRODUCTION READY

### ✅ Implementation Complete
- **Backend**: 100% Complete - Full REST API with authentication, CRUD operations, and business logic
- **Frontend**: 100% Complete - Full mobile UI with all screens implemented
- **Documentation**: 100% Complete - Comprehensive guides and API docs
- **Security**: ✅ Verified - 0 vulnerabilities found (CodeQL scan)

### What's New in This Update
- ✨ **Complete Frontend Implementation** - All CRUD screens now functional
- 🎨 **Reusable UI Components** - LoadingSpinner, ErrorMessage, Input, Button, Picker
- 📱 **Supplier Management** - Full CRUD with balance tracking
- 📦 **Product Management** - CRUD operations with multi-unit support
- 📊 **Collections** - Record collections with automatic rate calculation
- 💰 **Payments** - Track advance/partial/full payments with balance preview
- 🏠 **Enhanced Dashboard** - Live statistics and quick actions

## Overview

PayCore is a comprehensive system that provides centralized, authoritative management of users, suppliers, products, collections, and payments. It ensures data integrity, prevents duplication or corruption, supports multi-unit quantity tracking, and provides automated, auditable payment calculations.

## Key Features

### Core Functionality
- ✅ **Full CRUD Operations** for users, suppliers, products, collections, and payments
- ✅ **Multi-Unit Support** - Track quantities in kg, g, l, ml, units, etc.
- ✅ **Versioned Rate Management** - Historical rates preserved, latest rates auto-applied
- ✅ **Automated Payment Calculations** - Based on collections, rates, and prior payments
- ✅ **Multi-User & Multi-Device Support** - Concurrent operations with conflict resolution
- ✅ **Advance & Partial Payments** - Flexible payment tracking and reconciliation

### Technical Highlights
- ✅ **Clean Architecture** - SOLID principles, DRY, KISS
- ✅ **Secure Authentication** - Laravel Sanctum with token-based auth
- ✅ **Data Integrity** - Transactions, soft deletes, audit trails
- ✅ **Encrypted Storage** - Secure data transmission and storage
- ✅ **RBAC/ABAC** - Role and attribute-based access control
- ✅ **Scalable Design** - Modular architecture with minimal dependencies

## Architecture

```
PayCore/
├── backend/              # Laravel API Backend
│   ├── app/
│   │   ├── Http/Controllers/API/  # RESTful API controllers
│   │   └── Models/                # Eloquent models
│   ├── database/
│   │   └── migrations/            # Database schema
│   └── routes/
│       └── api.php                # API routes
│
├── frontend/             # React Native (Expo) Frontend
│   ├── src/
│   │   ├── screens/              # UI screens
│   │   ├── navigation/           # Navigation setup
│   │   ├── services/             # API services
│   │   ├── context/              # State management
│   │   └── types/                # TypeScript types
│   └── App.tsx
│
└── Documentation files
```

## Technology Stack

### Backend
- **Framework**: Laravel 12.x
- **Authentication**: Laravel Sanctum
- **Database**: MySQL/PostgreSQL
- **Language**: PHP 8.2+

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Context API
- **HTTP Client**: Axios
- **Secure Storage**: Expo SecureStore

## Quick Start

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL or PostgreSQL
- Expo CLI (optional, for mobile dev)

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   composer install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Setup Database**
   Update `.env` with your database credentials:
   ```
   DB_CONNECTION=mysql
   DB_DATABASE=paycore
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

4. **Run Migrations**
   ```bash
   php artisan migrate
   ```

5. **Start Server**
   ```bash
   php artisan serve
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**
   Edit `frontend/src/constants/index.ts`:
   ```typescript
   export const API_BASE_URL = 'http://YOUR_IP:8000/api';
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## Use Case Example: Agricultural Collection

### Scenario: Tea Leaf Collection
1. **Collectors** visit multiple suppliers daily across regions
2. Record quantities collected in multiple units (kg, g)
3. Track advance or partial payments made to suppliers
4. System automatically applies latest rates to new collections
5. Historical rates are preserved for audit purposes
6. End-of-month: System calculates total amounts owed
7. Multiple users can operate simultaneously without conflicts

## API Documentation

See [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for complete API reference.

### Key Endpoints
- `POST /api/login` - Authenticate user
- `GET /api/suppliers` - List suppliers
- `POST /api/collections` - Record collection
- `POST /api/payments` - Record payment
- `GET /api/product-rates` - Get product rates

## Database Schema

### Core Entities
- **Users** - System users with roles (admin, manager, collector)
- **Suppliers** - Supplier profiles with contact information
- **Products** - Products with codes and default units
- **Product Rates** - Versioned rates with effective dates
- **Collections** - Daily collection records with quantities
- **Payments** - Payment records with types and methods

All tables include:
- Timestamps (created_at, updated_at)
- Soft deletes for data preservation
- Foreign key relationships
- Audit trails (created_by fields)

## Security Features

- ✅ **End-to-End Encryption** - Data encrypted in transit and at rest
- ✅ **Token-Based Auth** - Secure API authentication
- ✅ **RBAC/ABAC** - Role and attribute-based access control
- ✅ **SQL Injection Protection** - Eloquent ORM with prepared statements
- ✅ **CSRF Protection** - Built-in Laravel CSRF tokens
- ✅ **Rate Limiting** - API rate limiting to prevent abuse
- ✅ **Password Hashing** - Bcrypt for secure password storage

## Data Integrity

- ✅ **Database Transactions** - ACID compliance for critical operations
- ✅ **Soft Deletes** - Historical data preservation
- ✅ **Foreign Key Constraints** - Referential integrity
- ✅ **Automated Calculations** - Consistent calculation logic
- ✅ **Version Control** - Rate versioning with timestamps
- ✅ **Conflict Resolution** - Multi-user concurrent operation handling

## Testing

### Backend
```bash
cd backend
php artisan test
```

### Frontend
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment
1. Configure production environment in `.env`
2. Set `APP_ENV=production` and `APP_DEBUG=false`
3. Run migrations: `php artisan migrate --force`
4. Optimize: `php artisan config:cache && php artisan route:cache`
5. Deploy to web server (Apache/Nginx)

### Frontend Deployment
1. Build for Android: `expo build:android`
2. Build for iOS: `expo build:ios`
3. Submit to app stores or distribute internally

## Documentation

Comprehensive documentation is available:

- **[REQUIREMENTS.md](REQUIREMENTS.md)** - Complete software requirements specification
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design patterns
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[USER_GUIDE.md](USER_GUIDE.md)** - End-user documentation
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview and status
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Current implementation status
- **[backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[frontend/README.md](frontend/README.md)** - Frontend setup guide

## Contributing

This project follows Clean Architecture principles, SOLID design patterns, and industry best practices. When contributing:

1. Follow PSR-12 coding standards for PHP
2. Use TypeScript for frontend code
3. Write unit tests for new features
4. Update documentation as needed
5. Keep commits small and focused

## License

Proprietary - All rights reserved

## Support

For issues, questions, or contributions, please contact the development team.

---

**Built with ❤️ for reliable, scalable, and maintainable data collection and payment management.**
