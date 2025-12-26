# Paywise System Architecture

**Version:** 1.0  
**Last Updated:** December 25, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [System Components](#system-components)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Data Flow](#data-flow)
7. [Security Architecture](#security-architecture)
8. [Database Design](#database-design)
9. [API Design](#api-design)
10. [Deployment Architecture](#deployment-architecture)
11. [Scalability Considerations](#scalability-considerations)

---

## Overview

Paywise is a production-ready, end-to-end data collection and payment management application built using:
- **Frontend:** React Native (Expo) for cross-platform mobile applications
- **Backend:** Laravel 11 as the single source of truth and API server
- **Database:** Relational database (SQLite for dev, MySQL/PostgreSQL for production)

### Key Architectural Goals

- **Data Integrity:** Prevent duplication, corruption, and ensure consistency
- **Multi-User Support:** Enable concurrent operations without conflicts
- **Multi-Device Support:** Consistent data across all devices
- **Security:** End-to-end encryption, secure authentication, and authorization
- **Maintainability:** Clean, modular code following industry best practices
- **Scalability:** Support growing users, data, and transactions

---

## Architecture Principles

### 1. Clean Architecture ✅

The system follows Clean Architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│   (Controllers, Views, API Responses)       │
├─────────────────────────────────────────────┤
│          Application Layer                  │
│    (Use Cases, Business Logic)              │
├─────────────────────────────────────────────┤
│           Domain Layer                      │
│    (Models, Entities, Rules)                │
├─────────────────────────────────────────────┤
│        Infrastructure Layer                 │
│  (Database, External Services, Storage)     │
└─────────────────────────────────────────────┘
```

**Benefits:**
- Framework independence
- Testable business logic
- Clear dependencies flow inward
- Easy to understand and maintain

### 2. SOLID Principles ✅

- **Single Responsibility:** Each class has one reason to change
- **Open/Closed:** Open for extension, closed for modification
- **Liskov Substitution:** Interfaces properly implemented
- **Interface Segregation:** No unnecessary dependencies
- **Dependency Inversion:** Depend on abstractions, not concretions

### 3. DRY (Don't Repeat Yourself) ✅

- Reusable components and functions
- Shared validation logic
- Common API client configuration
- Test factories for data generation

### 4. KISS (Keep It Simple, Stupid) ✅

- Simple, straightforward implementations
- Minimal complexity
- Easy to understand and maintain
- No over-engineering

---

## System Components

### High-Level Architecture

```
┌────────────────┐
│  Mobile Clients │
│  (iOS/Android)  │
└───────┬────────┘
        │ HTTPS
        │ REST API
        ▼
┌────────────────┐
│   API Gateway   │
│   (Laravel)     │
└───────┬────────┘
        │
        ▼
┌────────────────┐     ┌────────────────┐
│   Application   │────▶│    Database    │
│   Services      │     │  (MySQL/Pg)    │
└───────┬────────┘     └────────────────┘
        │
        ▼
┌────────────────┐
│   Domain Logic  │
│   (Models)      │
└────────────────┘
```

### Component Breakdown

1. **Mobile Client (React Native/Expo)**
   - User interface
   - State management
   - API communication
   - Local storage (tokens)

2. **API Gateway (Laravel)**
   - Route management
   - Request validation
   - Authentication/Authorization
   - Response formatting

3. **Application Services**
   - Business logic orchestration
   - Transaction management
   - Data validation
   - Conflict resolution

4. **Domain Layer**
   - Entity models
   - Business rules
   - Relationships
   - Calculations

5. **Infrastructure**
   - Database access (Eloquent ORM)
   - External services
   - File storage
   - Logging

---

## Backend Architecture

### Laravel Application Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/              # API Controllers
│   │   │       ├── AuthController.php
│   │   │       ├── UserController.php
│   │   │       ├── SupplierController.php
│   │   │       ├── ProductController.php
│   │   │       ├── ProductRateController.php
│   │   │       ├── CollectionController.php
│   │   │       └── PaymentController.php
│   │   ├── Middleware/
│   │   └── Requests/             # Request validation
│   │
│   ├── Models/                   # Eloquent Models
│   │   ├── User.php
│   │   ├── Supplier.php
│   │   ├── Product.php
│   │   ├── ProductRate.php
│   │   ├── Collection.php
│   │   └── Payment.php
│   │
│   └── Policies/                 # Authorization policies
│
├── database/
│   ├── migrations/               # Database schema
│   ├── seeders/                  # Initial data
│   └── factories/                # Test data factories
│
├── routes/
│   └── api.php                   # API route definitions
│
└── tests/                        # PHPUnit tests
    ├── Unit/                     # Unit tests
    └── Feature/                  # Integration tests
```

### Controller Responsibilities

Each controller follows a consistent pattern:

1. **Request Validation:** Validate incoming data
2. **Authorization:** Check user permissions
3. **Business Logic:** Process the request
4. **Response:** Return formatted JSON response

**Example Pattern:**
```php
public function store(Request $request)
{
    // 1. Validation
    $validated = $request->validate([...]);
    
    // 2. Authorization
    $this->authorize('create', Model::class);
    
    // 3. Business Logic
    DB::transaction(function () use ($validated) {
        // Create/update data
    });
    
    // 4. Response
    return response()->json($data, 201);
}
```

### Model Layer Design

Models handle:
- **Relationships:** Define Eloquent relationships
- **Accessors/Mutators:** Data formatting
- **Scopes:** Reusable query filters
- **Business Logic:** Domain-specific calculations

**Key Features:**
- Optimistic locking with `version` field
- Soft deletes for data recovery
- Timestamps for audit trails
- User tracking for accountability

---

## Frontend Architecture

### React Native Application Structure

```
frontend/
├── src/
│   ├── api/                      # API communication
│   │   └── client.js             # Axios client configuration
│   │
│   ├── context/                  # State management
│   │   └── AuthContext.js        # Authentication state
│   │
│   ├── navigation/               # Navigation setup
│   │   └── AppNavigator.js       # Stack navigator
│   │
│   └── screens/                  # UI screens
│       ├── LoginScreen.js
│       ├── HomeScreen.js
│       ├── SuppliersScreen.js
│       ├── SupplierFormScreen.js
│       ├── ProductsScreen.js
│       ├── ProductFormScreen.js
│       ├── CollectionsScreen.js
│       ├── CollectionFormScreen.js
│       ├── PaymentsScreen.js
│       └── PaymentFormScreen.js
│
├── App.js                        # Root component
├── app.json                      # Expo configuration
└── package.json                  # Dependencies
```

### Component Design Pattern

Each screen follows this pattern:

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { View, Text, ... } from 'react-native';

// 2. Component Definition
export default function ScreenName({ navigation }) {
  // 3. State Management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 4. Effects (data fetching)
  useEffect(() => {
    fetchData();
  }, []);
  
  // 5. Event Handlers
  const handleAction = async () => {
    // Handle user actions
  };
  
  // 6. Render
  return (
    <View>
      {/* UI Components */}
    </View>
  );
}
```

### State Management Strategy

- **AuthContext:** Global authentication state (user, token, login/logout)
- **Local State:** Component-specific data (useState)
- **AsyncStorage:** Persistent storage for auth tokens

**Benefits:**
- Simple and maintainable
- No external dependencies
- Sufficient for app scope
- Easy to understand

---

## Data Flow

### Request Flow (User Action → Database)

```
1. User Action (Button Press)
   ↓
2. Screen Event Handler
   ↓
3. API Client (Axios)
   ↓ HTTP Request (JSON + Auth Token)
4. Laravel API Route
   ↓
5. Middleware (Auth, CORS)
   ↓
6. Controller Method
   ↓
7. Validation
   ↓
8. Authorization Check
   ↓
9. Model + Database Transaction
   ↓ Query
10. Database (Create/Read/Update/Delete)
    ↓ Result
11. Controller Response (JSON)
    ↓ HTTP Response
12. API Client (Axios)
    ↓
13. Screen Updates State
    ↓
14. UI Re-renders
```

### Authentication Flow

```
1. User enters credentials
   ↓
2. POST /api/login
   ↓
3. AuthController validates credentials
   ↓
4. Generate Sanctum token
   ↓
5. Return token + user data
   ↓
6. Store token in AsyncStorage
   ↓
7. Set AuthContext state
   ↓
8. Redirect to HomeScreen
   ↓
9. All future requests include token in headers
```

### Collection Creation Flow

```
1. User fills collection form
   ↓
2. Select supplier, product, unit, quantity
   ↓
3. POST /api/collections
   ↓
4. CollectionController receives data
   ↓
5. Validate inputs (supplier exists, product exists)
   ↓
6. Find current active rate for product + unit
   ↓
7. Calculate total (quantity × rate)
   ↓
8. Create collection record with:
   - supplier_id
   - product_id
   - product_rate_id
   - quantity
   - unit
   - rate (from product_rate)
   - total_amount (calculated)
   ↓
9. Return created collection
   ↓
10. Update UI with new collection
```

---

## Security Architecture

### Authentication

**Laravel Sanctum** - Token-based authentication

- **Token Generation:** On successful login
- **Token Storage:** Client-side (AsyncStorage)
- **Token Transmission:** Authorization header
- **Token Revocation:** On logout

**Flow:**
```
Login → Generate Token → Store Token → Include in Headers → Validate Token → Access Granted
```

### Authorization

**Role-Based Access Control (RBAC)**

| Role      | Permissions                                    |
|-----------|-----------------------------------------------|
| Admin     | Full access to all resources                   |
| Manager   | Read/Write suppliers, products, collections    |
| Collector | Read suppliers/products, Write collections     |

**Implementation:**
- Middleware checks user role
- Policy classes define permissions
- Controllers enforce authorization

### Data Protection

1. **Encryption in Transit:** HTTPS (TLS/SSL)
2. **Encryption at Rest:** Database encryption (optional)
3. **Password Hashing:** bcrypt (cost factor 10)
4. **SQL Injection Prevention:** Eloquent ORM
5. **CSRF Protection:** Laravel default
6. **Input Validation:** Request validation rules

### Concurrency Control

**Optimistic Locking** - Version field strategy

```php
// Update with version check
UPDATE suppliers 
SET name = ?, version = version + 1
WHERE id = ? AND version = ?
```

**Benefits:**
- Prevents lost updates
- No database locks
- Better performance
- Deterministic conflict resolution

---

## Database Design

### Entity Relationship Diagram

```
users (1) ──────┬──── (M) suppliers
                │
                ├──── (M) products
                │
                ├──── (M) product_rates
                │
                ├──── (M) collections
                │
                └──── (M) payments

suppliers (1) ──── (M) collections
              └──── (M) payments

products (1) ──── (M) product_rates
             └──── (M) collections

product_rates (1) ──── (M) collections
```

### Table Design Patterns

#### Common Fields (All Tables)

- `id` - Primary key (auto-increment)
- `created_at` - Record creation timestamp
- `updated_at` - Last modification timestamp
- `deleted_at` - Soft delete timestamp (nullable)

#### Versioning Fields (Critical Tables)

- `version` - Optimistic locking counter

#### Audit Fields

- `created_by` - User who created the record
- `updated_by` - User who last updated the record

### Key Tables

#### users
- Authentication and authorization
- Role management
- Version control

#### suppliers
- Supplier profiles
- Contact information
- Status tracking
- Version control

#### products
- Product definitions
- Unit specifications
- Version control

#### product_rates
- Time-based rate versioning
- effective_from/effective_to dates
- Unit-specific rates

#### collections
- Daily collection records
- Quantity tracking
- Automatic rate application
- Total calculations

#### payments
- Payment transactions
- Type: advance, partial, full
- Reference tracking
- User accountability

---

## API Design

### RESTful Principles

The API follows REST conventions:

| HTTP Method | Action      | URL Pattern          | Description            |
|-------------|-------------|----------------------|------------------------|
| GET         | index       | /api/resources       | List all resources     |
| GET         | show        | /api/resources/{id}  | Get single resource    |
| POST        | store       | /api/resources       | Create new resource    |
| PUT/PATCH   | update      | /api/resources/{id}  | Update resource        |
| DELETE      | destroy     | /api/resources/{id}  | Delete resource        |

### Request/Response Format

**Request:**
```json
{
  "field1": "value1",
  "field2": "value2",
  "version": 1
}
```

**Success Response:**
```json
{
  "data": {
    "id": 1,
    "field1": "value1",
    "field2": "value2",
    "version": 2
  }
}
```

**Error Response:**
```json
{
  "message": "Validation failed",
  "errors": {
    "field1": ["Error message"]
  }
}
```

### Pagination

```json
{
  "data": [...],
  "links": {
    "first": "url",
    "last": "url",
    "prev": null,
    "next": "url"
  },
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 73
  }
}
```

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│          Load Balancer (Nginx)          │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│ App Server 1 │  │ App Server 2 │
│  (Laravel)   │  │  (Laravel)   │
└──────┬───────┘  └───────┬──────┘
       │                  │
       └────────┬─────────┘
                ▼
        ┌──────────────┐
        │   Database   │
        │ (MySQL/Pg)   │
        └──────────────┘
```

### Deployment Checklist

**Backend:**
- [ ] Set up production database (MySQL/PostgreSQL)
- [ ] Configure environment variables (.env)
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Configure web server (Nginx/Apache)
- [ ] Install SSL certificate (HTTPS)
- [ ] Set up queue workers
- [ ] Configure logging and monitoring
- [ ] Set up database backups
- [ ] Configure caching (Redis)
- [ ] Security hardening

**Frontend:**
- [ ] Update API URL for production
- [ ] Build production app: `eas build`
- [ ] Submit to App Store
- [ ] Submit to Google Play Store
- [ ] Configure crash reporting
- [ ] Set up analytics
- [ ] Enable push notifications (optional)

---

## Scalability Considerations

### Horizontal Scaling

- **Multiple App Servers:** Load balancer distributes traffic
- **Stateless API:** No session storage on servers
- **Token-based Auth:** Works across server instances

### Database Optimization

- **Indexes:** On frequently queried columns
- **Query Optimization:** N+1 query prevention
- **Connection Pooling:** Reuse database connections
- **Read Replicas:** Separate read/write databases
- **Caching:** Redis for frequently accessed data

### Performance Monitoring

- **Application Performance Monitoring (APM):** Track slow queries
- **Error Tracking:** Log and alert on errors
- **Usage Analytics:** Monitor user behavior
- **Server Metrics:** CPU, memory, disk usage

### Future Enhancements

1. **Caching Layer:** Redis for frequently accessed data
2. **Queue System:** Background job processing
3. **Search Engine:** Elasticsearch for advanced search
4. **Real-time Updates:** WebSockets for live data
5. **CDN:** Content delivery for static assets
6. **Microservices:** Split into smaller services (if needed)

---

## Conclusion

The Paywise architecture is designed for:
- **Production readiness** with proven technologies
- **Maintainability** through clean architecture principles
- **Scalability** to handle growth
- **Security** with multiple layers of protection
- **Data integrity** through proper concurrency control

The system successfully balances simplicity with robustness, making it suitable for real-world business workflows while remaining maintainable and extensible for future enhancements.

---

**Document Status:** Production Ready ✅  
**Last Review:** December 25, 2025  
**Next Review:** As needed for major changes
