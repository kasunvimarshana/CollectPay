# FieldPay Ledger - Laravel Backend (Clean Architecture)

## 🎯 Overview

Production-ready Laravel 10 backend implementing **Clean Architecture** for a data collection and payment management system. Built with SOLID principles, comprehensive audit logging, and multi-user/multi-device support.

## 📋 Features

### ✅ Fully Implemented
- **Clean Architecture** with clear separation of concerns
- **Complete CRUD Operations** for:
  - Users (with role management)
  - Suppliers
  - Products
  - Rates (versioned, time-based)
  - Collections (multi-unit tracking)
  - Payments (advance, partial, final)
- **Automated Payment Calculations**
- **Multi-Unit Quantity System** (kg, g, l, ml, etc.)
- **Versioned Rate Management**
- **Audit Logging System**
- **Repository Pattern** with Dependency Injection
- **Use Case Pattern** for business logic
- **Request Validation** with custom request classes
- **Standardized API Responses**

## 🚀 API Endpoints

### Users
```
GET    /api/v1/users              - List users
POST   /api/v1/users              - Create user
GET    /api/v1/users/{id}         - Get user
PUT    /api/v1/users/{id}         - Update user
DELETE /api/v1/users/{id}         - Delete user
```

### Suppliers
```
GET    /api/v1/suppliers          - List suppliers
POST   /api/v1/suppliers          - Create supplier
GET    /api/v1/suppliers/{id}     - Get supplier
PUT    /api/v1/suppliers/{id}     - Update supplier
DELETE /api/v1/suppliers/{id}     - Delete supplier
GET    /api/v1/suppliers/{id}/balance - Calculate supplier balance
```

### Products
```
GET    /api/v1/products           - List products
POST   /api/v1/products           - Create product
GET    /api/v1/products/{id}      - Get product
PUT    /api/v1/products/{id}      - Update product
DELETE /api/v1/products/{id}      - Delete product
```

### Rates
```
GET    /api/v1/rates              - List rates
POST   /api/v1/rates              - Create rate
GET    /api/v1/rates/{id}         - Get rate
GET    /api/v1/products/{id}/rates        - Get product rates
GET    /api/v1/products/{id}/rates/latest - Get latest rate
```

### Collections
```
GET    /api/v1/collections        - List collections
POST   /api/v1/collections        - Create collection
GET    /api/v1/collections/{id}   - Get collection
DELETE /api/v1/collections/{id}   - Delete collection
```

### Payments
```
GET    /api/v1/payments           - List payments
POST   /api/v1/payments           - Create payment
GET    /api/v1/payments/{id}      - Get payment
DELETE /api/v1/payments/{id}      - Delete payment
```

## 🔧 Installation

### Prerequisites
- PHP 8.1 or higher
- Composer
- MySQL or PostgreSQL

### Setup

1. **Install Dependencies**
```bash
cd backend
composer install
```

2. **Environment Configuration**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Configure Database**
Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fieldpay_ledger
DB_USERNAME=root
DB_PASSWORD=your_password
```

4. **Run Migrations**
```bash
php artisan migrate
```

5. **Start Development Server**
```bash
php artisan serve
```

The API will be available at: `http://localhost:8000/api/v1`

## 📝 API Usage Examples

### Create a User
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "roles": ["collector"]
  }'
```

### Create a Collection
```bash
curl -X POST http://localhost:8000/api/v1/collections \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": "uuid-here",
    "product_id": "uuid-here",
    "rate_id": "uuid-here",
    "quantity_value": 50.5,
    "quantity_unit": "kg",
    "total_amount": 252.50,
    "total_amount_currency": "USD",
    "collection_date": "2025-12-27",
    "collected_by": "user-uuid-here",
    "notes": "Morning collection"
  }'
```

### Calculate Supplier Balance
```bash
curl -X GET http://localhost:8000/api/v1/suppliers/{supplier-id}/balance
```

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│   Presentation Layer (Controllers)      │
│   - HTTP Request Handling               │
│   - Response Formatting                 │
├─────────────────────────────────────────┤
│   Infrastructure Layer                  │
│   - Eloquent Repositories               │
│   - Audit Logging                       │
├─────────────────────────────────────────┤
│   Application Layer (Use Cases)         │
│   - Business Workflows                  │
│   - DTOs                                │
├─────────────────────────────────────────┤
│   Domain Layer (Core Business Logic)    │
│   - Entities                            │
│   - Value Objects                       │
│   - Repository Interfaces               │
└─────────────────────────────────────────┘
```

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Implementation guide

## 📄 License

MIT License
