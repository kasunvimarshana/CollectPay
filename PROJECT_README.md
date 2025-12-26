# Paywise - Data Collection and Payment Management System

A production-ready, end-to-end data collection and payment management application designed for businesses requiring precise tracking of collections, payments, and product rates. Built with React Native (Expo) frontend and Laravel backend, ensuring data integrity, multi-user support, and real-world multi-device workflows.

## 📋 Overview

Paywise provides centralized, authoritative management of users, suppliers, products, collections, and payments. The system ensures data integrity, prevents duplication or corruption, supports multi-unit quantity tracking, and provides automated, auditable payment calculations.

**Example Use Case**: Agricultural product collection (e.g., tea leaves, produce) where users record daily quantities from multiple suppliers, track advance/partial payments, and calculate totals based on dynamic product rates.

## ✨ Key Features

### Core Functionality
- ✅ **Full CRUD Operations** for users, suppliers, products, collections, and payments
- ✅ **Multi-Unit Tracking** - Manage quantities in kg, g, liters, etc.
- ✅ **Versioned Product Rates** - Historical rate preservation with time-based application
- ✅ **Automated Payment Calculations** - Based on collections, rates, and prior payments
- ✅ **Multi-User & Multi-Device Support** - Concurrent operations without conflicts
- ✅ **Advance & Partial Payments** - Flexible payment tracking

### Security & Data Integrity
- 🔒 **End-to-End Encryption** - Data secured in transit and at rest
- 🔐 **Role-Based Access Control (RBAC)** - Admin, Manager, Collector roles
- 🛡️ **Optimistic Locking** - Prevents concurrent update conflicts
- 📝 **Audit Trail** - Complete transaction history with user tracking
- 🔄 **Transactional Operations** - Ensures data consistency

### Architecture & Design
- 🏗️ **Clean Architecture** - Clear separation of concerns
- 📐 **SOLID Principles** - Maintainable and scalable codebase
- 🎯 **DRY & KISS** - Minimal complexity, maximum clarity
- 📦 **Minimal Dependencies** - Native and LTS-supported libraries only

## 🛠️ Technology Stack

### Backend
- **Laravel 11** - PHP framework
- **Laravel Sanctum** - API authentication
- **SQLite/MySQL/PostgreSQL** - Database options
- **PHP 8.2+** - Modern PHP features

### Frontend
- **React Native** with Expo
- **React Navigation** - Navigation system
- **Axios** - HTTP client
- **AsyncStorage** - Local data persistence
- **Context API** - State management

## 📁 Project Structure

```
Paywise/
├── backend/               # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   ├── API_DOCUMENTATION.md
│   └── README.md
│
├── frontend/              # React Native (Expo) App
│   ├── src/
│   │   ├── api/
│   │   ├── context/
│   │   ├── navigation/
│   │   └── screens/
│   ├── App.js
│   └── README.md
│
└── Documentation/         # Project documentation
    ├── README.md
    ├── SRS.md             # Software Requirements Specification
    ├── PRD.md             # Product Requirements Document
    └── ES.md              # Executive Summary
```

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+ with Composer
- Node.js 18+ with npm
- SQLite (included) or MySQL/PostgreSQL
- Expo CLI (auto-installed)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Configure environment:
```bash
cp .env.example .env
php artisan key:generate
```

4. Run migrations and seed database:
```bash
php artisan migrate
php artisan db:seed
```

5. Start the server:
```bash
php artisan serve
```

Backend API will be available at `http://localhost:8000/api`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/api/client.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api'; // or your server URL
```

4. Start the app:
```bash
npm start
```

5. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your device

## 👤 Default User Accounts

| Role      | Email                    | Password |
|-----------|--------------------------|----------|
| Admin     | admin@paywise.com        | password |
| Manager   | manager@paywise.com      | password |
| Collector | collector@paywise.com    | password |

## 📖 Documentation

- **[Backend README](./backend/README.md)** - Laravel API documentation
- **[Frontend README](./frontend/README.md)** - React Native app documentation
- **[API Documentation](./backend/API_DOCUMENTATION.md)** - Complete API reference
- **[SRS](./SRS.md)** - Software Requirements Specification
- **[PRD](./PRD.md)** - Product Requirements Document

## 🔑 Core Entities

### Users
- Roles: Admin, Manager, Collector
- Secure authentication with tokens
- Activity tracking

### Suppliers
- Detailed profiles (name, code, contact, location)
- Active/inactive status
- Financial tracking (total owed calculation)

### Products
- Multi-unit support
- Versioned rates with effective dates
- Historical rate preservation

### Collections
- Daily collection records
- Multi-unit quantities
- Automatic rate application
- Total amount calculations

### Payments
- Type: Advance, Partial, Full
- Reference numbers
- Payment history tracking
- Supplier-specific records

## 🏛️ Architecture Highlights

### Backend Architecture
- **RESTful API** design
- **Repository Pattern** for data access
- **Service Layer** for business logic
- **Database Transactions** for consistency
- **Validation & Error Handling**
- **Optimistic Locking** for concurrency

### Frontend Architecture
- **Screen-based Navigation**
- **Context-based State Management**
- **API Service Layer**
- **Reusable Components**
- **Clean Separation of Concerns**

## 🔄 Data Flow

1. **User authenticates** via mobile app
2. **Token stored** locally for subsequent requests
3. **API calls** include auth token in headers
4. **Backend validates** token and permissions
5. **Business logic executes** with transactions
6. **Response returned** to mobile app
7. **UI updates** with fresh data

## 🧪 Testing

### Backend Tests
```bash
cd backend
php artisan test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📱 Supported Platforms

- ✅ iOS (11.0+)
- ✅ Android (5.0+)
- ✅ Web browsers (Chrome, Safari, Firefox)

## 🔐 Security Features

1. **Token-based Authentication** - Laravel Sanctum
2. **Password Hashing** - bcrypt
3. **CSRF Protection** - Built-in Laravel protection
4. **SQL Injection Prevention** - Eloquent ORM
5. **Input Validation** - All inputs validated
6. **Optimistic Locking** - Version-based conflict resolution
7. **HTTPS Ready** - Production-grade security

## 📊 Database Schema

### Key Tables
- `users` - System users with roles
- `suppliers` - Supplier profiles
- `products` - Product definitions
- `product_rates` - Versioned rates with effective dates
- `collections` - Daily collection records
- `payments` - Payment transactions

### Features
- **Foreign Key Constraints** - Referential integrity
- **Indexes** - Optimized queries
- **Soft Deletes** - Data recovery
- **Timestamps** - Audit trails
- **Version Fields** - Optimistic locking

## 🌟 Best Practices

1. **Always use transactions** for multi-step operations
2. **Include version field** when updating records
3. **Validate all inputs** on frontend and backend
4. **Handle errors gracefully** with user-friendly messages
5. **Test concurrency scenarios** before deployment
6. **Keep documentation updated** with code changes
7. **Use environment variables** for configuration
8. **Follow naming conventions** consistently

## 🚢 Production Deployment

### Backend Deployment
1. Set up production database (MySQL/PostgreSQL)
2. Configure `.env` for production
3. Run migrations: `php artisan migrate --force`
4. Set up web server (Nginx/Apache)
5. Configure HTTPS
6. Set up queue workers for background jobs
7. Configure logging and monitoring

### Frontend Deployment
1. Build production app: `expo build:android` / `expo build:ios`
2. Or use EAS Build: `eas build`
3. Submit to App Store / Play Store
4. Configure production API URL
5. Enable crash reporting
6. Set up analytics

## 🐛 Troubleshooting

### Backend Issues
- Check PHP version: `php --version`
- Clear cache: `php artisan cache:clear`
- Check logs: `storage/logs/laravel.log`

### Frontend Issues
- Clear cache: `npm start -- --clear`
- Check API URL configuration
- Verify network connectivity
- Check Metro bundler logs

## 📝 License

Proprietary - All rights reserved

## 👥 Contributors

- Project developed following Clean Architecture principles
- Designed for production use in real-world business scenarios

## 📞 Support

For issues, questions, or feature requests, please refer to the documentation or contact the development team.

---

**Built with ❤️ for efficient data collection and payment management**
