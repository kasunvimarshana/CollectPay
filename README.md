# FieldPay Ledger - Data Collection and Payment Management System

A production-ready, end-to-end data collection and payment management application implementing **Clean Architecture** principles with a Laravel backend and React Native (Expo) frontend.

## 🎯 Project Overview

FieldPay Ledger is designed for businesses requiring precise tracking of collections, payments, and product rates, particularly suitable for agricultural workflows such as tea leaf collection, produce collection, and supply chain management.

### Key Features

✅ **Multi-User & Multi-Device Support**
- Concurrent operations across devices
- Data integrity guarantees
- No duplication or corruption

✅ **Multi-Unit Quantity Tracking**
- Weight: kg, g, mg, lb, oz
- Volume: l, ml, gal
- Count: unit, piece, dozen
- Automatic unit conversions

✅ **Versioned Rate Management**
- Time-based rates with effective dates
- Historical rate preservation
- Automatic rate expiration

✅ **Automated Payment Calculations**
- Advance payments
- Partial payments
- Automated balance calculations
- Complete audit trail

✅ **Clean Architecture**
- SOLID principles throughout
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Framework-independent business logic

✅ **Offline-First Mobile App**
- Local data persistence
- Automatic synchronization
- Works without internet connection
- Conflict resolution

## 📁 Project Structure

```
fieldpay-ledger/
├── backend/                    # Laravel Backend (Clean Architecture)
│   ├── src/
│   │   ├── Domain/            # Business Logic (Framework-independent)
│   │   │   ├── Entities/      # Core business entities
│   │   │   ├── ValueObjects/  # Immutable value objects
│   │   │   ├── Repositories/  # Repository interfaces
│   │   │   ├── Services/      # Domain services
│   │   │   └── Events/        # Domain events
│   │   ├── Application/       # Use Cases & Business Workflows
│   │   │   ├── UseCases/     # Application-specific logic
│   │   │   ├── DTOs/         # Data Transfer Objects
│   │   │   └── Contracts/    # Application interfaces
│   │   └── Infrastructure/    # Framework & External Services
│   │       ├── Persistence/   # Database implementations
│   │       ├── Security/      # Security implementations
│   │       └── Logging/       # Logging implementations
│   ├── app/                   # Laravel Presentation Layer
│   │   └── Http/             # Controllers, Middleware, Resources
│   ├── database/
│   │   └── migrations/       # Database schema
│   ├── routes/
│   │   └── api.php          # API routes
│   ├── ARCHITECTURE.md       # Architecture documentation
│   └── IMPLEMENTATION.md     # Implementation guide
│
├── frontend/                  # React Native (Expo) Frontend ✨ NEW
│   ├── src/
│   │   ├── domain/           # Business Logic (Framework-independent)
│   │   │   ├── entities/     # Domain entities
│   │   │   ├── valueObjects/ # Immutable value objects
│   │   │   └── repositories/ # Repository interfaces
│   │   ├── application/      # Use Cases & Business Workflows
│   │   │   ├── useCases/    # Application logic
│   │   │   └── dtos/        # Data Transfer Objects
│   │   ├── infrastructure/   # External Services & Data
│   │   │   ├── api/         # API client
│   │   │   ├── storage/     # Local storage
│   │   │   └── repositories/# Repository implementations
│   │   └── presentation/     # UI Layer
│   │       ├── screens/     # Screen components
│   │       ├── components/  # Reusable UI components
│   │       ├── navigation/  # Navigation setup
│   │       └── state/      # State management
│   ├── assets/              # Images, fonts
│   ├── ARCHITECTURE.md      # Architecture documentation
│   └── README.md           # Frontend documentation
│
├── docs/                      # Project Documentation
│   ├── SRS.md                # Software Requirements Specification
│   ├── PRD.md                # Product Requirements Document
│   └── ES.md                 # Executive Summary
│
└── README.md                 # This file
```

## 🚀 Backend Implementation (Laravel)

### Technology Stack

- **Framework**: Laravel 10 (LTS)
- **PHP**: 8.1+
- **Architecture**: Clean Architecture
- **Database**: MySQL/PostgreSQL
- **API**: RESTful JSON API

### Core Components

#### Domain Layer (Business Logic)
```php
// Entities: User, Supplier, Product, Rate, Collection, Payment
// Value Objects: Money, Quantity, Unit, Email, UserId
// Services: PaymentCalculationService
// Repository Interfaces: Dependency Inversion Principle
```

#### Application Layer (Use Cases)
```php
// CreateSupplierUseCase
// CreateProductUseCase
// CreateRateUseCase
// (More to come: Collection, Payment management)
```

#### Infrastructure Layer
```php
// Eloquent Repository Implementations
// Database Migrations
// Security Services
// Audit Logging
```

#### Presentation Layer (API)
```php
// RESTful Controllers
// Request Validation
// JSON Responses
// API Routes
```

### API Endpoints

```
# Users
GET    /api/v1/users              - List users
POST   /api/v1/users              - Create user
GET    /api/v1/users/{id}         - Get user
PUT    /api/v1/users/{id}         - Update user
DELETE /api/v1/users/{id}         - Delete user

# Suppliers
GET    /api/v1/suppliers          - List suppliers
POST   /api/v1/suppliers          - Create supplier
GET    /api/v1/suppliers/{id}     - Get supplier
PUT    /api/v1/suppliers/{id}     - Update supplier
DELETE /api/v1/suppliers/{id}     - Delete supplier
GET    /api/v1/suppliers/{id}/balance - Calculate supplier balance

# Products
GET    /api/v1/products           - List products
POST   /api/v1/products           - Create product
GET    /api/v1/products/{id}      - Get product
PUT    /api/v1/products/{id}      - Update product
DELETE /api/v1/products/{id}      - Delete product

# Rates
GET    /api/v1/rates              - List rates
POST   /api/v1/rates              - Create rate
GET    /api/v1/rates/{id}         - Get rate
GET    /api/v1/products/{id}/rates        - Product rates
GET    /api/v1/products/{id}/rates/latest - Latest rate

# Collections
GET    /api/v1/collections        - List collections
POST   /api/v1/collections        - Create collection
GET    /api/v1/collections/{id}   - Get collection
DELETE /api/v1/collections/{id}   - Delete collection

# Payments
GET    /api/v1/payments           - List payments
POST   /api/v1/payments           - Create payment
GET    /api/v1/payments/{id}      - Get payment
DELETE /api/v1/payments/{id}      - Delete payment
```

### Database Schema

- **users**: UUID-based, roles (JSON), soft deletes
- **suppliers**: Unique codes, contact info
- **products**: Multi-unit support
- **rates**: Versioned, time-based
- **collections**: Links suppliers, products, rates
- **payments**: Advance, partial, final types
- **audit_logs**: Immutable audit trail

## 🏗️ Architecture Principles

### SOLID Principles

1. **Single Responsibility**: Each class has one purpose
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Value objects are substitutable
4. **Interface Segregation**: Focused, specific interfaces
5. **Dependency Inversion**: Depend on abstractions, not concretions

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│     Presentation (Controllers)      │
├─────────────────────────────────────┤
│    Infrastructure (Eloquent, DB)    │
├─────────────────────────────────────┤
│   Application (Use Cases, DTOs)     │
├─────────────────────────────────────┤
│   Domain (Entities, Value Objects)  │
└─────────────────────────────────────┘
        Dependencies flow inward →
```

### Design Patterns

- **Repository Pattern**: Data access abstraction
- **DTO Pattern**: Data transfer between layers  
- **Use Case Pattern**: Application-specific logic
- **Value Object Pattern**: Immutable domain concepts
- **Service Provider Pattern**: Dependency injection

## 🔧 Getting Started

### Prerequisites

- PHP 8.1 or higher
- Composer
- MySQL or PostgreSQL
- Node.js (for frontend, when available)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fieldpay_ledger
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate

# Start development server
php artisan serve
```

The API will be available at: `http://localhost:8000/api/v1`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Update API URL in .env if different
# EXPO_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm start

# Run on specific platform
npm run ios      # iOS (macOS only)
npm run android  # Android
npm run web      # Web browser
```

The mobile app will be available through Expo Go app on your device or through iOS/Android simulators.

### Testing the API

```bash
# Create a supplier
curl -X POST http://localhost:8000/api/v1/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Green Valley Farms",
    "code": "GVF001",
    "address": "123 Farm Road",
    "phone": "+1234567890",
    "email": "contact@greenvalley.com"
  }'

# Create a product
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Tea Leaves",
    "code": "TEA001",
    "default_unit": "kg",
    "description": "High-quality green tea leaves"
  }'
```

## 📚 Documentation

- **[ARCHITECTURE.md](backend/ARCHITECTURE.md)**: Detailed architecture overview
- **[IMPLEMENTATION.md](backend/IMPLEMENTATION.md)**: Implementation guide and API examples
- **[SRS.md](SRS.md)**: Software Requirements Specification
- **[PRD.md](PRD.md)**: Product Requirements Document

## 🎯 Use Case Example: Tea Leaf Collection

1. **Daily Collection**:
   - Collectors visit multiple suppliers
   - Record quantities in various units (kg, g)
   - System uses latest effective rate
   - Transactions are immutable

2. **Payments**:
   - Record advance payments
   - Track partial payments
   - Automatic balance calculation
   - Complete audit trail

3. **Rate Management**:
   - Update rates periodically
   - Historical rates preserved
   - New collections use latest rate
   - Past collections maintain original rate

## 🔐 Security Features

- UUID-based primary keys
- Soft deletes for data recovery
- Audit logging for all operations
- Encrypted data (planned)
- RBAC/ABAC (planned)
- Laravel Sanctum authentication (planned)

## 🧪 Testing

```bash
cd backend
php artisan test
```

## 📈 Roadmap

### Phase 1: Core Backend ✅ COMPLETED
- [x] Clean Architecture setup
- [x] Domain entities and value objects
- [x] Repository pattern
- [x] Database migrations
- [x] Basic API endpoints

### Phase 2: Enhanced Backend ✅ COMPLETED
- [x] Collection management (full CRUD)
- [x] Payment management (full CRUD)
- [x] User management (full CRUD)
- [x] Automated payment calculations
- [x] Audit logging system
- [x] Request validation
- [x] Comprehensive API endpoints
- [ ] Authentication (Laravel Sanctum) - **Next Priority**
- [ ] Authorization (RBAC/ABAC) - **Next Priority**
- [ ] Comprehensive testing - Planned

### Phase 3: Frontend ✅ COMPLETED
- [x] React Native (Expo) app setup
- [x] Clean Architecture implementation
- [x] Domain entities and value objects
- [x] Repository pattern
- [x] API client with authentication
- [x] State management (Zustand)
- [x] Basic UI components
- [x] Supplier management screens (List, Create)
- [x] Product management screens (List, Create)
- [x] Collection management screens (List)
- [x] Payment management screens (List)
- [x] Offline support implementation
- [x] Sync mechanism with conflict resolution
- [x] NetworkStatus component
- [ ] Authentication flow - **Next Priority**
- [ ] Create/Edit forms for Collections & Payments - Planned
- [ ] Detail views for all entities - Planned

### Phase 4: Advanced Features (Planned)
- [ ] Complete authentication (Frontend + Backend)
- [ ] Real-time updates (WebSockets)
- [ ] Analytics dashboard
- [ ] Reporting system
- [ ] Export capabilities
- [ ] Rate limiting and throttling
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline

## 🤝 Contributing

When contributing:
1. Follow Clean Architecture principles
2. Write tests for new features
3. Update documentation
4. Follow PSR-12 coding standards
5. Use meaningful commit messages

## 📄 License

MIT License

## 👤 Author

Kasun Vimarshana

---

**Note**: This project follows industry best practices including Clean Architecture, SOLID principles, DRY, and KISS, ensuring long-term maintainability, scalability, and testability.

