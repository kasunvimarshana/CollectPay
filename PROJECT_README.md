# Ledgerly - Data Collection and Payment Management System

A production-ready, end-to-end data collection and payment management application built with React Native (Expo) frontend and Laravel backend.

## 🎯 Project Overview

Ledgerly provides centralized, authoritative management of users, suppliers, products, collections, and payments with a focus on:

- **Data Integrity**: Multi-user and multi-device support without data duplication or corruption
- **Multi-unit Tracking**: Support for kg, g, liters, and other measurement units
- **Versioned Rates**: Historical rate preservation with automated calculations
- **Payment Management**: Advance, partial, and final payment tracking with automated calculations
- **Security**: End-to-end encryption, RBAC/ABAC authorization, audit trails
- **Clean Architecture**: Modular, scalable, maintainable design following SOLID principles

## 📁 Repository Structure

```
Ledgerly/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Domain/         # Domain layer (entities, repositories, services)
│   │   ├── Application/    # Application layer (use cases, DTOs)
│   │   └── Infrastructure/ # Infrastructure layer (persistence, HTTP, security)
│   ├── database/
│   │   └── migrations/     # Database schema migrations
│   └── README.md
│
├── frontend/               # React Native (Expo) Frontend
│   ├── src/
│   │   ├── domain/        # Domain layer (entities, repositories)
│   │   ├── application/   # Application layer (use cases, services)
│   │   ├── presentation/  # Presentation layer (screens, components, navigation)
│   │   └── infrastructure/# Infrastructure layer (API, storage, auth)
│   └── README.md
│
└── docs/                  # Documentation
    ├── README.md
    ├── SRS.md            # Software Requirements Specification
    ├── PRD.md            # Product Requirements Document
    ├── ES.md             # Executive Summary
    └── ESS.md            # Extended System Specification
```

## 🏗️ Architecture

### Clean Architecture Principles

The system follows **Clean Architecture** with clear separation of concerns:

1. **Domain Layer** (Core Business Logic)
   - Entities: Pure domain objects with business rules
   - Repository Interfaces: Data access contracts
   - Domain Services: Complex business logic

2. **Application Layer** (Application-Specific Business Rules)
   - Use Cases: Application workflows
   - DTOs: Data transfer objects
   - Application Services: Orchestration

3. **Infrastructure Layer** (External Interfaces)
   - Persistence: Database implementation
   - HTTP: API controllers and routes
   - Security: Authentication and authorization

4. **Presentation Layer** (UI - Frontend Only)
   - Screens: User interface screens
   - Components: Reusable UI components
   - Navigation: App navigation structure

### Key Design Principles

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY**: Don't Repeat Yourself - code reusability
- **KISS**: Keep It Simple, Stupid - straightforward implementations
- **Dependency Inversion**: Domain depends on nothing, infrastructure depends on domain

## 🚀 Key Features

### User Management
- CRUD operations for users
- Role-Based Access Control (RBAC): admin, manager, collector
- Attribute-Based Access Control (ABAC): fine-grained permissions
- Secure authentication with JWT tokens

### Supplier Management
- Comprehensive supplier profiles
- Contact information management
- Multi-unit quantity tracking
- Active/inactive status

### Product Management
- Product catalog with multi-unit support
- Time-based and versioned rates
- Historical rate preservation
- Current and historical rate queries

### Collection Management
- Daily collection recording
- Multi-unit quantity support (kg, g, l, ml, unit, dozen)
- Automatic rate application from history
- Collector tracking and audit trail

### Payment Management
- Advance payments
- Partial payments
- Final settlement payments
- Automated payment calculations
- Balance tracking per supplier

### Reporting & Analytics
- Collection summaries by supplier/product/date
- Payment breakdowns
- Outstanding balances
- Historical rate applications

## 🔒 Security Features

### Backend Security
- Laravel Sanctum for API authentication
- Encrypted sensitive database fields
- SQL injection prevention via Eloquent ORM
- CSRF protection
- Rate limiting
- Comprehensive audit logging

### Frontend Security
- Secure token storage using expo-secure-store
- HTTPS-only communication
- No sensitive data in logs
- Automatic token refresh
- Session management

### Data Protection
- Encryption at rest and in transit
- Transactional database operations
- Optimistic locking for concurrent updates
- Version tracking on critical tables

## 📊 Database Schema

### Core Tables
- `users` - User accounts with roles and permissions
- `suppliers` - Supplier profiles
- `products` - Product catalog
- `product_rates` - Historical product rates with versioning
- `collections` - Collection records with multi-unit support
- `payments` - Payment transactions
- `audit_logs` - Comprehensive audit trail

### Key Features
- Foreign key constraints for referential integrity
- Optimistic locking (version column) on transactional tables
- Soft deletes for data preservation
- Comprehensive indexing for performance
- Timestamps for audit trails

## 🛠️ Technology Stack

### Backend
- **Framework**: Laravel 11.x
- **Language**: PHP 8.1+
- **Database**: MySQL 8.0+ / PostgreSQL 13+
- **Authentication**: Laravel Sanctum
- **Testing**: PHPUnit

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **HTTP Client**: Axios
- **Storage**: Expo Secure Store
- **Testing**: Jest + React Native Testing Library

## 📖 Documentation

Comprehensive documentation is provided in the following files:

- **README.md** (this file): Project overview and setup
- **SRS.md**: Software Requirements Specification (IEEE format)
- **PRD.md**: Product Requirements Document
- **ES.md**: Executive Summary
- **ESS.md**: Extended System Specification
- **backend/README.md**: Backend-specific documentation
- **frontend/README.md**: Frontend-specific documentation

## 🎯 Use Case Example

### Tea Leaves Collection Workflow

1. **Daily Collection**
   - Collector visits multiple suppliers
   - Records quantities in kg/g for each supplier
   - System automatically applies current product rate
   - Collection data synced to central database

2. **Payment Tracking**
   - Advance payments recorded when given
   - Partial payments tracked throughout the month
   - System calculates outstanding balance

3. **Month-End Settlement**
   - Final rate confirmed/adjusted if needed
   - System calculates total amount owed
   - Accounts for all advance and partial payments
   - Final payment recorded

4. **Multi-User Collaboration**
   - Multiple collectors work simultaneously
   - No data conflicts or duplication
   - All transactions auditable and traceable

## 📋 Getting Started

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

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

## 📝 Contributing

This project follows strict coding standards:

1. Follow Clean Architecture principles
2. Adhere to SOLID principles
3. Write meaningful tests
4. Document complex logic
5. Use meaningful variable names
6. Keep functions small and focused

## 📄 License

MIT License

## 👥 Authors

- **Kasun Vimarshana** - Initial work and architecture

## 🙏 Acknowledgments

- Clean Architecture by Robert C. Martin
- Domain-Driven Design principles
- Laravel and React Native communities
