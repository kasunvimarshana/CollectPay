# Data Collection and Payment Management System

A production-ready, end-to-end data collection and payment management application built with React Native (Expo) frontend and Laravel backend. The system ensures data integrity, multi-user/multi-device support, and auditable financial operations.

## 🎯 Overview

This system provides centralized management of users, suppliers, products, collections, and payments with:
- **Multi-unit quantity tracking** (kg, g, liters, etc.)
- **Versioned rate management** with historical preservation
- **Automated payment calculations** with audit trails
- **Multi-user/multi-device concurrency** with conflict resolution
- **RBAC/ABAC security** with end-to-end encryption

## 🏗️ Architecture

### Backend (`/backend`)
- **Framework**: Laravel 11
- **Database**: SQLite (development), MySQL/PostgreSQL (production)
- **Architecture**: Clean Architecture, SOLID principles
- **Security**: JWT authentication, RBAC/ABAC, encrypted storage

### Frontend (`/frontend`)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Architecture**: Clean Architecture with clear separation of concerns
- **State Management**: Context API / Redux (to be implemented)
- **Offline Support**: Local SQLite storage with sync

## 📋 Features

### Core Functionality
- ✅ User Management (CRUD, roles, permissions)
- ✅ Supplier Management (profiles, multi-unit tracking)
- ✅ Product Management (CRUD, versioned rates)
- ✅ Collection Management (daily tracking, multi-unit support)
- ✅ Payment Management (advance/partial/full payments)

### Advanced Features
- 🔒 End-to-end encryption
- 👥 Multi-user concurrent access
- 📱 Multi-device synchronization
- 📊 Automated financial calculations
- 📝 Complete audit trails
- 🔄 Offline-first with sync

## 🚀 Quick Start

### Prerequisites
- PHP 8.3+
- Composer 2.x
- Node.js 20.x+
- npm 10.x+

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Start development server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS (requires macOS)
npm run web      # Web browser
```

## 📚 Documentation

For detailed specifications, see:
- [Software Requirements Specification (SRS)](./SRS.md)
- [Product Requirements Document (PRD)](./PRD.md)
- [Executive Summary (ES)](./ES.md)

## 🔧 Technology Stack

### Backend
- Laravel 11
- PHP 8.3
- JWT for authentication
- SQLite/MySQL/PostgreSQL

### Frontend
- React Native
- Expo SDK
- TypeScript
- AsyncStorage / SQLite for offline storage

## 🧪 Testing

```bash
# Backend tests
cd backend
php artisan test

# Frontend tests
cd frontend
npm test
```

## 📝 Example Use Case: Tea Leaves Collection

1. Users visit multiple suppliers daily
2. Record quantities in multiple units (kg, g)
3. Track advance/partial payments
4. Apply finalized rates at month-end
5. Automatically calculate total payments
6. Maintain full audit trail

## 🤝 Contributing

This project follows Clean Architecture, SOLID, DRY, and KISS principles. All contributions must maintain:
- Clear separation of concerns
- Comprehensive tests
- Proper documentation
- Security best practices

## 📄 License

[Specify your license here]

## 👤 Author

Kasun Vimarshana

## 📞 Support

[Add support contact information]
