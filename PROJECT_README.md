# LedgerFlow Collections

**Production-Ready Data Collection and Payment Management Application**

A comprehensive, enterprise-grade application for managing collections, payments, suppliers, products, and rates with support for multi-unit tracking, historical rate versioning, and offline-first operations.

## 🎯 Overview

LedgerFlow Collections is a full-stack application built with:
- **Backend**: Laravel (PHP 8.2+) following Clean Architecture principles
- **Frontend**: React Native (Expo) for cross-platform mobile support
- **Database**: SQLite/MySQL/PostgreSQL with comprehensive migrations
- **Architecture**: Clean Architecture, SOLID, DRY, KISS principles

## 🌟 Key Features

### Core Functionality
- ✅ **User Management** - Role-based access control (RBAC) and attribute-based access control (ABAC)
- ✅ **Supplier Management** - Detailed supplier profiles with contact information
- ✅ **Product Management** - Product catalog with multi-unit support
- ✅ **Rate Versioning** - Historical rate preservation with time-based validity
- ✅ **Collection Tracking** - Multi-unit quantity tracking with automated calculations
- ✅ **Payment Management** - Advance, partial, and full payment support
- ✅ **Audit Trail** - Immutable audit logs for all operations

### Technical Features
- 🔒 **Security**: End-to-end encryption, secure authentication, comprehensive authorization
- 📊 **Multi-Unit Support**: kg, g, mg, t, lb, oz, l, ml, and countable units with automatic conversions
- 🔄 **Versioning**: Optimistic locking with version numbers for conflict resolution
- 💰 **Financial Accuracy**: Precise decimal calculations for monetary values
- 🌐 **Multi-User**: Concurrent operations with data integrity safeguards
- 📱 **Offline-First**: Local data persistence with synchronization support
- 📝 **Comprehensive Logging**: Audit trail for compliance and debugging

## 📁 Project Structure

```
ledgerflow-collections/
├── backend/                    # Laravel Backend API
│   ├── app/
│   │   ├── Domain/            # Domain Layer (Business Logic)
│   │   │   ├── Entities/      # Domain Entities
│   │   │   ├── ValueObjects/  # Value Objects (Money, Quantity)
│   │   │   ├── Repositories/  # Repository Interfaces
│   │   │   └── Services/      # Domain Services
│   │   ├── Application/       # Application Layer
│   │   │   ├── UseCases/      # Use Cases
│   │   │   ├── DTOs/          # Data Transfer Objects
│   │   │   └── Services/      # Application Services
│   │   ├── Infrastructure/    # Infrastructure Layer
│   │   │   ├── Persistence/   # Repository Implementations
│   │   │   ├── Security/      # Auth, Encryption
│   │   │   └── Logging/       # Logging Services
│   │   ├── Http/              # Presentation Layer
│   │   │   ├── Controllers/   # API Controllers
│   │   │   ├── Middleware/    # HTTP Middleware
│   │   │   └── Resources/     # API Resources
│   │   └── Models/            # Eloquent Models
│   ├── database/
│   │   ├── migrations/        # Database Migrations
│   │   └── seeders/           # Database Seeders
│   └── tests/                 # Backend Tests
│
├── frontend/                   # React Native (Expo) Frontend
│   ├── src/
│   │   ├── domain/            # Domain Layer
│   │   ├── data/              # Data Layer (Repositories, Local DB)
│   │   ├── presentation/      # Presentation Layer (UI Components)
│   │   └── infrastructure/    # Infrastructure (API, Storage)
│   └── assets/                # Static Assets
│
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
├── SRS.md                     # Software Requirements Specification
├── PRD.md                     # Product Requirements Document
└── ESS.md                     # Executive Summary

```

## 🚀 Quick Start

### Prerequisites

- **Backend**:
  - PHP 8.2 or higher
  - Composer
  - SQLite/MySQL/PostgreSQL

- **Frontend**:
  - Node.js 18+ and npm
  - Expo CLI
  - iOS Simulator or Android Emulator (optional)

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database
touch database/database.sqlite

# Run migrations
php artisan migrate

# Start development server
php artisan serve
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS
npm run web      # Web browser
```

## 🏗️ Architecture

### Clean Architecture Layers

1. **Domain Layer** (Innermost)
   - Pure business logic
   - No framework dependencies
   - Entities, Value Objects, Repository Interfaces
   - Domain Services for complex business rules

2. **Application Layer**
   - Use Cases implementing application-specific business rules
   - Orchestrates domain logic
   - DTOs for data transfer
   - Application Services

3. **Infrastructure Layer**
   - Framework-specific implementations
   - Database access (Eloquent ORM)
   - External services integration
   - File system, caching, etc.

4. **Presentation Layer** (Outermost)
   - HTTP Controllers
   - API Routes
   - Request/Response transformations
   - UI Components (Frontend)

### Design Principles

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY**: Don't Repeat Yourself - reusable components and services
- **KISS**: Keep It Simple, Stupid - minimal complexity
- **Clean Code**: Readable, maintainable, testable

## 📊 Database Schema

### Core Tables

- **users** - User accounts with roles and permissions
- **suppliers** - Supplier profiles with contact details
- **products** - Product catalog with units
- **product_rates** - Versioned product rates with time-based validity
- **collections** - Product collections with multi-unit quantities
- **payments** - Payment records (advance/partial/full)
- **audit_logs** - Immutable audit trail

### Key Features

- Foreign key constraints for referential integrity
- Indexes for optimal query performance
- Version numbers for optimistic locking
- Timestamps for audit trails
- Soft deletes where appropriate

## 🔐 Security

- **Authentication**: JWT/Laravel Sanctum
- **Authorization**: RBAC and ABAC
- **Encryption**: Data at rest and in transit
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Eloquent ORM with prepared statements
- **XSS Protection**: Laravel's built-in escaping
- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: API endpoint throttling

## 🧪 Testing

```bash
# Backend tests
cd backend
php artisan test
php artisan test --coverage

# Frontend tests
cd frontend
npm test
npm run test:coverage
```

## 📖 Documentation

- [Software Requirements Specification (SRS)](./SRS.md)
- [Product Requirements Document (PRD)](./PRD.md)
- [Executive Summary (ES)](./ES.md)
- [Backend Documentation](./backend/BACKEND_README.md)
- API Documentation: Available at `/api/documentation` when backend is running

## 🛠️ Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes** following the architecture and coding standards

3. **Run Tests** to ensure nothing breaks
   ```bash
   cd backend && php artisan test
   cd frontend && npm test
   ```

4. **Commit Changes** with descriptive messages
   ```bash
   git commit -m "feat: add feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🚢 Deployment

### Backend Deployment

1. Set environment to production
2. Configure production database
3. Run migrations
4. Set up SSL/TLS
5. Configure rate limiting
6. Enable caching
7. Set up monitoring

### Frontend Deployment

1. Build for production
   ```bash
   npm run build
   ```

2. Deploy to Expo/App Stores
   ```bash
   eas build --platform all
   ```

## 📝 Use Case Example

**Tea Leaf Collection Workflow:**

1. User logs into mobile app
2. Visits supplier and records collection:
   - Supplier: John's Tea Estate
   - Product: Premium Tea Leaves
   - Quantity: 25.5 kg
   - Date: Today
3. System automatically:
   - Retrieves active rate for product
   - Calculates total amount (25.5 kg × $5.00 = $127.50)
   - Saves collection with version tracking
4. User can make advance/partial payment
5. At month-end, system calculates outstanding balance
6. Full audit trail maintained for compliance

## 🤝 Contributing

This is a production application following strict architectural principles. All contributions must:

1. Follow Clean Architecture principles
2. Adhere to SOLID, DRY, KISS
3. Include comprehensive tests
4. Maintain existing code quality
5. Include documentation updates

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For issues, questions, or support, please contact the development team.

## 🎓 Learning Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Laravel Documentation](https://laravel.com/docs)
- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)

---

**Built with ❤️ following industry best practices for long-term maintainability**
