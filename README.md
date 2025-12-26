# Collection Payment Management System

A production-ready, offline-first mobile application for managing product collections and payments, built with React Native (Expo) frontend and Laravel backend.

## 🎯 Overview

This system enables collectors (e.g., tea leaf collectors) to:
- Track quantities collected from multiple suppliers
- Manage advance and partial payments
- Define and track time-based product rates
- Calculate accurate supplier balances
- Work seamlessly offline with automatic synchronization
- Handle multi-user, multi-device scenarios with conflict resolution

## 🏗️ Architecture

### Backend (Laravel 12)
- **Clean Architecture** with clear separation of concerns
- **RESTful API** with JWT authentication
- **PostgreSQL/MySQL** database with comprehensive schema
- **Version-based conflict resolution** for multi-device sync
- **RBAC/ABAC** security model

### Frontend (React Native + Expo)
- **TypeScript** for type safety
- **Offline-first** architecture with SQLite storage
- **Encrypted local storage** for sensitive data
- **Event-driven synchronization** (network restore, app foreground, auth)
- **Clean Architecture** with domain, data, and presentation layers

## 📋 Requirements

### Backend
- PHP 8.3+
- Composer 2.x
- MySQL 8.0+ or PostgreSQL 13+
- Redis (optional, for caching)

### Frontend
- Node.js 20.x LTS
- npm 10.x or yarn
- Expo CLI

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# Configure database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=collection_payment_db
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Start development server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "API_BASE_URL=http://localhost:8000/api" > .env

# Start development server
npm start

# Or run on specific platform
npm run android
npm run ios
npm run web
```

## 📚 Documentation

- **[Architecture Documentation](./ARCHITECTURE.md)** - Detailed system architecture
- **[API Documentation](./API.md)** - Complete API reference
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions

## 🔑 Key Features

### 1. Supplier Management
- Detailed supplier profiles with contact information
- Regional tracking
- Credit limit management
- Active/inactive status

### 2. Product Management
- Multi-unit support (kg, g, lb, etc.)
- Category organization
- Product codes and descriptions

### 3. Rate Management
- Time-versioned rates (effective from/to dates)
- Supplier-specific or global rates
- Historical rate preservation
- Automatic rate application on collections

### 4. Collection Tracking
- Quantity recording with units
- Immutable historical rates
- Automatic total value calculation
- Collector attribution
- Notes and metadata support

### 5. Payment Management
- Multiple payment types: advance, partial, full, adjustment
- Multiple payment methods: cash, bank transfer, cheque, mobile money
- Payment tracking with reference numbers
- Status management (pending, completed, cancelled)

### 6. Offline Synchronization
- **Automatic sync triggers:**
  - Network connectivity restored
  - App brought to foreground
  - Successful authentication
- **Manual sync option** with user feedback
- **Idempotent operations** prevent duplication
- **Conflict resolution** with version tracking
- **Tamper-resistant** with HMAC signatures

### 7. Financial Calculations
- Automated supplier balance calculation
- Detailed supplier statements
- Payment due calculations
- Historical transaction tracking

### 8. Security
- JWT authentication
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Encrypted data storage and transmission
- Secure local storage on mobile devices

## 🔐 User Roles

### Admin
- Full system access
- User management
- System configuration
- All CRUD operations

### Manager
- View all data
- Manage suppliers, products, rates
- Approve payments
- View reports

### Collector
- Record collections
- Make payments
- View assigned suppliers
- Sync data

## 📊 Database Schema

### Core Tables
- `users` - User accounts with roles and permissions
- `suppliers` - Supplier information
- `products` - Product catalog
- `rates` - Time-versioned product rates
- `collections` - Collection records with immutable rates
- `payments` - Payment transactions
- `sync_queue` - Offline operation queue

## 🔄 Synchronization Flow

### Push Sync (Offline → Online)
1. App collects pending operations in local queue
2. Signs payload with HMAC
3. Sends batch to server with version info
4. Server validates and processes
5. Returns server versions
6. App updates local records

### Pull Sync (Online → Offline)
1. App sends last known version
2. Server returns all changes since version
3. App applies changes with conflict detection
4. App updates version marker

### Conflict Resolution
- Version-based detection
- Timestamp-based tie-breaking
- Last-write-wins strategy
- User notification for manual resolution (optional)

## 🧪 Testing

### Backend Tests
```bash
cd backend
php artisan test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend
```bash
cd frontend

# Build APK for Android
npx expo build:android

# Build for iOS
npx expo build:ios

# Or use EAS Build
eas build --platform all
```

## 🌍 Example Use Case: Tea Leaf Collection

1. **Daily Collections**: Collector visits suppliers, records quantity collected
2. **Auto Rate Application**: System applies current rate, stores immutably
3. **Offline Operation**: Works without internet, queues operations
4. **Advance Payments**: Collector makes advance payments to suppliers
5. **Auto Sync**: When online, syncs all data automatically
6. **Month-End**: Admin updates rate for the period
7. **Balance Calculation**: System calculates total owed minus payments
8. **Statement Generation**: Detailed breakdown for each supplier

## 🛡️ Security Best Practices

1. **Never commit** `.env` files or credentials
2. **Use HTTPS** in production
3. **Regular security updates** for dependencies
4. **Strong passwords** and key rotation
5. **Rate limiting** on API endpoints
6. **Input validation** on all inputs
7. **Encrypted storage** for sensitive data
8. **Regular backups** and disaster recovery testing

## 📈 Performance Optimization

- Database indexing on frequently queried columns
- Lazy loading of relationships
- Pagination on list endpoints
- Delta sync (only changed data)
- Background processing for heavy tasks
- Redis caching for frequently accessed data

## 🤝 Contributing

This is a production system. For changes:
1. Follow Clean Architecture principles
2. Maintain SOLID design patterns
3. Write comprehensive tests
4. Update documentation
5. Follow existing code style

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For technical support or questions:
- Technical Documentation: See `/docs` folder
- API Reference: See `API.md`
- Deployment Guide: See `DEPLOYMENT.md`

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core CRUD operations
- Offline synchronization
- Payment calculations
- Multi-user support
- JWT authentication
- RBAC/ABAC security

## 🎯 Roadmap

### Future Enhancements
- [ ] Real-time WebSocket notifications
- [ ] Advanced reporting and analytics
- [ ] Export to Excel/PDF
- [ ] Multi-language support
- [ ] Biometric authentication
- [ ] Batch operations
- [ ] Dashboard with charts
- [ ] SMS notifications

## 📝 Notes

- This system follows **online-first** architecture with robust offline support
- All operations are **idempotent** to prevent data duplication
- Historical rates are **immutable** to preserve transaction integrity
- Synchronization is **event-driven** and predictable
- Security is implemented **end-to-end** across all layers

---

Built with ❤️ following Clean Architecture, SOLID principles, and industry best practices.
