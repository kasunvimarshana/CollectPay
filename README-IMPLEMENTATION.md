# LedgerFlow - Data Collection & Payment Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-51.x-black.svg)](https://expo.dev)

## Overview

LedgerFlow is a production-ready, end-to-end data collection and payment management application built with **Clean Architecture** principles. It provides centralized, authoritative management of users, suppliers, products, collections, and payments, ensuring strong data integrity, consistency, and reliability across multiple users and devices.

### Key Features

- ✅ **Clean Architecture**: Clear separation of concerns with modular, scalable layers
- 🔒 **Security First**: End-to-end encryption, RBAC/ABAC authorization, audit trails
- 📊 **Multi-Unit Support**: Accurate tracking across different measurement units
- 💰 **Payment Management**: Advance, partial, and final payment tracking with automated calculations
- 📈 **Rate Versioning**: Historical rate management for accurate auditing
- 🔄 **Offline Support**: Local persistence with conflict-aware synchronization
- 👥 **Multi-User**: Concurrent operations across multiple devices
- 🧪 **Well-Tested**: Comprehensive unit, integration, and feature tests
- 📱 **Cross-Platform**: iOS and Android support via React Native/Expo

## Architecture

LedgerFlow follows **Clean Architecture** with **SOLID principles**, **DRY**, and **KISS** practices:

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│              (UI, Controllers, API Endpoints)                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     Application Layer                        │
│              (Use Cases, Business Logic)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                       Domain Layer                           │
│        (Entities, Value Objects, Repository Interfaces)      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Infrastructure Layer                       │
│      (Database, External APIs, Framework Specifics)          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Laravel 11.x (PHP 8.3+)
- MySQL/PostgreSQL
- Laravel Sanctum (Authentication)
- PHPUnit (Testing)

**Frontend:**
- React Native 0.74
- Expo 51.x
- TypeScript
- SQLite (Local storage)
- Zustand (State management)
- Jest (Testing)

## Project Structure

```
ledgerflow/
├── backend/                    # Laravel backend
│   ├── src/
│   │   ├── Domain/            # Business entities & logic
│   │   │   ├── Entities/
│   │   │   ├── ValueObjects/
│   │   │   ├── Repositories/  # Interfaces
│   │   │   └── Services/
│   │   ├── Application/       # Use cases
│   │   │   ├── UseCases/
│   │   │   └── DTOs/
│   │   ├── Infrastructure/    # Implementation details
│   │   │   ├── Persistence/
│   │   │   ├── Security/
│   │   │   └── Logging/
│   │   └── Presentation/      # API layer
│   │       ├── Controllers/
│   │       ├── Requests/
│   │       └── Resources/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── tests/
│
├── frontend/                   # React Native/Expo frontend
│   ├── src/
│   │   ├── domain/            # Business logic
│   │   │   ├── entities/
│   │   │   ├── repositories/  # Interfaces
│   │   │   └── usecases/
│   │   ├── data/              # Data layer
│   │   │   ├── repositories/  # Implementations
│   │   │   ├── datasources/   # API, Local DB
│   │   │   └── models/
│   │   ├── presentation/      # UI layer
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   └── state/
│   │   └── core/              # Utilities
│   └── __tests__/
│
├── ARCHITECTURE.md             # Detailed architecture docs
├── IMPLEMENTATION_GUIDE.md     # Step-by-step implementation
├── PRD.md                      # Product requirements
├── SRS.md                      # Software requirements
└── README.md                   # This file
```

## Quick Start

### Prerequisites

- PHP 8.3+
- Composer
- Node.js 20+
- MySQL/PostgreSQL
- Expo CLI

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate
php artisan db:seed

# Start server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm start
```

## Core Entities

### User
- Authentication & authorization
- Role-based access control (Admin, Manager, Collector)
- Permissions management

### Supplier
- Supplier profile management
- Contact information
- Metadata support

### Product
- Product management
- Multi-unit support (kg, g, lb, oz, l, ml, etc.)
- Rate versioning for historical accuracy

### Collection
- Multi-unit quantity tracking
- Rate snapshot at collection time
- Automated total calculation
- Historical data preservation

### Payment
- Advance, partial, and final payments
- Automated balance calculation
- Payment history tracking

## API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### Resources
```
GET    /api/users
POST   /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}

GET    /api/suppliers
POST   /api/suppliers
GET    /api/suppliers/{id}
PUT    /api/suppliers/{id}
DELETE /api/suppliers/{id}

GET    /api/products
POST   /api/products
POST   /api/products/{id}/rates
GET    /api/products/{id}/rates

GET    /api/collections
POST   /api/collections
GET    /api/suppliers/{id}/collections

GET    /api/payments
POST   /api/payments
GET    /api/suppliers/{id}/payments
GET    /api/suppliers/{id}/balance
```

## Security Features

- 🔐 **Authentication**: JWT/Sanctum tokens with secure refresh
- 🛡️ **Authorization**: RBAC and ABAC enforcement
- 🔒 **Encryption**: Data encrypted at rest and in transit (TLS 1.3)
- 📝 **Audit Trail**: Immutable logs of all operations
- ✅ **Input Validation**: Multi-layer validation
- 🚫 **Rate Limiting**: API throttling
- 🔑 **Password Hashing**: Argon2ID algorithm

## Multi-User Concurrency

- Optimistic locking with version control
- Transaction isolation for data consistency
- Last-write-wins with server authority
- Conflict detection and resolution
- Queue-based synchronization

## Offline Support

- Local SQLite database
- Automatic sync when online
- Conflict-aware merging
- Data integrity preservation
- Network status monitoring

## Testing

### Backend Tests
```bash
cd backend
php artisan test
php artisan test --coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm test -- --coverage
```

## Deployment

### Backend
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend
```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

## Use Cases

### Agricultural Collection (Tea Leaves)
- Daily collection recording from multiple suppliers
- Multi-unit tracking (kg, g)
- Advance and partial payments
- End-of-month rate application
- Automated payment calculation
- Multi-user concurrent entry

### Multi-Device Workflows
- Multiple collectors entering data simultaneously
- Real-time synchronization
- No data duplication or corruption
- Consistent state across all devices

## Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [Product Requirements](PRD.md)
- [System Requirements](SRS.md)
- [API Documentation](docs/API.md) _(to be generated)_

## Development Principles

### Clean Architecture
- **Independence**: Business logic independent of frameworks
- **Testability**: Easy to test all layers
- **Flexibility**: Easy to change implementations
- **Maintainability**: Clear boundaries and responsibilities

### SOLID Principles
- **S**: Single Responsibility - Each class has one job
- **O**: Open/Closed - Open for extension, closed for modification
- **L**: Liskov Substitution - Subtypes are substitutable
- **I**: Interface Segregation - Specific interfaces over general ones
- **D**: Dependency Inversion - Depend on abstractions

### DRY (Don't Repeat Yourself)
- Shared logic extracted into services
- Reusable components and utilities
- Common patterns abstracted

### KISS (Keep It Simple, Stupid)
- Simple solutions over complex ones
- Minimal complexity at every level
- Clear and readable code

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow Clean Architecture principles
4. Write tests for new features
5. Ensure all tests pass
6. Commit with clear messages
7. Push to the branch
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions:
- GitHub Issues: [Create an issue](https://github.com/kasunvimarshana/ledgerflow/issues)
- Documentation: See `docs/` folder
- Email: support@ledgerflow.com _(if applicable)_

## Acknowledgments

- Laravel Framework
- React Native & Expo
- Clean Architecture by Robert C. Martin
- SOLID Principles
- Open Source Community

---

**Built with ❤️ following Clean Architecture, SOLID, DRY, and KISS principles**

**Version**: 1.0.0  
**Last Updated**: December 2025
