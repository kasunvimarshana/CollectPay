# LedgerFlow Collections - Data Collection and Payment Management Application

[![Clean Architecture](https://img.shields.io/badge/architecture-Clean%20Architecture-blue)](./ARCHITECTURE.md)
[![SOLID Principles](https://img.shields.io/badge/principles-SOLID-green)](./ARCHITECTURE.md)
[![Laravel](https://img.shields.io/badge/backend-Laravel%2012-red)](https://laravel.com)
[![React Native](https://img.shields.io/badge/frontend-React%20Native%20Expo-blue)](https://expo.dev)

## 🎯 Project Status: In Active Development

**Current Implementation**: ~40% Complete
- ✅ Backend Domain Layer (100%)
- ✅ Backend Application Layer (40% - Supplier & Product)
- ✅ Backend Infrastructure Layer (40% - Supplier & Product)
- ✅ Backend Presentation Layer (40% - Supplier & Product APIs)
- 📝 Frontend (Structure designed, implementation pending)

## 📚 Quick Links

- [Setup Guide](./SETUP.md) - Installation and configuration instructions
- [Architecture Documentation](./ARCHITECTURE.md) - Detailed architecture and design patterns
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Detailed progress tracking

## 🌟 Overview

### Detailed System Specification – Data Collection and Payment Management Application

**Overview:**
Design and implement a fully functional, production-ready, end-to-end data collection and payment management application using a React Native (Expo) frontend and a Laravel backend. The system must prioritize **data integrity, multi-device support, multi-user access, prevention of data duplication or corruption, and multi-unit management**, providing reliable, accurate, and auditable operations across all modules.

**Backend Requirements:**

- Act as the **single source of truth**, responsible for authoritative validation, persistence, and conflict resolution.
- Maintain a **centralized, secure database** for all entities including users, suppliers, products, collections, and payments.
- Ensure **transactional integrity** and enforce consistent rules for CRUD operations across multiple users and devices.
- Support **versioning, timestamps, and server-side validation** to preserve data integrity and prevent data corruption or duplication.
- Implement **role-based (RBAC) and attribute-based access control (ABAC)** to manage authentication and authorization consistently.

**Frontend Requirements:**

- Provide a responsive, user-friendly interface that supports **multi-device usage** and simultaneous access by multiple users.
- Enable full CRUD functionality for users, suppliers, products, collections, and payments.
- Allow **multi-unit quantity tracking**, time-based and versioned product rates, advance and partial payments, and automated payment calculations based on historical collections and prior transactions.
- Ensure **accurate, auditable financial oversight**, maintaining historical records immutable while applying the latest valid rates for new entries.

**Data Integrity and Multi-User Support:**

- Handle **multi-user, multi-device concurrency** with deterministic conflict detection and resolution.
- Guarantee **no data loss, no duplication, and no corruption** across all operations.
- Provide a robust mechanism for **real-time collaboration**, ensuring multiple users can update data simultaneously without overwriting or losing information.
- Ensure that **multi-unit transactions** (e.g., kilograms, grams, liters) are consistently recorded, calculated, and reported accurately.

**Security Requirements:**

- Encrypt sensitive data **in transit and at rest**.
- Apply **secure data storage and transmission practices** throughout both backend and frontend.
- Use **tamper-resistant payloads** and enforce secure authentication and authorization consistently.

**Architecture and Design Principles:**

- Follow **Clean Architecture**, **SOLID principles**, **DRY**, and **KISS** practices.
- Maintain **clear separation of concerns** across domain logic, application services, infrastructure, state management, UI components, and event orchestration.
- Minimize external dependencies, favoring **native platform capabilities** and relying only on essential, open-source, free, and LTS-supported libraries.
- Ensure **long-term maintainability, scalability, high performance, deterministic behavior, and minimal technical debt**.

**Key Features:**

- Centralized management of **suppliers, products, collections, and payments**.
- **Historical and dynamic rate management**, preserving applied rates for historical entries and automatically using the latest rates for new data.
- Automated, auditable calculations for **advance and partial payments**, ensuring accuracy in total amounts owed.
- **Multi-device and multi-user support** for real-time collaboration and concurrent data entry.
- **Robust financial tracking** suitable for complex workflows, including agricultural collection scenarios (e.g., tea leaves, produce collection).

**Example Use Case – Tea Leaves Collection:**

- Users visit multiple suppliers daily and record quantities collected in **multiple units** (kg, g, etc.).
- Payments may be made intermittently (advance or partial payments).
- At the end of the month, rates per unit are finalized, and total payments are automatically calculated.
- The system ensures **accurate tracking, no duplication or corruption**, and provides **transparent and auditable financial oversight**.

**Technical and Operational Goals:**

- Enable reliable **multi-user collaboration** across multiple devices.
- Guarantee **data integrity** under all operational conditions.
- Support **precise tracking, reporting, and reconciliation** for multi-unit and multi-rate collections.
- Ensure **secure, scalable, and maintainable architecture**, optimized for real-world business workflows.


**Deliverables:**

- Production-ready React Native (Expo) frontend with intuitive UI and UX.
- Laravel backend with robust data management, security, and conflict resolution mechanisms.
- Fully documented architecture, including **domain models, database schema, business logic, and security protocols**.
- End-to-end test coverage for CRUD operations, concurrency handling, and financial calculations.

## 🏗️ Architecture

This project implements **Clean Architecture** with strict adherence to **SOLID principles**, **DRY**, and **KISS**:

### Layer Structure

```
┌──────────────────────────────────────────────────┐
│           Presentation Layer (UI/API)            │
│   Controllers, Views, API Resources, Screens     │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│          Application Layer (Use Cases)           │
│        DTOs, Use Cases, Validators               │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│          Domain Layer (Business Logic)           │
│   Entities, Value Objects, Repository Interfaces │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│       Infrastructure Layer (External)            │
│   Repository Implementations, Database, APIs     │
└──────────────────────────────────────────────────┘
```

**Key Principles:**
- Dependencies flow inward (Dependency Inversion)
- Each layer has single responsibility
- Business logic is framework-independent
- Easy to test, maintain, and extend

📖 See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+
- Composer 2.x
- MySQL/PostgreSQL
- Node.js 18+
- Expo CLI

### Quick Start

```bash
# Backend setup
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend setup (coming soon)
cd frontend
npm install
npx expo start
```

📖 See [SETUP.md](./SETUP.md) for detailed setup instructions.

## 📦 Current Features

### ✅ Implemented
- **Supplier Management**: Complete CRUD operations with validation
- **Product Management**: Complete CRUD operations with validation
- **Clean Architecture**: Domain, Application, Infrastructure, and Presentation layers
- **Repository Pattern**: Interface-based data access
- **Use Cases**: Business logic encapsulation
- **API Endpoints**: RESTful APIs with versioning (v1)
- **Request Validation**: Laravel Form Requests
- **API Resources**: Response transformation
- **Dependency Injection**: Laravel service container bindings

### 🚧 In Progress
- **Collection Management**: CRUD operations for collections
- **Payment Management**: Payment tracking and calculations
- **Authentication**: Laravel Sanctum integration
- **Authorization**: RBAC/ABAC implementation
- **Frontend Application**: React Native/Expo implementation

### 📋 Planned
- **Offline Support**: Local SQLite storage with sync
- **Conflict Resolution**: Multi-device synchronization
- **Audit Logging**: Immutable audit trail
- **Rate Management**: Time-based and versioned rates
- **Payment Calculations**: Automated calculations based on collections
- **Reporting**: Financial reports and summaries

## 🔧 Technology Stack

### Backend
- **Framework**: Laravel 12
- **Language**: PHP 8.2+
- **Database**: MySQL/PostgreSQL
- **Architecture**: Clean Architecture
- **Patterns**: Repository, Use Case, DTO
- **Testing**: PHPUnit

### Frontend (Planned)
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Local Storage**: SQLite
- **Navigation**: React Navigation
- **Forms**: React Hook Form + Yup

## 📁 Project Structure

```
ledgerflow-collections/
├── backend/
│   ├── app/
│   │   ├── Domain/           # Business logic (framework-independent)
│   │   ├── Application/      # Use cases, DTOs
│   │   ├── Infrastructure/   # Repository implementations
│   │   ├── Http/            # Controllers, Resources, Requests
│   │   └── Models/          # Eloquent models
│   ├── database/
│   │   └── migrations/      # Database schema
│   ├── routes/
│   │   └── api.php         # API routes
│   └── tests/              # Backend tests
│
├── frontend/               # React Native app (to be implemented)
│   └── src/
│       ├── domain/
│       ├── data/
│       ├── presentation/
│       └── infrastructure/
│
├── ARCHITECTURE.md         # Architecture documentation
├── SETUP.md               # Setup instructions
├── IMPLEMENTATION_STATUS.md # Progress tracking
└── README.md              # This file
```

## 🧪 Testing

```bash
# Backend tests
cd backend
php artisan test

# Frontend tests (coming soon)
cd frontend
npm test
```

## 📖 API Documentation

### Available Endpoints (v1)

#### Suppliers
- `GET /api/v1/suppliers` - List suppliers
- `POST /api/v1/suppliers` - Create supplier
- `GET /api/v1/suppliers/{id}` - Get supplier
- `PUT /api/v1/suppliers/{id}` - Update supplier
- `DELETE /api/v1/suppliers/{id}` - Delete supplier

#### Products
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/{id}` - Get product
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

**Note**: Authentication required for all endpoints (Laravel Sanctum - in progress)

## 🔒 Security

- **Authentication**: Laravel Sanctum (planned)
- **Authorization**: RBAC/ABAC (planned)
- **Validation**: Input validation at multiple layers
- **SQL Injection**: Protected via Eloquent ORM
- **XSS**: Output escaping
- **CSRF**: Laravel CSRF protection
- **Rate Limiting**: API rate limiting (planned)
- **Audit Logging**: Immutable audit trail (planned)

## 🤝 Contributing

This project follows Clean Architecture and SOLID principles. When contributing:

1. Keep domain logic framework-independent
2. Follow the dependency rule (dependencies point inward)
3. Write tests for new features
4. Document significant changes
5. Follow PSR-12 coding standards (PHP)
6. Use TypeScript strict mode (Frontend)

## 📝 License

[Your License Here]

## 👥 Team

Built by Senior Full-Stack Engineers and Principal Systems Architects following industry best practices.

---

**Last Updated**: December 27, 2025  
**Status**: Active Development  
**Version**: 0.4.0 (Backend Foundation)
