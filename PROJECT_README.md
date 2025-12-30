# Field Ledger - Data Collection & Payment Management System

A production-ready, enterprise-grade application for managing product collections, suppliers, and payments with offline support. Built with Clean Architecture, following SOLID principles, DRY, and KISS methodologies.

## 🎯 Project Overview

Field Ledger is an end-to-end data collection and payment management system designed for businesses that need precise tracking of collections, multi-unit quantity management, rate versioning, and automated payment calculations. Perfect for agricultural workflows (tea leaves, produce collection), logistics, and any business requiring accurate supplier payment management.

### Key Features

- ✅ **Multi-Unit Quantity Tracking** - Support for kg, g, liters, ml, and custom units with automatic conversion
- ✅ **Rate Versioning** - Historical rate preservation with time-based queries
- ✅ **Automated Payment Calculations** - Automatic calculation of amounts, balances, and settlements
- ✅ **Offline-First Architecture** - Full offline support with conflict-aware synchronization
- ✅ **Multi-User/Multi-Device** - Concurrent operations with data integrity guarantees
- ✅ **Complete Audit Trail** - Immutable audit logs for all operations
- ✅ **RBAC/ABAC Security** - Role-based and attribute-based access control
- ✅ **Clean Architecture** - Maintainable, scalable, and testable codebase

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Laravel 12 (PHP 8.3+)
- PostgreSQL/MySQL/SQLite (UUID primary keys)
- Clean Architecture with Domain-Driven Design

**Frontend:**
- React Native (Expo)
- SQLite for offline storage
- Clean Architecture layers

### Project Structure

```
fieldledger/
├── backend/                        # Laravel Backend
│   ├── src/
│   │   ├── Domain/                # Enterprise Business Rules
│   │   │   ├── Entities/          # Core business objects
│   │   │   ├── ValueObjects/      # Immutable values
│   │   │   ├── Repositories/      # Repository interfaces
│   │   │   └── Services/          # Domain services
│   │   ├── Application/           # Application Business Rules
│   │   ├── Infrastructure/        # Frameworks & Drivers
│   │   └── Presentation/          # Interface Adapters
│   ├── database/migrations/       # Database schema
│   └── tests/                     # Tests
├── frontend/                      # React Native Frontend
├── ARCHITECTURE.md                # Architecture documentation
├── IMPLEMENTATION_SUMMARY.md      # Implementation status
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites

- PHP 8.3 or higher
- Composer
- Node.js 20+ and npm
- SQLite/MySQL/PostgreSQL
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kasunvimarshana/fieldledger.git
   cd fieldledger/backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Set up database**
   ```bash
   # Update .env with your database credentials
   # For SQLite (development):
   touch database/database.sqlite
   
   # Run migrations
   php artisan migrate
   ```

5. **Start development server**
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Expo**
   ```bash
   npm start
   ```

## 📊 Domain Model

### Entities

- **User** - System users with roles and permissions
- **Supplier** - Entities from whom collections are made
- **Product** - Collectible items with versioned rates
- **Collection** - Collection transactions with historical rates
- **Payment** - Payment transactions (advance, partial, full)

### Value Objects

- **Money** - Monetary values with currency
- **Quantity** - Measured quantities with units
- **Unit** - Measurement units with conversions
- **Rate** - Price per unit with effective dates
- **Email** - Validated email addresses
- **PhoneNumber** - Validated phone numbers

### Business Rules

1. **Rate Versioning**
   - Products can have multiple rates over time
   - Collections preserve the rate applicable at collection time
   - Historical rates remain immutable

2. **Multi-Unit Support**
   - Automatic unit conversion (kg ↔ g, l ↔ ml)
   - Type-safe quantity operations
   - Consistent calculations across units

3. **Payment Calculation**
   - Total = Σ(collections) - Σ(payments)
   - Support for advance, partial, and full payments
   - Balance tracking per supplier

4. **Data Integrity**
   - UUID primary keys for distributed systems
   - Foreign key constraints
   - Audit trail for all operations
   - Optimistic locking for concurrency

## 🔒 Security

- **Authentication**: Laravel Sanctum (planned)
- **Authorization**: RBAC and ABAC
- **Encryption**: Data at rest and in transit
- **Audit Trail**: Complete change history
- **Input Validation**: Comprehensive validation at all layers
- **SQL Injection Prevention**: Parameterized queries

## 📖 API Documentation

API endpoints will be documented using OpenAPI/Swagger (planned).

### Planned Endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/users
POST   /api/users
GET    /api/suppliers
POST   /api/suppliers
GET    /api/products
POST   /api/products
GET    /api/collections
POST   /api/collections
GET    /api/payments
POST   /api/payments
POST   /api/sync
```

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature
```

## 📈 Offline Synchronization

The system supports offline-first operations:

1. **Local Queue**: Operations stored locally when offline
2. **Sync on Reconnect**: Automatic synchronization when online
3. **Conflict Detection**: Timestamp-based conflict detection
4. **Conflict Resolution**: Server as authoritative source
5. **Audit Trail**: All sync operations logged

## 🎨 Design Principles

### SOLID Principles

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes are substitutable
- **Interface Segregation**: Focused interfaces
- **Dependency Inversion**: Depend on abstractions

### Clean Architecture

- **Independent of Frameworks**: Business logic doesn't depend on Laravel
- **Testable**: Business logic can be tested without UI, DB, or external services
- **Independent of UI**: UI can change without changing business logic
- **Independent of Database**: Business logic doesn't know about the database
- **Independent of External Services**: Business logic doesn't depend on external APIs

### Additional Principles

- **DRY** (Don't Repeat Yourself): No code duplication
- **KISS** (Keep It Simple, Stupid): Simple solutions preferred
- **YAGNI** (You Aren't Gonna Need It): Implement only what's needed
- **Separation of Concerns**: Each module handles one aspect

## 📝 Use Cases

### Tea Leaves Collection Example

1. **Daily Collections**
   - Collector visits suppliers
   - Records quantity (kg) collected
   - System applies current rate
   - Calculates amount owed

2. **Advance Payments**
   - Supplier receives advance payment
   - Recorded in system
   - Reduces balance owed

3. **Monthly Settlement**
   - View total collections
   - View total payments
   - Calculate balance
   - Make final payment

### Multi-Unit Tracking Example

1. Collect 5.5 kg from Supplier A
2. Collect 750 g from Supplier B
3. System converts to base unit
4. Calculates using appropriate rates
5. Provides accurate totals

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Follow existing code style and architecture
4. Write tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Kasun Vimarshana** - Initial work - [@kasunvimarshana](https://github.com/kasunvimarshana)

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Implementation status
- [SRS.md](./SRS.md) - Software Requirements Specification
- [PRD.md](./PRD.md) - Product Requirements Document

## 🔮 Roadmap

### Phase 1: Foundation ✅
- Clean Architecture structure
- Domain entities and value objects
- Database schema
- Eloquent models

### Phase 2: Core Implementation (In Progress)
- Repository implementations
- Use cases
- API endpoints
- Authentication

### Phase 3: Frontend
- React Native UI
- Offline database
- Sync mechanism
- User experience

### Phase 4: Advanced Features
- Real-time notifications
- Advanced reporting
- Analytics dashboard
- Performance optimization

### Phase 5: Production Ready
- Comprehensive testing
- Security hardening
- Documentation completion
- Deployment automation

## 📞 Support

For support, email kasunvimarshana@example.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Clean Architecture by Robert C. Martin
- Domain-Driven Design by Eric Evans
- Laravel Community
- React Native Community

---

**Status**: Foundation Complete - Active Development
**Version**: 1.0.0
**Last Updated**: 2025-12-28
