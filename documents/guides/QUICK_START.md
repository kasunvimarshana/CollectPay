# Quick Start Guide

This guide will help you get the Data Collection and Payment Management System up and running quickly.

## Prerequisites

### Backend
- PHP 8.3 or higher
- Composer 2.x
- SQLite (development) or MySQL/PostgreSQL (production)

### Frontend
- Node.js 18.x or higher
- npm 10.x or higher
- Expo Go app (for mobile testing)

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
composer install
```

### 2. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Create SQLite database file
touch database/database.sqlite
```

### 3. Database Setup
```bash
# Run migrations and seed default data
php artisan migrate:fresh --seed
```

This creates:
- All required database tables
- Default roles (Admin, Manager, Collector, Viewer)
- Test users:
  - Admin: `admin@ledger.com` / `password`
  - Collector: `collector@ledger.com` / `password`

### 4. Start Development Server
```bash
php artisan serve
```

The API will be available at: `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure API URL (Optional)
Create a `.env` file in the frontend directory:
```bash
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

For testing on a physical device, replace `localhost` with your computer's IP address:
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

### 3. Start Expo Development Server
```bash
npm start
```

### 4. Run the App

#### On Physical Device
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. The app will open in Expo Go

#### On Emulator/Simulator
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web browser
npm run web
```

## Testing the Application

### 1. Backend API Testing

Test authentication endpoint:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ledger.com",
    "password": "password"
  }'
```

### 2. Frontend Testing

1. Open the app
2. Login with test credentials:
   - Email: `admin@ledger.com`
   - Password: `password`
3. Navigate through the dashboard

## Troubleshooting

### Backend Issues

**Problem**: Migration errors
```bash
# Reset database
php artisan migrate:fresh --seed --force
```

**Problem**: JWT secret not set
```bash
php artisan jwt:secret
```

**Problem**: Permission denied on database file
```bash
chmod 664 database/database.sqlite
chmod 775 database
```

### Frontend Issues

**Problem**: Network request failed
- Ensure backend is running
- Check API URL configuration
- On physical device, use your computer's IP instead of localhost

**Problem**: Dependencies not installing
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Expo cache issues
```bash
npx expo start --clear
```

## Next Steps

### For Development
1. Review the API documentation: `/backend/API_DOCUMENTATION.md`
2. Check implementation guide: `/IMPLEMENTATION_GUIDE.md`
3. Read the SRS and PRD documents for requirements

### For Production
1. Configure production database (MySQL/PostgreSQL)
2. Set up HTTPS/SSL certificates
3. Configure environment variables
4. Set up backup and monitoring
5. Review security checklist

## Test Credentials

### Admin User
- Email: `admin@ledger.com`
- Password: `password`
- Permissions: Full access to all features

### Collector User
- Email: `collector@ledger.com`
- Password: `password`
- Permissions: Limited to collections and payments

## Default Roles & Permissions

### Administrator
- Full system access
- User management
- Role management
- All CRUD operations

### Manager
- View all data
- Manage collections
- Manage payments
- View reports

### Collector
- Create collections
- View assigned suppliers
- Limited data access

### Viewer
- Read-only access
- View reports
- No modification rights

## API Endpoints Overview

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user

### Resources
- `/api/users` - User management
- `/api/roles` - Role management
- `/api/suppliers` - Supplier management
- `/api/products` - Product management
- `/api/rates` - Rate management
- `/api/collections` - Collection tracking
- `/api/payments` - Payment management

For detailed API documentation, see `/backend/API_DOCUMENTATION.md`

## Database Structure

### Core Tables
- `users` - System users
- `roles` - User roles with permissions
- `suppliers` - Supplier information
- `products` - Product catalog
- `rates` - Product rates (versioned)
- `collections` - Daily collections
- `payments` - Payment records
- `audit_logs` - Audit trail

## Support & Resources

- **Issue Tracker**: GitHub Issues
- **Documentation**: See `/docs` directory
- **API Docs**: `/backend/API_DOCUMENTATION.md`
- **Implementation Guide**: `/IMPLEMENTATION_GUIDE.md`

## Architecture Overview

### Backend (Laravel)
- RESTful API architecture
- JWT authentication
- Clean Architecture principles
- SOLID design patterns

### Frontend (React Native/Expo)
- Clean Architecture
- Context API for state management
- Offline-first capability
- SQLite local storage

## Key Features

- ✅ Multi-user concurrent access
- ✅ Role-based access control
- ✅ Multi-unit quantity tracking
- ✅ Rate versioning
- ✅ Offline data collection
- ✅ Automatic synchronization
- ✅ Audit logging
- ✅ Balance calculations

## Development Tips

1. **API Testing**: Use Postman or similar tools
2. **Database**: Use SQLite for development, migrate to MySQL/PostgreSQL for production
3. **Debugging**: Check Laravel logs in `storage/logs/laravel.log`
4. **Frontend Logs**: Use React Native Debugger or Expo DevTools

## Common Commands

### Backend
```bash
php artisan migrate:fresh --seed  # Reset database
php artisan route:list            # List all routes
php artisan tinker                # Laravel REPL
php artisan queue:work            # Process queued jobs
```

### Frontend
```bash
npm start                         # Start Expo server
npm run android                   # Run on Android
npm run ios                       # Run on iOS
npm run web                       # Run in browser
npx expo start --clear            # Clear cache and start
```

---

**Ready to start development!** 🚀

For detailed information, refer to the full documentation in the repository.

## 🚀 Getting Started in 5 Minutes

This guide will help you get the Data Collection and Payment Management System up and running quickly.

## Prerequisites

Make sure you have the following installed:
- **PHP 8.3+** - [Download](https://www.php.net/downloads)
- **Composer 2.x** - [Download](https://getcomposer.org/download/)
- **Node.js 20.x+** - [Download](https://nodejs.org/)
- **npm 10.x+** (comes with Node.js)

## Backend Setup (5 minutes)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# The default configuration uses SQLite which is perfect for development
# No additional database setup needed!
```

### 4. Set Up Database
```bash
# Run migrations and seed test data
php artisan migrate:fresh --seed
```

This creates:
- All database tables
- 4 roles (admin, manager, collector, viewer)
- 2 test users:
  - **Admin:** admin@ledger.com / password
  - **Collector:** collector@ledger.com / password

### 5. Start Development Server
```bash
php artisan serve
```

The API is now running at: **http://localhost:8000**

## Test the API

### 1. Test Login Endpoint
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ledger.com",
    "password": "password"
  }'
```

You should receive a response with a JWT token:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### 2. Test Protected Endpoint
```bash
# Replace YOUR_TOKEN with the token from login response
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Create a Supplier
```bash
curl -X POST http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Suppliers",
    "code": "SUP001",
    "contact_person": "John Doe",
    "phone": "+1234567890",
    "region": "North",
    "is_active": true
  }'
```

## Frontend Setup (5 minutes)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Expo Development Server
```bash
npm start
```

### 4. Run the App
- **On Physical Device:** Install "Expo Go" app and scan the QR code
- **On Android Emulator:** Press `a` in the terminal
- **On iOS Simulator:** Press `i` in the terminal (macOS only)
- **In Web Browser:** Press `w` in the terminal

## Common Commands

### Backend
```bash
# Run migrations
php artisan migrate

# Refresh database (drops all tables and re-runs migrations)
php artisan migrate:fresh

# Refresh database with test data
php artisan migrate:fresh --seed

# List all routes
php artisan route:list

# Run tests
php artisan test

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Frontend
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in web browser
npm run web

# Clear cache and restart
npm start --clear
```

## API Testing with Postman

1. **Import Collection:**
   - See `backend/API_DOCUMENTATION.md` for all endpoints
   - Base URL: `http://localhost:8000/api`

2. **Authentication:**
   - First, login to get a token
   - Add token to requests: `Authorization: Bearer {token}`

3. **Test Endpoints:**
   - Start with authentication endpoints
   - Then try CRUD operations on suppliers
   - Test with the other resources

## Project Structure

```
ledger/
├── backend/                 # Laravel backend
│   ├── app/
│   │   ├── Models/         # Eloquent models
│   │   └── Http/
│   │       └── Controllers/
│   │           └── API/    # API controllers
│   ├── database/
│   │   ├── migrations/     # Database migrations
│   │   └── seeders/        # Database seeders
│   ├── routes/
│   │   └── api.php        # API routes
│   └── API_DOCUMENTATION.md
│
├── frontend/               # React Native frontend
│   ├── App.tsx
│   ├── assets/
│   └── package.json
│
└── Documentation
    ├── README.md              # Project overview
    ├── IMPLEMENTATION_GUIDE.md # Architecture guide
    ├── PROJECT_STATUS.md       # Current status
    └── QUICK_START.md         # This file
```

## Default Test Credentials

Use these credentials to test the application:

| Role      | Email                   | Password  | Permissions            |
|-----------|-------------------------|-----------|------------------------|
| Admin     | admin@ledger.com       | password  | Full access            |
| Collector | collector@ledger.com   | password  | Collections only       |

## Next Steps

### For Developers
1. Read `IMPLEMENTATION_GUIDE.md` for architecture details
2. Check `backend/API_DOCUMENTATION.md` for API reference
3. Review `PROJECT_STATUS.md` to see what needs to be done
4. Start implementing remaining controllers (use SupplierController as template)

### For Testers
1. Test all authentication flows
2. Test supplier CRUD operations
3. Try creating collections and payments
4. Test balance calculations

### For Project Managers
1. Review `PROJECT_STATUS.md` for progress
2. Check the roadmap in the main README
3. See remaining tasks in implementation guide

## Troubleshooting

### Backend Issues

**Problem:** "Class 'Tymon\JWTAuth\...' not found"
```bash
composer dump-autoload
```

**Problem:** Database errors
```bash
# Reset database
php artisan migrate:fresh --seed
```

**Problem:** "JWT secret not set"
```bash
# Regenerate JWT secret
php artisan jwt:secret
```

### Frontend Issues

**Problem:** Metro bundler errors
```bash
# Clear cache and restart
npm start --clear
```

**Problem:** Package errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Expo issues
```bash
# Update Expo CLI
npm install -g expo-cli
```

## Support

- **API Documentation:** `backend/API_DOCUMENTATION.md`
- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md`
- **Project Status:** `PROJECT_STATUS.md`
- **Requirements:** `SRS.md`, `PRD.md`

## Tips

1. **Use Postman** for API testing - it's easier than curl
2. **Check logs** when something goes wrong:
   - Backend: `backend/storage/logs/laravel.log`
3. **Database file** is at: `backend/database/database.sqlite`
4. **JWT tokens** expire after 60 minutes by default
5. Use `php artisan tinker` to interact with models directly

## Development Workflow

1. **Start Backend:** `cd backend && php artisan serve`
2. **Start Frontend:** `cd frontend && npm start`
3. **Make Changes:** Edit code in your favorite editor
4. **Test:** Use Postman or frontend app
5. **Commit:** Use git to track changes

---

**🎉 You're all set! Happy coding!**

If you encounter any issues, check the documentation files or review the error logs.
