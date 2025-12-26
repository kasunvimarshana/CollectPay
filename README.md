# Collectix - Data Collection and Payment Management System

A production-ready, end-to-end data collection and payment management application built with React Native (Expo) frontend and Laravel backend.

## Overview

Collectix provides centralized, authoritative management of users, suppliers, products, collections, and payments, ensuring data integrity, multi-user and multi-device support, multi-unit quantity tracking, and prevention of duplication or corruption.

### Key Features

- **Full CRUD Operations**: Manage users, suppliers, products, collections, and payments
- **Multi-Unit Tracking**: Support for different measurement units (kg, g, liters, etc.)
- **Versioned Rates**: Historical rate management with time-based versioning
- **Payment Management**: Handle advance, partial, and full payments
- **Automated Calculations**: Automatic payment calculations based on quantities and rates
- **Multi-User Support**: Concurrent operations with optimistic locking
- **Security**: RBAC/ABAC, encrypted storage, secure authentication
- **Audit Trail**: Complete history of all operations

## Quick Start

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure database in .env
php artisan migrate
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env with EXPO_PUBLIC_API_URL=http://localhost:8000/api
npm start
```

## Documentation

See individual README files:
- [Backend Documentation](backend/README.md)
- [System Specification](README-SPECIFICATION.md)
- Additional specs: PRD.md, SRS.md, ES.md

## Architecture

- **Backend**: Laravel 11 with RESTful API
- **Frontend**: React Native with Expo
- **Database**: MySQL/PostgreSQL
- **Auth**: Laravel Sanctum
- **Principles**: Clean Architecture, SOLID, DRY, KISS

## License

MIT
