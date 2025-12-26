# TrackVault - Data Collection and Payment Management System

A production-ready, end-to-end data collection and payment management application with a React Native (Expo) frontend and Laravel backend. Designed for businesses requiring precise tracking of collections, payments, and product rates, with a focus on data integrity, multi-user support, and financial accuracy.

## 🎯 Overview

TrackVault provides centralized, authoritative management of:
- **Users** with role-based access control (Admin, Collector, Finance)
- **Suppliers** with detailed profiles and balance tracking
- **Products** with versioned rates and multi-unit support
- **Collections** with automated rate application and calculations
- **Payments** with advance/partial/full payment handling

Perfect for agricultural collection workflows (e.g., tea leaves, produce), supply chain management, and distributed collection/payment operations.

## ✨ Key Features

### Data Integrity & Concurrency
- ✅ Version-based optimistic locking prevents concurrent update conflicts
- ✅ Transactional database operations ensure data consistency
- ✅ Multi-user, multi-device support without data loss or corruption
- ✅ Historical data immutability with audit trails

### Multi-Unit Management
- ✅ Support for multiple units (kg, g, liters, custom units)
- ✅ Automatic unit conversions and calculations
- ✅ Precise quantity tracking and reporting

### Financial Management
- ✅ Versioned product rates with historical preservation
- ✅ Automated payment calculations based on collections and rates
- ✅ Advance, partial, and full payment support
- ✅ Real-time balance tracking per supplier
- ✅ Transparent, auditable financial oversight

### Security
- ✅ End-to-end encryption (data at rest and in transit)
- ✅ Laravel Sanctum token-based authentication
- ✅ Role-based (RBAC) and attribute-based (ABAC) access control
- ✅ Secure storage with Expo SecureStore
- ✅ Input validation and sanitization

### Architecture
- ✅ Clean Architecture principles
- ✅ SOLID, DRY, and KISS practices
- ✅ Modular, scalable, and maintainable design
- ✅ Minimal external dependencies
- ✅ Open-source, LTS-supported libraries only

## 🏗️ Project Structure

```
TrackVault/
├── backend/           # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/API/  # API controllers
│   │   └── Models/                # Eloquent models
│   ├── database/
│   │   ├── migrations/            # Database schema
│   │   └── seeders/               # Sample data
│   ├── routes/
│   │   └── api.php                # API routes
│   └── README.md                  # Backend documentation
│
├── frontend/          # React Native (Expo)
│   ├── src/
│   │   ├── api/       # API client and services
│   │   ├── contexts/  # React Context providers
│   │   ├── navigation/# Navigation configuration
│   │   └── screens/   # Screen components
│   └── README.md      # Frontend documentation
│
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: PHP 8.2+, Composer, SQLite/MySQL/PostgreSQL
- **Frontend**: Node.js 18+, npm, Expo CLI

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Seed sample data
php artisan db:seed

# Start server
php artisan serve
```

The API will be available at `http://localhost:8000/api`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Update API URL in src/api/client.ts if needed

# Start Expo dev server
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator.

## 📱 Demo Accounts

Test the application with these pre-seeded accounts:

| Role      | Email                        | Password   | Access Level                      |
|-----------|------------------------------|------------|-----------------------------------|
| Admin     | admin@trackvault.com         | password   | Full system access                |
| Collector | collector@trackvault.com     | password   | Collections & basic operations    |
| Finance   | finance@trackvault.com       | password   | Payments & financial reports      |

## 📖 Documentation

- [Backend Documentation](backend/README.md) - API endpoints, database schema, setup
- [Frontend Documentation](frontend/README.md) - App structure, components, usage
- [Software Requirements Specification](SRS-01.md) - Detailed requirements
- [Product Requirements Document](PRD-01.md) - Product specifications
- [Executive Summary](ESS.md) - Project overview

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Resources (Requires Authentication)
- `GET|POST /api/suppliers` - List/create suppliers
- `GET|PUT|DELETE /api/suppliers/{id}` - Get/update/delete supplier
- `GET|POST /api/products` - List/create products
- `GET|POST /api/product-rates` - List/create rates
- `GET|POST /api/collections` - List/create collections
- `GET|POST /api/payments` - List/create payments
- `GET /api/suppliers/{id}/balance` - Get supplier balance

See [backend/README.md](backend/README.md) for complete API documentation.

## 🏭 Use Case Example: Tea Leaves Collection

1. **Suppliers**: Register tea leaf suppliers with contact information
2. **Products**: Define "Tea Leaves" product with supported units (kg, g)
3. **Rates**: Set rates per unit with effective dates (e.g., Rs. 100/kg from 2025-01-01)
4. **Collections**: Daily recording:
   - Visit Supplier A, collect 25.5 kg
   - Visit Supplier B, collect 18.3 kg
   - System automatically applies current rate and calculates amounts
5. **Payments**: Track advances and settlements:
   - Give Supplier A advance of Rs. 1000
   - At month end, system calculates total owed minus advances
6. **Balance**: View real-time balance for each supplier

Multiple collectors can record data simultaneously across devices without conflicts!

## 🛡️ Security Features

- **Authentication**: JWT token-based with automatic refresh
- **Authorization**: Role and permission-based access control
- **Encryption**: Data encrypted at rest and in transit (HTTPS)
- **Validation**: Server-side input validation and sanitization
- **Concurrency**: Version control prevents race conditions
- **Audit Trail**: All changes logged with timestamps and user info

## 🧪 Testing

Backend tests:
```bash
cd backend
php artisan test
```

Frontend tests:
```bash
cd frontend
npm test
```

## 📦 Technology Stack

### Backend
- **Framework**: Laravel 11
- **Database**: SQLite (dev), MySQL/PostgreSQL (production)
- **Authentication**: Laravel Sanctum
- **Validation**: Laravel Request Validation
- **ORM**: Eloquent

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **HTTP Client**: Axios
- **Storage**: Expo SecureStore, AsyncStorage
- **State Management**: React Context API

## 🎨 Design Principles

- **Clean Architecture**: Clear separation of concerns
- **SOLID**: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **Modular**: Easy to extend and maintain
- **Testable**: Designed for unit and integration testing

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Authors

- Kasun Vimarshana

## 🙏 Acknowledgments

Built with:
- Laravel Framework
- React Native & Expo
- React Navigation
- Axios
- And many other open-source libraries

---

For detailed technical documentation, see the [Backend README](backend/README.md) and [Frontend README](frontend/README.md).
