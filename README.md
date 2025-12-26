# FieldSyncLedger

**Production-ready, offline-first data collection and payment management application**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Laravel](https://img.shields.io/badge/Laravel-10.x-red.svg)](https://laravel.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-50.x-blue.svg)](https://expo.dev)

## Overview

FieldSyncLedger is a comprehensive, production-ready application designed for scenarios requiring reliable data collection and payment management in areas with intermittent or limited internet connectivity. Perfect for agricultural product collection, field services, and any business requiring accurate tracking and payment management in remote locations.

### Key Features

✅ **Offline-First Architecture** - Full functionality without internet connection  
✅ **Automatic Synchronization** - Event-driven sync on network restoration  
✅ **Zero Data Loss** - Deterministic conflict resolution with versioning  
✅ **Historical Rate Management** - Preserves exact rates at collection time  
✅ **Multi-User Support** - Concurrent access across multiple devices  
✅ **Automated Payment Calculations** - Accurate, auditable financial tracking  
✅ **Enterprise Security** - End-to-end encryption, RBAC/ABAC, tamper-resistant  
✅ **Clean Architecture** - SOLID principles, maintainable, scalable

## Technology Stack

### Backend
- **Framework**: Laravel 10.x
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum (JWT)
- **Architecture**: Clean Architecture, DDD

### Frontend
- **Framework**: React Native with Expo 50.x
- **Language**: TypeScript
- **Local Storage**: SQLite (expo-sqlite)
- **Secure Storage**: Expo SecureStore
- **State Management**: Zustand
- **Architecture**: Clean Architecture

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kasunvimarshana/FieldSyncLedger.git
   cd FieldSyncLedger
   ```

2. **Start the backend**
   ```bash
   # Copy environment file
   cp backend/.env.example backend/.env
   
   # Start services
   docker-compose up -d
   
   # Run migrations
   docker-compose exec backend php artisan migrate
   
   # Generate app key
   docker-compose exec backend php artisan key:generate
   
   # Seed test data (optional)
   docker-compose exec backend php artisan db:seed
   ```
   
   Backend API: `http://localhost:8000`
   
   **Test Credentials (after seeding)**:
   - Admin: `admin@fieldsyncledger.com` / `password`
   - Collector: `john@fieldsyncledger.com` / `password`
   - Viewer: `viewer@fieldsyncledger.com` / `password`

3. **Start the frontend**
   ```bash
   cd frontend
   npm install
   echo "EXPO_PUBLIC_API_URL=http://localhost:8000/api" > .env
   npm start
   ```
   
   Scan QR code with Expo Go app or press `i` for iOS, `a` for Android

## Use Cases

### Tea Leaf Collection (Example)
- Collectors visit multiple suppliers daily
- Record quantities collected with automatic rate application
- Make advance/partial payments at intervals
- Define final rates at month-end
- Automatically calculate supplier balances
- Generate accurate payment reports

### Supported Operations
- ✅ Full CRUD for suppliers, products, collections, payments
- ✅ Multi-unit quantity tracking (kg, g, liters, etc.)
- ✅ Time-based and versioned product rates
- ✅ Advance, partial, and final payments
- ✅ Automated payment calculations from historical data
- ✅ Audit trail for all transactions

## Architecture

### Backend Structure
```
backend/
├── app/
│   ├── Domain/         # Business entities, rules, interfaces
│   ├── Application/    # Use cases, DTOs, services
│   ├── Infrastructure/ # Database, external services
│   ├── Http/          # Controllers, middleware, routes
│   └── Models/        # Eloquent models
├── database/
│   └── migrations/    # Database schema
└── tests/            # Unit and integration tests
```

### Frontend Structure
```
frontend/
├── src/
│   ├── domain/         # Entity interfaces, repositories
│   ├── application/    # Use cases, business logic
│   ├── infrastructure/ # API, SQLite, sync service
│   └── presentation/   # UI components, screens
├── app/               # Expo Router screens
└── assets/           # Images, fonts
```

## Core Features

### Offline-First Synchronization
- **Automatic Sync Triggers**:
  - Network restoration
  - App foregrounding
  - Successful authentication
  - Manual sync option

- **Conflict Resolution**:
  - Version-based detection
  - Server-wins for critical data
  - Last-write-wins with timestamps
  - Manual resolution UI for complex conflicts

- **Data Integrity**:
  - Idempotency keys for collections/payments
  - Optimistic locking with version numbers
  - Transactional batch operations
  - Zero data loss guarantee

### Historical Rate Management
- Preserves exact rate at collection time
- New collections use latest active rate
- Rate versioning with effective date ranges
- Seamless offline/online rate application

### Payment Calculation
```
Balance Due = Total Collection Value - Total Payments

Where:
- Collection Value = Σ(quantity × applied_rate)
- Includes all historical collections
- Deducts all prior payments (advance, partial)
```

### Security Features
- JWT authentication
- RBAC/ABAC authorization
- Encrypted data storage
- Tamper-resistant sync
- SQL injection prevention
- HTTPS/TLS for transmission

## Documentation

- 📘 [Architecture Documentation](./docs/ARCHITECTURE.md) - System design and architecture
- 🛠️ [Developer Setup Guide](./docs/DEVELOPER_SETUP.md) - Local development setup
- 🚀 [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- 📡 [API Documentation](./docs/API.md) - Complete API reference

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Resources
- `GET/POST/PUT/DELETE /api/suppliers` - Supplier management
- `GET/POST/PUT/DELETE /api/products` - Product management
- `GET/POST/PUT/DELETE /api/rate-versions` - Rate version management
- `GET /api/rate-versions/active` - Get active rate for product/date
- `GET/POST/PUT/DELETE /api/collections` - Collection management
- `GET/POST/PUT/DELETE /api/payments` - Payment management
- `GET /api/supplier-balances` - Get all supplier balances
- `GET /api/supplier-balances/{id}` - Get specific supplier balance

### Synchronization
- `GET /api/sync/pull?since={timestamp}` - Pull server changes
- `POST /api/sync/push` - Push local changes

See [API Documentation](./docs/API.md) for complete details.

## Database Schema

### Core Entities
- **Users** - Authentication and authorization
- **Suppliers** - Supplier information and contacts
- **Products** - Product definitions with units
- **RateVersions** - Time-based product rates
- **Collections** - Quantity collected with applied rates
- **Payments** - Payment records with types
- **SyncLogs** - Synchronization audit trail

### Key Relationships
- User → Suppliers (one-to-many)
- Product → RateVersions (one-to-many)
- Supplier → Collections, Payments (one-to-many)
- Collection → RateVersion (many-to-one)

## Development

### Running Tests

**Backend:**
```bash
docker-compose exec backend php artisan test
```

**Frontend:**
```bash
cd frontend
npm test
```

### Code Quality

**Backend:**
```bash
# Code style
docker-compose exec backend vendor/bin/pint

# Static analysis
docker-compose exec backend vendor/bin/phpstan analyse
```

**Frontend:**
```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Deployment

### Docker Deployment (Recommended)

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate --force
```

### Mobile App Build

```bash
cd frontend

# iOS
eas build --platform ios

# Android
eas build --platform android
```

See [Deployment Guide](./docs/DEPLOYMENT.md) for complete instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow PSR-12 for PHP
- Follow TypeScript ESLint rules
- Add meaningful comments
- Write tests for new features

## Design Principles

### Clean Architecture
- **Domain Layer**: Core business logic, independent of frameworks
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External integrations (DB, API, storage)
- **Presentation Layer**: UI components and user interactions

### SOLID Principles
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### Best Practices
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Minimal external dependencies
- Comprehensive testing
- Clear documentation

## Troubleshooting

### Backend Issues

**Database connection failed:**
```bash
# Check MySQL is running
docker-compose ps

# View logs
docker-compose logs mysql
```

**Migrations not running:**
```bash
# Reset database (WARNING: destroys data)
docker-compose exec backend php artisan migrate:fresh
```

### Frontend Issues

**Cannot connect to API:**
- Check API URL in `.env`
- Ensure device is on same network
- Use local IP instead of localhost for physical devices

**SQLite errors:**
```bash
# Clear cache
npx expo start -c
```

## Performance

### Backend Optimization
- OPcache enabled for PHP
- Query result caching
- Database indexing on frequently queried fields
- Connection pooling

### Frontend Optimization
- Batch sync operations (max 100 items)
- Lazy loading for large lists
- Image optimization
- Efficient SQLite queries with indexes

## Security

### Backend
- JWT authentication with Laravel Sanctum
- SQL injection prevention via Eloquent ORM
- CSRF protection
- Rate limiting (60 requests/minute)
- Input validation and sanitization

### Frontend
- Secure token storage (Expo SecureStore)
- Local database encryption capability
- Certificate pinning for API calls
- No sensitive data in logs

## Monitoring

### Application Logs
```bash
# Backend logs
docker-compose logs -f backend

# Laravel logs
tail -f backend/storage/logs/laravel.log
```

### Database Backups
```bash
# Manual backup
docker-compose exec mysql mysqldump -u root -p fieldsyncledger > backup.sql

# Automated backups (see Deployment Guide)
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with:
- [Laravel](https://laravel.com) - Backend framework
- [React Native](https://reactnative.dev) - Mobile framework
- [Expo](https://expo.dev) - Development platform
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [SQLite](https://www.sqlite.org) - Local storage

## Support

For issues, questions, or contributions:
- 📧 Email: support@fieldsyncledger.com
- 🐛 Issues: [GitHub Issues](https://github.com/kasunvimarshana/FieldSyncLedger/issues)
- 📖 Documentation: [Wiki](https://github.com/kasunvimarshana/FieldSyncLedger/wiki)

## Roadmap

### Version 1.x
- [x] Core offline-first functionality
- [x] Automatic synchronization
- [x] Payment calculation engine
- [ ] Advanced reporting
- [ ] Export to CSV/PDF
- [ ] Multi-language support

### Version 2.x
- [ ] Real-time collaborative editing
- [ ] WebSocket notifications
- [ ] Advanced analytics dashboard
- [ ] Image attachments for collections
- [ ] Barcode/QR code scanning

---

**Made with ❤️ for reliable field operations in any connectivity condition**



