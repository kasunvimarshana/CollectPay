# CollectPay - Data Collection and Payment Management Application

A production-ready, offline-first mobile application built with React Native (Expo) and Laravel backend for managing supplier collections and payments with real-time synchronization.

## 🚀 Features

### Core Functionality
- **Supplier Management**: Complete CRUD operations for supplier profiles
- **Product Management**: Multi-unit quantity tracking and categorization
- **Rate Management**: Time-based and versioned product rates with automatic application
- **Collection Tracking**: Daily collection records with automatic rate application
- **Payment Management**: Advance, partial, and full payment processing
- **Automated Calculations**: Auditable payment calculations from historical data

### Synchronization
- **Online-First Architecture**: Real-time persistence when connected
- **Offline Support**: Secure local storage with SQLite encryption
- **Controlled Auto-Sync**: Event-driven synchronization (network regain, app foreground, auth)
- **Manual Sync**: User-triggered synchronization with clear status indicators
- **Conflict Resolution**: Deterministic resolution with versioning and timestamps
- **Idempotent Operations**: Safe retry using UUIDs to prevent duplication

### Security
- **End-to-End Encryption**: Data encrypted at rest and in transit
- **Secure Local Storage**: Expo SecureStore for sensitive data
- **JWT Authentication**: Token-based authentication with refresh
- **RBAC & ABAC**: Role and attribute-based access control
- **Tamper-Resistant Sync**: Versioned payloads with server validation

### Architecture
- **Clean Architecture**: Clear separation of domain, data, and presentation layers
- **SOLID Principles**: Maintainable and testable code
- **DRY & KISS**: Minimal code duplication and complexity
- **Zero Technical Debt**: Production-ready implementation

## 📁 Project Structure

```
CollectPay/
├── backend/                    # Laravel Backend API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/       # API Controllers
│   │   │   └── Middleware/    # Custom middleware
│   │   ├── Models/            # Eloquent models
│   │   └── Services/          # Business logic
│   ├── config/                # Configuration files
│   ├── database/
│   │   └── migrations/        # Database migrations
│   └── routes/
│       └── api.php            # API routes
│
├── frontend/                   # React Native (Expo) Frontend
│   ├── src/
│   │   ├── data/              # Data Layer
│   │   │   ├── local/         # Local storage (SQLite, SecureStore)
│   │   │   ├── remote/        # API and network services
│   │   │   └── repositories/  # Data repositories
│   │   ├── domain/            # Domain Layer
│   │   │   ├── entities/      # Business entities
│   │   │   └── usecases/      # Business logic
│   │   └── presentation/      # Presentation Layer
│   │       ├── screens/       # Screen components
│   │       ├── components/    # Reusable components
│   │       └── navigation/    # Navigation setup
│   ├── app.json               # Expo configuration
│   └── package.json           # Dependencies
│
└── docs/                       # Documentation
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Laravel 10 (PHP 8.1+)
- **Database**: MySQL 5.7+ / MariaDB 10.3+
- **Authentication**: JWT (tymon/jwt-auth)
- **Caching**: Redis (optional)

### Frontend
- **Framework**: React Native with Expo SDK 50
- **Language**: TypeScript
- **Local Database**: Expo SQLite
- **Secure Storage**: Expo SecureStore
- **Network Detection**: Expo Network
- **HTTP Client**: Axios

## 📦 Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Configure environment:
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

4. Configure database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=collectpay
DB_USERNAME=root
DB_PASSWORD=your_password
```

5. Run migrations:
```bash
php artisan migrate
```

6. Start server:
```bash
php artisan serve
```

API available at: `http://localhost:8000/api/v1`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_ENCRYPTION_KEY=your-secure-key
```

4. Start development server:
```bash
npm start
```

5. Run on device:
```bash
# Android
npm run android

# iOS
npm run ios
```

## 🔄 Synchronization Strategy

### Data Flow

```
Mobile Device              Backend Server
     |                           |
     |--[Check Network]--------->|
     |                           |
     |--[Push Changes]---------->|
     |                           |--[Validate]
     |                           |--[Detect Conflicts]
     |                           |--[Apply Changes]
     |<--[Push Results]----------|
     |                           |
     |--[Pull Changes]---------->|
     |                           |--[Fetch Updates]
     |<--[Server Changes]--------|
     |                           |
     |--[Apply Locally]          |
```

### Conflict Resolution

1. **Version-Based**: Optimistic locking with version numbers
2. **Timestamp-Based**: Server timestamp comparison
3. **Server Wins**: Default strategy for conflicts
4. **UUID-Based**: Idempotent operations using UUIDs

### Sync Triggers

- **Automatic**: Network regain, app foreground, successful authentication
- **Manual**: User-initiated sync button
- **Controlled**: Event-driven, not polling-based

## 🔐 Security Features

### Backend Security
- HTTPS/TLS for all communication (production)
- JWT token authentication with refresh
- RBAC (Role-Based Access Control)
- ABAC (Attribute-Based Access Control)
- SQL injection prevention (prepared statements)
- CSRF protection
- Rate limiting
- Input validation and sanitization

### Frontend Security
- Encrypted local database (SQLite)
- Secure token storage (SecureStore)
- Encrypted API communication
- Tamper-resistant sync payloads
- Version control for data integrity

## 👥 User Roles

### Admin
- Full system access
- User management
- System configuration
- All data operations

### Manager
- View and manage all data
- Generate reports
- Approve payments
- Limited configuration

### Collector
- Create collections
- View own data
- Submit payments
- Basic reports

## 📊 Database Schema

### Core Tables

1. **users**: User authentication and roles
2. **suppliers**: Supplier master data
3. **products**: Product catalog
4. **rates**: Time-versioned product rates
5. **collections**: Daily collection records
6. **payments**: Payment transactions
7. **sync_queue**: Synchronization queue

### Relationships

- Suppliers → Collections (one-to-many)
- Suppliers → Payments (one-to-many)
- Products → Collections (one-to-many)
- Products → Rates (one-to-many)
- Rates → Collections (one-to-many)

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

## 📝 API Documentation

### Authentication

#### POST /api/v1/auth/login
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1Q...",
  "user": {...},
  "expires_in": 3600
}
```

### Synchronization

#### POST /api/v1/sync
```json
{
  "device_id": "device-uuid",
  "last_sync_at": "2024-01-01T00:00:00Z",
  "entity_types": ["suppliers", "products", "collections"],
  "batch": [
    {
      "entity_type": "collections",
      "operation": "create",
      "data": {...}
    }
  ]
}
```

### Resources

Standard REST endpoints:
- GET /api/v1/suppliers
- POST /api/v1/suppliers
- GET /api/v1/suppliers/{id}
- PUT /api/v1/suppliers/{id}
- DELETE /api/v1/suppliers/{id}

Similar for: products, rates, collections, payments

## 🚀 Deployment

### Backend Deployment

1. Set production environment:
```env
APP_ENV=production
APP_DEBUG=false
```

2. Configure HTTPS
3. Set strong JWT secrets
4. Configure database backups
5. Enable rate limiting
6. Set up monitoring

### Frontend Deployment

1. Build for production:
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

2. Submit to stores:
```bash
eas submit
```

## 📈 Performance Optimization

- Indexed database queries
- Pagination (50 items per page)
- Batch sync operations (100 items)
- Query optimization with eager loading
- Connection pooling
- Caching strategies

## 🔧 Configuration

### Backend Configuration
- `config/jwt.php`: JWT settings
- `config/sync.php`: Sync configuration
- `.env`: Environment variables

### Frontend Configuration
- `app.json`: Expo configuration
- `src/data/config.ts`: App settings
- `.env`: Environment variables

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues and questions:
- GitHub Issues
- Documentation
- Community Forums

## ✨ Key Features Summary

✅ **Offline-First**: Works without internet, syncs when connected
✅ **Real-Time Sync**: Automatic synchronization with conflict resolution
✅ **Secure**: End-to-end encryption and authentication
✅ **Scalable**: Clean architecture with separation of concerns
✅ **Production-Ready**: Complete implementation with zero technical debt
✅ **Multi-User**: Concurrent access with conflict detection
✅ **Auditable**: Complete transaction history and versioning
✅ **Zero Data Loss**: Guaranteed data integrity across all operations

---

**Built with ❤️ using React Native (Expo) and Laravel**
