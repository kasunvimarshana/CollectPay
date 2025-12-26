# TrackVault - Data Collection and Payment Management System

> A production-ready, end-to-end data collection and payment management application with React Native (Expo) frontend and Laravel backend.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

TrackVault is designed for businesses requiring precise tracking of collections, payments, and product rates, with a focus on **data integrity**, **multi-user support**, and **financial accuracy**. Perfect for agricultural collection workflows (tea leaves, produce), supply chain management, and distributed collection/payment operations.

### Key Features

#### Core Features
- ✅ **Multi-User & Multi-Device** - Concurrent operations without conflicts
- ✅ **Data Integrity** - Version-based concurrency control prevents data corruption
- ✅ **Multi-Unit Support** - Track quantities in kg, g, liters, custom units
- ✅ **Versioned Rates** - Historical rate preservation with automatic application
- ✅ **Automated Calculations** - Real-time payment calculations and balance tracking
- ✅ **Secure** - End-to-end encryption, token-based auth, RBAC/ABAC
- ✅ **Clean Architecture** - SOLID, DRY, KISS principles

#### 🆕 Enhanced Features (v2.3.0)
- ✅ **Date Range Filters** - Filter collections and payments by date with quick presets
- ✅ **Infinite Scroll Pagination** - Efficient data loading with configurable page sizes
- ✅ **Offline Support** - Work without internet, automatic sync when connection restored
- ✅ **Advanced Picker Component** - Search, loading states, and pagination support
- ✅ **Print Functionality** - Print receipts, reports, and balance statements with professional formatting

## 🚀 Quick Start

See **[IMPLEMENTATION.md](IMPLEMENTATION.md)** for complete setup instructions.

### Backend (Laravel 11)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend (React Native + Expo)

```bash
cd frontend
npm install
npm start
```

## 📱 Demo Accounts (Development Only)

| Role      | Email                        | Password   |
|-----------|------------------------------|------------|
| Admin     | admin@trackvault.com         | password   |
| Collector | collector@trackvault.com     | password   |
| Finance   | finance@trackvault.com       | password   |

## 📖 Documentation

Complete documentation for TrackVault is now organized in the `/docs` directory.

**📌 [DOCUMENTATION.md](DOCUMENTATION.md) - Complete Documentation Guide with Quick Links**

### Quick Start
- **[README.md](README.md)** - This file: Project overview and quick start
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - 🚀 Quick reference guide for developers
- **[docs/INDEX.md](docs/INDEX.md)** - 📚 Complete documentation index

### Essential Documentation
- **[Implementation Guide](docs/implementation/IMPLEMENTATION.md)** - Complete setup and implementation
- **[API Reference](docs/api/API.md)** - Complete REST API documentation
- **[Swagger Guide](docs/api/SWAGGER.md)** - Interactive API documentation
- **Interactive Swagger UI** - `http://localhost:8000/api/documentation`

### Documentation Categories

All documentation is organized in `/docs` with the following structure:

- **[Requirements](docs/requirements/)** - PRD, SRS, Executive Summary
- **[API](docs/api/)** - API reference and Swagger documentation
- **[Implementation](docs/implementation/)** - Setup guides and implementation details
- **[Frontend](docs/frontend/)** - Frontend architecture, implementation, and enhancements
- **[Components](docs/components/)** - Component documentation (e.g., Picker Component)
- **[Verification](docs/verification/)** - Verification reports and test results
- **[Deployment](docs/deployment/)** - Production deployment guides and checklists
- **[Security](docs/security/)** - Security architecture and best practices
- **[Archive](docs/archive/)** - Older versions and superseded documents

### Status Reports
- **[TASK_COMPLETE.md](TASK_COMPLETE.md)** - Task completion report
- **[FINAL_SUMMARY.md](FINAL_SUMMARY.md)** - Final implementation summary
- **[SUMMARY.md](SUMMARY.md)** - Complete project summary

### Component-Specific Documentation
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[frontend/README.md](frontend/README.md)** - Frontend app documentation

## 🏗️ Architecture

```
TrackVault/
├── backend/           # Laravel 11 API
│   ├── app/Models/    # Eloquent models with business logic
│   ├── app/Http/Controllers/API/  # RESTful controllers
│   └── database/migrations/       # Database schema
├── frontend/          # React Native + Expo
│   ├── src/api/       # API client & services
│   ├── src/contexts/  # Global state management
│   ├── src/navigation/# App navigation
│   └── src/screens/   # UI screens
└── docs/             # Project documentation
```

## 🔧 Core Functionality

### Suppliers
- Create and manage supplier profiles
- Track contact information
- Real-time balance calculation

### Products
- Multi-unit product support
- Versioned rate management
- Historical rate tracking

### Collections
- Daily collection recording
- Automatic rate application
- Multi-unit quantity tracking
- Calculated amount per collection

### Payments
- Advance/partial/full payments
- Automated balance calculation
- Payment history tracking
- Supplier reconciliation

## 🛡️ Security

- **Authentication**: Laravel Sanctum token-based
- **Authorization**: Role-based (RBAC) & attribute-based (ABAC)
- **Encryption**: Data at rest and in transit (HTTPS)
- **Storage**: Expo SecureStore for sensitive data
- **Validation**: Server-side input validation
- **Concurrency**: Version control prevents race conditions
- **Audit**: Soft deletes and timestamp tracking

## 🧪 Testing

Backend:
```bash
cd backend && php artisan test
```

Frontend:
```bash
cd frontend && npm test
```

## 📦 Technology Stack

| Component | Technology |
|-----------|------------|
| Backend Framework | Laravel 11 |
| Frontend Framework | React Native + Expo |
| Language | PHP 8.2+ / TypeScript |
| Database | SQLite, MySQL, PostgreSQL |
| Authentication | Laravel Sanctum |
| Navigation | React Navigation |
| State Management | React Context API |
| HTTP Client | Axios |

## 🎨 Design Principles

- **Clean Architecture** - Clear separation of concerns
- **SOLID** - Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple
- **Modular** - Easy to extend and maintain
- **Testable** - Designed for comprehensive testing

## ✨ Enhanced Features (v2.3.0)

### 📅 Date Range Filters
Filter collections and payments by specific date ranges with convenient presets:
- **Quick Presets**: Today, Last 7 Days, Last 30 Days, Last 90 Days
- **Custom Range**: Select any start and end date
- **Smart Validation**: End date must be after start date
- **Clear Filter**: Easily reset date filters

**Screens Enhanced**: Collections, Payments

### 📊 Infinite Scroll Pagination
Efficiently handle large datasets with smooth scrolling:
- **Infinite Scroll**: Automatic loading when scrolling near the end
- **Page Size Options**: Choose between 25, 50, or 100 items per page
- **Loading Indicators**: Visual feedback during data loading
- **Smart Loading**: Prevents duplicate requests

**Implementation**: Pattern demonstrated in Suppliers screen

### 🔌 Offline Support
Work seamlessly without internet connectivity:
- **Offline Mode Indicator**: Visual feedback when disconnected (red bar)
- **Operation Queuing**: Create, update, and delete operations queued automatically
- **Automatic Sync**: Changes sync when connection is restored
- **Retry Logic**: Failed operations retry up to 3 times
- **Sync Progress**: Real-time feedback during synchronization

**Features**:
- Local data caching with AsyncStorage
- Background sync queue management
- Network status monitoring
- Visual indicators across all screens

### 🎯 Advanced Picker Component
Fully-featured picker with enterprise-grade capabilities:
- **Search Functionality**: Local and remote search support
- **Loading States**: Initial loading and "load more" indicators
- **Pagination**: Infinite scroll with automatic loading
- **Empty States**: Customizable empty and error states
- **Type Safety**: Full TypeScript support with exported types
- **Backward Compatible**: Works with all existing implementations

**Features**:
- Client-side and server-side search
- Async data loading with progress indicators
- Configurable page sizes and load more thresholds
- Smart filtering and deduplication
- Error handling and validation support

**Usage**: Collections, Payments, Product Rates, and custom forms

See **[Picker Component Documentation](docs/components/PICKER_COMPONENT.md)** for complete documentation and usage examples.

For detailed implementation information, see the [Implementation Guide](docs/implementation/IMPLEMENTATION_FINAL_SUMMARY.md) and [Verification Reports](docs/verification/).

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Author

Kasun Vimarshana

---

**For detailed technical documentation, see [Implementation Guide](docs/implementation/IMPLEMENTATION.md) and [Documentation Index](docs/INDEX.md)**

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
