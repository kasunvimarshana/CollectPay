# TrackVault - Data Collection and Payment Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP Version](https://img.shields.io/badge/PHP-8.2%2B-blue)](https://www.php.net/)
[![Node Version](https://img.shields.io/badge/Node-18%2B-green)](https://nodejs.org/)

## Overview

TrackVault is a production-ready, end-to-end data collection and payment management application designed for businesses requiring precise tracking of collections, payments, and product rates. Built with a PHP backend following Clean Architecture principles and a React Native (Expo) mobile frontend, the system ensures **data integrity, multi-device support, multi-user access, prevention of data duplication or corruption, and multi-unit management**.

## 🎯 Key Features

### Core Functionality
- ✅ **Complete CRUD Operations** for Users, Suppliers, Products, Collections, and Payments
- ✅ **Multi-Unit Support**: Track quantities in kg, g, liters, ml, etc. with automatic conversion
- ✅ **Versioned Rates**: Historical rate management with automatic application for new entries
- ✅ **Automated Calculations**: Payment calculations based on collections, rates, and prior transactions
- ✅ **Multi-User Support**: Concurrent operations across multiple users without data conflicts
- ✅ **Multi-Device Support**: Consistent data across all devices
- ✅ **Audit Trails**: Complete history of all operations for accountability

### Security & Data Integrity
- 🔒 **End-to-End Encryption**: Data encrypted at rest and in transit
- 🔒 **RBAC/ABAC**: Role-based and attribute-based access control
- 🔒 **JWT Authentication**: Secure token-based authentication
- 🔒 **Optimistic Locking**: Version-based concurrency control
- 🔒 **Audit Logging**: Comprehensive audit trail for all operations
- 🔒 **Input Validation**: Multi-layer validation on both frontend and backend

### Architecture
- 🏗️ **Clean Architecture**: Clear separation of concerns
- 🏗️ **SOLID Principles**: Maintainable and extensible code
- 🏗️ **DRY & KISS**: Simple, non-repetitive implementations
- 🏗️ **Domain-Driven Design**: Business logic at the core
- 🏗️ **Repository Pattern**: Abstract data access
- 🏗️ **Value Objects**: Immutable, validated domain primitives

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+ with extensions: pdo, json, openssl
- MySQL 5.7+ or PostgreSQL 12+
- Composer (optional, no external dependencies required)
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Generate autoload files (optional if no composer dependencies)
composer dump-autoload -o

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and security keys

# Create database
mysql -u root -p
CREATE DATABASE trackvault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Run migrations
mysql -u root -p trackvault < database/migrations/001_create_tables.sql

# Start development server
php -S localhost:8000 -t public
```

The API will be available at http://localhost:8000/api

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
# Create a .env file or edit frontend/src/application/services/ApiService.ts
# Update API_BASE_URL to point to your backend (default: http://localhost:8000/api)

# Start Expo
npm start

# Run on device/simulator
npm run ios     # For iOS
npm run android # For Android
npm run web     # For web browser
```

### Initial Setup

1. **Create First User**: Use the register endpoint
   ```bash
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "email": "admin@trackvault.com",
       "password": "secure_password",
       "roles": ["admin"]
     }'
   ```

2. **Login**: Use the mobile app or API
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@trackvault.com",
       "password": "secure_password"
     }'
   ```

3. **Test Health**: Verify the backend is running
   ```bash
   curl http://localhost:8000/api/health
   ```

## 📁 Project Structure

```
TrackVault/
├── backend/                    # PHP Backend
│   ├── src/
│   │   ├── Domain/            # Business logic layer
│   │   │   ├── Entities/      # Core business entities
│   │   │   ├── ValueObjects/  # Immutable value objects
│   │   │   ├── Repositories/  # Repository interfaces
│   │   │   └── Services/      # Domain services
│   │   ├── Application/       # Use cases and DTOs
│   │   ├── Infrastructure/    # External concerns
│   │   │   ├── Persistence/   # Database implementations
│   │   │   ├── Security/      # Auth and security
│   │   │   ├── Logging/       # Audit logging
│   │   │   └── Encryption/    # Data encryption
│   │   └── Presentation/      # API controllers
│   ├── config/                # Configuration files
│   ├── database/              # Database migrations
│   ├── public/                # Web entry point
│   └── tests/                 # Backend tests
├── frontend/                   # React Native App
│   ├── src/
│   │   ├── domain/            # Domain entities
│   │   ├── application/       # Use cases & state
│   │   ├── infrastructure/    # API client, storage
│   │   └── presentation/      # UI components
│   ├── assets/                # Images and resources
│   └── __tests__/             # Frontend tests
├── docs/                       # Additional documentation
├── IMPLEMENTATION.md           # Implementation details
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

## 🔧 Technology Stack

### Backend
- **Language**: PHP 8.2+
- **Database**: MySQL 5.7+ / PostgreSQL 12+
- **Authentication**: JWT
- **Encryption**: AES-256-GCM
- **Architecture**: Clean Architecture, DDD

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: React Context API
- **Storage**: Expo SecureStore
- **Navigation**: React Navigation

## 📚 Documentation

- [Implementation Details](IMPLEMENTATION.md) - Detailed architecture and design decisions
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Backend README](backend/README.md) - Backend-specific documentation
- [Frontend README](frontend/README.md) - Frontend-specific documentation
- [SRS Document](SRS.md) - Software Requirements Specification
- [PRD Document](PRD.md) - Product Requirements Document

## 🧪 Testing

### Backend Tests
```bash
cd backend
composer test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Use Cases

### Agricultural Collection Workflow (Tea Leaves)
1. **Daily Collection**: Collectors visit multiple suppliers and record quantities in various units
2. **Payment Tracking**: Advance and partial payments are recorded
3. **Rate Management**: Monthly rates are updated with historical preservation
4. **Automated Calculations**: System calculates total amounts owed per supplier
5. **Multi-User Operations**: Multiple collectors work simultaneously without conflicts
6. **Audit & Reporting**: Complete transparency and financial oversight

## 🔐 Security Features

- **Password Hashing**: Argon2id algorithm
- **JWT Tokens**: Secure authentication with expiry
- **Data Encryption**: AES-256-GCM for sensitive data
- **HTTPS**: Required for production
- **CORS**: Configurable cross-origin policies
- **SQL Injection Prevention**: Prepared statements
- **XSS Prevention**: Output escaping
- **Audit Logging**: All operations logged

## 🎯 Design Principles

This project strictly follows:

- ✅ **Clean Architecture** - Framework-independent, testable core
- ✅ **SOLID Principles** - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- ✅ **DRY** - Don't Repeat Yourself
- ✅ **KISS** - Keep It Simple, Stupid
- ✅ **Domain-Driven Design** - Business logic at the core
- ✅ **Repository Pattern** - Abstracted data access
- ✅ **Value Objects** - Immutable domain primitives

## 📊 Database Schema

The system uses a normalized relational database with the following main tables:

- **users** - User accounts with RBAC
- **suppliers** - Supplier profiles
- **products** - Products with versioned rates
- **collections** - Collection transactions
- **payments** - Payment transactions
- **audit_logs** - Complete audit trail

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for detailed schema.

## 🚀 Deployment

For production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

Key deployment requirements:
- PHP 8.2+ with required extensions
- MySQL 5.7+ or PostgreSQL 12+
- HTTPS/SSL certificate
- Secure JWT and encryption keys
- Regular backups
- Monitoring and logging

## 🤝 Contributing

This is a production-ready application built to specific requirements. For modifications:

1. Follow Clean Architecture principles
2. Maintain test coverage
3. Update documentation
4. Follow existing code style
5. Ensure backward compatibility

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 💡 Support

For issues, questions, or support:
- Review documentation in `docs/` directory
- Check audit logs for operational issues
- Review application logs

## 🎓 Learning Resources

This project demonstrates:
- Clean Architecture implementation in PHP and TypeScript
- Domain-Driven Design patterns
- Multi-tier security
- Optimistic locking for concurrency
- Value objects and entities
- Repository pattern
- SOLID principles in practice

---

**Built with ❤️ for reliable, secure, and maintainable data collection and payment management**
