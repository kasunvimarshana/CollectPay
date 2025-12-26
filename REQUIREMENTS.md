# PayCore - Software Requirements Specification

**Project Name:** Data Collection and Payment Management Application  
**Version:** 1.0  
**Date:** 2025-12-25  
**Prepared by:** Kasun Vimarshana

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [Use Cases](#4-use-cases)
5. [System Architecture](#5-system-architecture)
6. [Quality Attributes](#6-quality-attributes)

---

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to specify the requirements for a **production-ready, end-to-end data collection and payment management application** with a React Native (Expo) frontend and a Laravel backend. The system is designed to enable accurate and auditable financial management across multiple users and devices, ensuring **data integrity, no duplication or corruption, multi-unit support, and consistent operations**.

### 1.2 Scope

The application provides:

- Centralized management of users, suppliers, products, collections, and payments
- Multi-unit tracking (e.g., kilograms, grams, liters) for accurate measurement
- Historical and dynamic rate management for automated payment calculations
- Multi-user and multi-device support for concurrent access and collaboration
- Security, including encrypted data storage and transmission, RBAC/ABAC authorization
- Transactional integrity and comprehensive audit trails

The system is intended for businesses requiring precise tracking of collections, payments, and product rates, including agricultural workflows such as tea leaf collection.

### 1.3 Definitions, Acronyms, and Abbreviations

- **CRUD**: Create, Read, Update, Delete
- **RBAC**: Role-Based Access Control
- **ABAC**: Attribute-Based Access Control
- **Multi-unit**: Management of quantities in multiple measurement units (e.g., kg, g, liters, etc.)
- **Rate Versioning**: Historical record of rates applied at the time of collection
- **Soft Delete**: Marking records as deleted without physically removing them from the database

### 1.4 References

- IEEE Std 830-1998 – IEEE Recommended Practice for Software Requirements Specifications
- React Native Documentation: https://reactnative.dev/
- Laravel Documentation: https://laravel.com/docs

---

## 2. Overall Description

### 2.1 Product Perspective

The system consists of:

- **Frontend:** React Native (Expo), providing an intuitive mobile user interface
- **Backend:** Laravel, acting as the authoritative source for all data, validation, and business rules
- **Database:** Centralized, secure, transactional storage (MySQL/PostgreSQL)

The backend is responsible for validation, persistence, and conflict resolution, while the frontend ensures accurate input, reporting, and real-time multi-user collaboration.

### 2.2 Product Functions

Core functionality includes:

- **Full CRUD operations** for users, suppliers, products, collections, and payments
- **Multi-unit tracking** - Track quantities in kg, g, l, ml, units, etc.
- **Versioned rate management** - Historical rates preserved, latest rates auto-applied
- **Automated payment calculations** - Based on collections, rates, and prior payments
- **Multi-user & multi-device support** - Concurrent operations with conflict resolution
- **Advance & partial payments** - Flexible payment tracking and reconciliation
- **Security enforcement** - RBAC/ABAC, encrypted storage and transmission
- **Audit trails** - Complete history for accountability

### 2.3 User Classes and Characteristics

- **Administrators:** Manage system settings, users, suppliers, products, and payments
- **Collectors/Operators:** Enter and manage collection and payment data
- **Managers:** Review reports, perform audits, and validate calculations

### 2.4 Operating Environment

- **Frontend:** Android/iOS devices supporting React Native (Expo)
- **Backend:** Laravel application hosted on a secure server with database support
- **Network:** Reliable internet access for real-time data operations

### 2.5 Design and Implementation Constraints

- Adhere to **Clean Architecture**, **SOLID principles**, **DRY**, and **KISS** practices
- Minimize external dependencies; use open-source, free, and LTS-supported libraries only
- Ensure **transactional integrity** and **multi-user concurrency handling**
- Support **multi-unit quantity tracking** and **versioned rate management**

### 2.6 Assumptions and Dependencies

- Users have access to compatible devices and network connectivity
- Database and backend servers are reliably maintained
- Proper user authentication and authorization are enforced

---

## 3. Specific Requirements

### 3.1 Functional Requirements

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| FR-01 | User Management | CRUD operations for users with RBAC/ABAC | High |
| FR-02 | Supplier Management | CRUD operations, detailed profiles, multi-unit tracking | High |
| FR-03 | Product Management | CRUD operations, time-based and versioned rates, historical preservation | High |
| FR-04 | Collection Management | Daily recording of collected quantities, multi-unit support, automated calculations | High |
| FR-05 | Payment Management | Manage advance/partial payments, automated calculations, audit trails | High |
| FR-06 | Multi-user Support | Concurrent access for multiple users with conflict resolution | High |
| FR-07 | Multi-device Support | Data operations consistent across devices | High |
| FR-08 | Data Integrity | Prevent duplication, ensure correctness and immutability of historical records | High |
| FR-09 | Security | Encrypted storage/transmission, secure authentication and authorization | High |
| FR-10 | Audit Trail | Maintain complete history of collections, payments, and rate changes | High |

### 3.2 Non-Functional Requirements

| Category | Requirement | Priority |
|----------|-------------|----------|
| Performance | System should handle concurrent multi-user operations efficiently (100+ users, <2s response) | High |
| Reliability | Ensure no data loss or corruption during concurrent updates | High |
| Maintainability | Modular architecture with clear separation of concerns | High |
| Scalability | Support growing number of users, suppliers, and transactions | High |
| Usability | Intuitive UI for collectors and finance users | Medium |
| Security | End-to-end encryption, RBAC/ABAC enforcement | High |
| Portability | Support iOS and Android devices | Medium |

### 3.3 System Features

#### 3.3.1 Multi-Unit Tracking
- Products and collections can be recorded in various units (e.g., kg, g, l, ml, units)
- Unit consistency enforcement
- Unit-specific rate management

#### 3.3.2 Versioned Rates
- Maintain historical rates for products
- New collections use latest valid rates
- Historical collections preserve their original rates
- Effective date ranges for each rate

#### 3.3.3 Automated Payment Calculation
- Payments computed based on collected quantities, applied rates, and prior payments
- Formula: `Supplier Balance = Total Collections - Total Payments`
- Support for advance payments, partial payments, and full settlements

#### 3.3.4 Conflict Resolution
- Deterministic resolution using versioning and timestamps
- Server-side validation to prevent data corruption
- Optimistic locking for concurrent operations

#### 3.3.5 Audit Trail
- Full history of collections, payments, and rate changes
- Created by user tracking
- Soft deletes for data preservation
- Timestamps on all records

### 3.4 External Interface Requirements

#### 3.4.1 User Interfaces
- Mobile app screens for collections, payments, product/supplier management
- Intuitive dashboards for administrators and finance users
- Form validation and error handling

#### 3.4.2 Hardware Interfaces
- Compatible with standard smartphones and tablets
- Minimum Android 8.0+ or iOS 13+

#### 3.4.3 Software Interfaces
- RESTful API between frontend and Laravel backend
- JSON data format
- HTTPS communication
- Token-based authentication (Laravel Sanctum)

#### 3.4.4 Communication Interfaces
- HTTPS for secure data transmission
- Bearer token authentication
- API rate limiting

---

## 4. Use Cases

### 4.1 Use Case: Tea Leaf Collection Workflow

**Actors:** Collector, Manager, Administrator

**Preconditions:**
- Suppliers are registered in the system
- Products and rates are configured
- User is authenticated

**Main Flow:**

1. **Setup Phase** (Administrator)
   - Create supplier profiles (ABC Tea Estate, XYZ Farm, etc.)
   - Create products (Tea Leaves, code: TEA001)
   - Define product rates (Rs. 180/kg effective from today)

2. **Daily Collection** (Collector)
   - Select date (default: today)
   - Select supplier (ABC Tea Estate)
   - Select product (Tea Leaves)
   - Enter quantity (45.5 kg)
   - System automatically applies current rate (Rs. 180/kg)
   - System calculates total (45.5 × 180 = Rs. 8,190)
   - Save collection

3. **Payment Recording** (Collector/Manager)
   - Select supplier (ABC Tea Estate)
   - Enter payment amount (Rs. 5,000)
   - Select payment type (Partial)
   - Select payment method (Bank Transfer)
   - Add reference number
   - Save payment
   - New balance: Rs. 8,190 - Rs. 5,000 = Rs. 3,190

4. **Rate Update** (Administrator)
   - Create new rate (Rs. 195/kg)
   - Set effective date (Jan 1, 2026)
   - Historical collections keep old rate (Rs. 180/kg)
   - New collections use new rate (Rs. 195/kg)

**Postconditions:**
- All data is saved to centralized database
- Balances are updated automatically
- Audit trail is maintained

**Alternative Flows:**
- If no current rate exists, system prompts to create one
- If network connection fails, system shows error message
- Multiple users can operate simultaneously without conflicts

### 4.2 Use Case: Multi-Unit Product Management

**Actors:** Administrator, Manager

**Description:** Manage products with quantities in multiple units and historical rate preservation.

**Flow:**
1. Administrator creates product with multiple unit support
2. Sets rates for different units (kg, g, etc.)
3. Historical rates are preserved automatically
4. Payments are calculated based on unit and rate

### 4.3 Use Case: Payment Audit

**Actors:** Manager, Administrator

**Description:** Review and audit collections, rates, and payments across users and devices.

**Flow:**
1. Manager views supplier details
2. Reviews collection history with applied rates
3. Reviews payment history
4. Verifies balance calculations
5. System provides fully auditable records with timestamps and user tracking

---

## 5. System Architecture

### 5.1 Architecture Overview

```
Mobile App (React Native/Expo)
    ↓
API Gateway (Laravel Sanctum Auth)
    ↓
Controllers (Request Handling & Validation)
    ↓
Models (Business Logic & Calculations)
    ↓
Database (Data Persistence)
```

### 5.2 Key Components

#### Backend (Laravel)
- **Controllers:** AuthController, SupplierController, ProductController, ProductRateController, CollectionController, PaymentController
- **Models:** User, Supplier, Product, ProductRate, Collection, Payment
- **Database:** MySQL/PostgreSQL with foreign keys, indexes, soft deletes

#### Frontend (React Native/Expo)
- **Screens:** Login, Register, Home, Suppliers, Products, Collections, Payments
- **Navigation:** Stack and Tab navigation
- **State Management:** Context API for auth, local state for screens
- **Services:** Centralized API service with Axios
- **Storage:** Expo SecureStore for encrypted token storage

### 5.3 Security Architecture

- **Authentication:** Laravel Sanctum token-based authentication
- **Authorization:** RBAC with roles (admin, manager, collector)
- **Data Protection:** HTTPS, encrypted storage, password hashing (Bcrypt)
- **API Security:** Rate limiting, input validation, CSRF protection

### 5.4 Data Architecture

#### Core Entities
- **Users** - System users with roles
- **Suppliers** - Supplier profiles with balances
- **Products** - Products with codes and units
- **Product Rates** - Versioned rates with effective dates
- **Collections** - Daily collection records with auto-calculations
- **Payments** - Payment records with types and methods

#### Relationships
```
User → creates → Supplier, Product, ProductRate, Collection, Payment
Supplier → has many → Collection, Payment
Product → has many → ProductRate, Collection
ProductRate → used in → Collection
```

---

## 6. Quality Attributes

### 6.1 Data Integrity
- No data duplication or corruption
- Transactional operations for critical updates
- Foreign key constraints for referential integrity
- Soft deletes for historical preservation

### 6.2 Reliability
- Accurate calculations and consistent operations
- Robust multi-user/multi-device handling
- Automatic error recovery
- Comprehensive logging

### 6.3 Security
- End-to-end encryption for data in transit and at rest
- Robust access control (RBAC/ABAC)
- Secure authentication and session management
- Regular security audits (CodeQL)

### 6.4 Maintainability
- Clean Architecture with clear layer separation
- SOLID principles implementation
- DRY - No code duplication
- KISS - Simple, understandable implementations
- Comprehensive documentation

### 6.5 Scalability
- Stateless API design for horizontal scaling
- Database optimization with indexes
- Caching strategy (Redis)
- Queue system for background jobs

### 6.6 Performance
- Response time <2 seconds for standard queries
- Support for 100+ concurrent users
- Pagination for large datasets
- Optimized database queries with eager loading

---

## 7. Acceptance Criteria

The system is considered complete when:

- [x] Full CRUD functionality for all entities implemented
- [x] Accurate multi-unit quantity tracking working
- [x] Historical rate application functioning correctly
- [x] Multi-user, multi-device concurrency handled without data loss
- [x] Secure authentication and authorization enforced
- [x] Automated, auditable payment calculations working
- [x] No security vulnerabilities (CodeQL verified)
- [x] Comprehensive documentation completed
- [ ] Frontend UI screens fully implemented
- [ ] End-to-end testing completed
- [ ] User acceptance testing passed

---

## 8. References

1. React Native Documentation: https://reactnative.dev/
2. Laravel Documentation: https://laravel.com/docs
3. IEEE Std 830-1998 – Recommended Practice for Software Requirements Specifications
4. ARCHITECTURE.md - System architecture documentation
5. DEPLOYMENT.md - Deployment guide
6. USER_GUIDE.md - End-user documentation

---

**Document Status:** Approved  
**Last Updated:** 2025-12-25  
**Maintained By:** PayCore Development Team
