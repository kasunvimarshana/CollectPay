# FieldSync Payments

A production-ready, end-to-end data collection and payment management application built with React Native (Expo) frontend and Laravel backend. Designed for online-first operations with robust offline support for intermittent connectivity environments.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FIELDSYNC PAYMENTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        REACT NATIVE (EXPO)                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │    UI       │  │   State     │  │   Sync      │  │   Local     │   │ │
│  │  │  Components │  │  Management │  │   Engine    │  │   Storage   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │         │                │                │                │          │ │
│  │         └────────────────┴────────────────┴────────────────┘          │ │
│  │                                   │                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                    DOMAIN LAYER                                  │  │ │
│  │  │  Entities │ Use Cases │ Repositories (Interfaces) │ Services   │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                              HTTPS/REST API                                  │
│                                      │                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         LARAVEL BACKEND                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │    API      │  │   Auth &    │  │   Sync      │  │   Business  │   │ │
│  │  │  Controllers│  │   RBAC/ABAC │  │   Handler   │  │   Logic     │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │         │                │                │                │          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                    DOMAIN LAYER                                  │  │ │
│  │  │  Entities │ Services │ Repositories │ Value Objects │ Events   │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                   │                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                 INFRASTRUCTURE LAYER                             │  │ │
│  │  │  Database │ Cache │ Queue │ External Services │ File Storage   │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         DATABASE (PostgreSQL/MySQL)                     │ │
│  │  Users │ Suppliers │ Products │ Rates │ Collections │ Payments        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Features

### Core Functionality

- **CRUD Operations**: Users, Suppliers, Products, Collections, Payments
- **Multi-unit Quantity Tracking**: Support for various measurement units (kg, g, liters, etc.)
- **Time-based Rate Versioning**: Historical rates preserved, automatic latest rate application
- **Payment Management**: Advance payments, partial payments, automated calculations
- **Auditable Payment Calculations**: Derived from historical collections, rate versions, and prior transactions

### Synchronization

- **Online-First Architecture**: Real-time persistence when connected
- **Robust Offline Support**: Seamless operation during connectivity gaps
- **Event-Driven Sync**: Triggered by network restoration, app foreground, authentication
- **Manual Sync Option**: User-controlled synchronization
- **Idempotent Writes**: Zero data loss, no duplication
- **Conflict Resolution**: Versioning, timestamps, server-side validation

### Security

- **End-to-End Encryption**: Data in transit and at rest
- **RBAC/ABAC**: Role-based and Attribute-based Access Control
- **Secure Local Storage**: Encrypted offline data
- **Tamper-Resistant Payloads**: Integrity verification for sync data
- **Transactional Operations**: ACID compliance on backend

### Multi-User Support

- **Real-Time Collaboration**: Multiple users across devices
- **Deterministic Conflict Resolution**: Predictable merge behavior
- **Centralized Database**: Single source of truth

## Project Structure

```
FieldSync-Payments/
├── backend/                    # Laravel API Backend
│   ├── app/
│   │   ├── Domain/            # Domain Layer (Clean Architecture)
│   │   ├── Application/       # Application Services
│   │   ├── Infrastructure/    # Infrastructure Layer
│   │   └── Http/              # API Controllers
│   ├── database/
│   ├── routes/
│   └── tests/
├── mobile/                     # React Native (Expo) Frontend
│   ├── src/
│   │   ├── domain/            # Domain Layer
│   │   ├── application/       # Application Services
│   │   ├── infrastructure/    # Infrastructure (API, Storage)
│   │   ├── presentation/      # UI Components & Screens
│   │   └── sync/              # Sync Engine
│   └── app/                   # Expo Router
└── docs/                       # Documentation
```

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ LTS
- MySQL 8.0+ or PostgreSQL 15+
- Expo CLI

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

## Use Case: Tea Leaf Collection

1. **Daily Collection**: Collectors visit suppliers, record quantities in kg/g
2. **Payment Tracking**: Record advance/partial payments throughout the month
3. **Rate Definition**: Define price per kg at month-end
4. **Auto Calculation**: System calculates total due based on:
   - Total quantity collected
   - Applied rate (historical or current)
   - Prior payments made
   - Resulting balance

## License

MIT License - See LICENSE file for details
