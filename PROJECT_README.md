# TrackVault - Data Collection and Payment Management Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

TrackVault is a production-ready, end-to-end data collection and payment management application built with:
- **Backend**: Laravel (PHP) with JWT Authentication
- **Frontend**: React Native (Expo) with TypeScript
- **Architecture**: Clean Architecture, SOLID principles, DRY, KISS

## Features

### Core Functionality
- ✅ **User Management**: Complete CRUD with RBAC/ABAC authorization
- ✅ **Supplier Management**: Detailed profiles with multi-unit quantity tracking
- ✅ **Product Management**: Time-based and versioned rate management
- ✅ **Collection Tracking**: Multi-unit quantity recording with automatic calculations
- ✅ **Payment Management**: Advance, partial, and final payments with automated calculations
- ✅ **Audit Trail**: Comprehensive logging of all operations

### Security
- 🔒 JWT token-based authentication
- 🔒 Encrypted data at rest and in transit
- 🔒 Role-Based Access Control (RBAC)
- 🔒 Attribute-Based Access Control (ABAC)
- 🔒 Secure password hashing
- 🔒 SQL injection prevention
- 🔒 XSS and CSRF protection

### Data Integrity
- ✓ Multi-user concurrent operations support
- ✓ Optimistic locking with version control
- ✓ Server-side validation and conflict resolution
- ✓ Transactional database operations
- ✓ Audit trail for all changes
- ✓ No data duplication or corruption

### Multi-Device Support
- 📱 Centralized server state
- 📱 Consistent data across devices
- 📱 Offline-first architecture with sync
- 📱 Conflict detection and resolution

## Project Structure

```
TrackVault/
├── backend/                    # Laravel Backend
│   ├── app/
│   │   ├── Domain/            # Domain Layer
│   │   ├── Application/       # Application Layer
│   │   ├── Infrastructure/    # Infrastructure Layer
│   │   ├── Interfaces/        # Interface Layer (Controllers)
│   │   └── Models/            # Eloquent Models
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   └── seeders/          # Database seeders
│   └── routes/
│       └── api.php           # API routes
│
├── frontend/                  # React Native Frontend
│   ├── src/
│   │   ├── domain/           # Domain Layer
│   │   ├── application/      # Application Layer
│   │   ├── infrastructure/   # Infrastructure Layer
│   │   ├── presentation/     # Presentation Layer
│   │   └── shared/           # Shared utilities
│   └── App.tsx               # Root component
│
└── docs/                      # Documentation
    ├── ARCHITECTURE.md        # System architecture
    ├── API.md                # API documentation
    └── DEPLOYMENT.md         # Deployment guide
```

## Quick Start

### Prerequisites

- **Backend**: PHP 8.1+, Composer, MySQL/PostgreSQL
- **Frontend**: Node.js 18+, npm/yarn, Expo CLI
- **Tools**: Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Start development server
php artisan serve
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Or use specific platform
npx expo start --android  # For Android
npx expo start --ios      # For iOS (macOS only)
npx expo start --web      # For Web
```

## Environment Variables

### Backend (.env)

```env
APP_NAME=TrackVault
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trackvault
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=...
JWT_TTL=60
JWT_REFRESH_TTL=20160
```

### Frontend (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

## API Documentation

### Authentication

```
POST /api/register          # Register new user
POST /api/login             # Login
GET  /api/me                # Get current user
POST /api/logout            # Logout
POST /api/refresh           # Refresh token
POST /api/change-password   # Change password
```

### Suppliers

```
GET    /api/suppliers              # List suppliers
POST   /api/suppliers              # Create supplier
GET    /api/suppliers/{id}         # Get supplier
PUT    /api/suppliers/{id}         # Update supplier
DELETE /api/suppliers/{id}         # Delete supplier
GET    /api/suppliers/{id}/collections  # Get supplier collections
GET    /api/suppliers/{id}/payments     # Get supplier payments
GET    /api/suppliers/{id}/balance      # Get supplier balance
```

### Products

```
GET    /api/products                # List products
POST   /api/products                # Create product
GET    /api/products/{id}           # Get product
PUT    /api/products/{id}           # Update product
DELETE /api/products/{id}           # Delete product
GET    /api/products/{id}/rates     # Get product rates
POST   /api/products/{id}/rates     # Add product rate
GET    /api/products/{id}/current-rate  # Get current rate
```

### Collections

```
GET    /api/collections             # List collections
POST   /api/collections             # Create collection
GET    /api/collections/{id}        # Get collection
PUT    /api/collections/{id}        # Update collection
DELETE /api/collections/{id}        # Delete collection
```

### Payments

```
GET    /api/payments                # List payments
POST   /api/payments                # Create payment
GET    /api/payments/{id}           # Get payment
PUT    /api/payments/{id}           # Update payment
DELETE /api/payments/{id}           # Delete payment
POST   /api/payments/calculate      # Calculate payment
```

## Use Case: Tea Leaves Collection

### Scenario

A tea collection business needs to:
1. Track daily tea leaf collections from multiple suppliers
2. Record quantities in multiple units (kg, g)
3. Apply different rates per unit
4. Manage advance and partial payments
5. Calculate accurate monthly settlements
6. Support multiple collectors working simultaneously

### Workflow

1. **Collection Phase**
   - Collectors visit suppliers daily
   - Record quantity collected (e.g., 50 kg, 500 g)
   - System applies current rate automatically
   - Calculates total amount

2. **Payment Phase**
   - Record advance payments
   - Track partial payments
   - System calculates remaining balance

3. **Settlement Phase**
   - Review total collections
   - Verify rates applied
   - Calculate final payment
   - Generate reports

## Architecture Highlights

### Clean Architecture Layers

1. **Domain Layer**: Business entities and rules
2. **Application Layer**: Use cases and services
3. **Infrastructure Layer**: External interfaces (DB, API)
4. **Presentation Layer**: UI components

### Design Principles

- **SOLID**: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
- **DRY**: Don't Repeat Yourself - reusable components
- **KISS**: Keep It Simple, Stupid - minimal complexity

### Security Best Practices

- Encrypted data transmission (HTTPS)
- Encrypted data storage
- Secure authentication (JWT)
- Authorization checks at API level
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
php artisan test

# Run specific test
php artisan test --filter=UserTest
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Deployment

### Backend Deployment

1. Configure production environment
2. Set up database
3. Run migrations
4. Configure web server (Apache/Nginx)
5. Set up SSL certificate
6. Configure cron jobs

### Frontend Deployment

#### Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@trackvault.com or open an issue in the repository.

## Acknowledgments

- Laravel Framework
- React Native & Expo
- JWT Authentication
- Clean Architecture principles

## Roadmap

- [ ] Real-time notifications
- [ ] Advanced reporting & analytics
- [ ] Biometric authentication
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Export to Excel/PDF
- [ ] Mobile offline mode enhancement
- [ ] Web dashboard

## Authors

- **Kasun Vimarshana** - *Initial work*

## Version

Current Version: 1.0.0

---

**TrackVault** - Reliable Data Collection and Payment Management
