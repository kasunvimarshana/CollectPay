# PayMaster - Quick Setup Guide

This guide will help you set up and run the PayMaster application locally for development.

## Prerequisites

### Backend
- PHP 8.1 or higher
- Composer
- MySQL 8.0 or MariaDB 10.5+
- Web server (Apache/Nginx) or use PHP built-in server

### Frontend
- Node.js 18 or higher
- npm or yarn
- Expo CLI (optional, but recommended)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/kasunvimarshana/PayMaster.git
cd PayMaster
```

### 2. Backend Setup

#### 2.1 Install Dependencies

```bash
cd backend
composer install
```

#### 2.2 Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure your database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paymaster
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### 2.3 Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE paymaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 2.4 Run Migrations

```bash
# If using Laravel migrations (if available)
php artisan migrate

# Or manually run SQL files in order
mysql -u your_username -p paymaster < database/migrations/001_create_users_table.sql
mysql -u your_username -p paymaster < database/migrations/002_create_suppliers_table.sql
mysql -u your_username -p paymaster < database/migrations/003_create_products_table.sql
mysql -u your_username -p paymaster < database/migrations/004_create_product_rates_table.sql
mysql -u your_username -p paymaster < database/migrations/005_create_collections_table.sql
mysql -u your_username -p paymaster < database/migrations/006_create_payments_table.sql
mysql -u your_username -p paymaster < database/migrations/007_create_sync_logs_table.sql
```

#### 2.5 Seed Sample Data (Optional)

```bash
# For testing and development
mysql -u your_username -p paymaster < database/seeds/sample_data.sql
```

#### 2.6 Start Backend Server

```bash
# Using PHP built-in server
php -S localhost:8000 -t public

# Or using Laravel artisan (if available)
php artisan serve

# Or configure Apache/Nginx to point to the public directory
```

Backend should now be running at `http://localhost:8000`

### 3. Frontend Setup

#### 3.1 Install Dependencies

```bash
cd ../frontend
npm install
```

#### 3.2 Configure API Endpoint

Edit `src/config/app.config.ts`:

```typescript
const ENV = {
  development: {
    apiBaseUrl: 'http://localhost:8000/api',
    // ... other config
  },
};
```

If testing on a physical device, replace `localhost` with your computer's IP address:
```typescript
apiBaseUrl: 'http://192.168.1.100:8000/api',
```

#### 3.3 Start Development Server

```bash
npm start
```

This will start the Expo development server. You'll see a QR code in the terminal.

#### 3.4 Run on Device

**Option 1: Using Expo Go (Easiest)**
1. Install Expo Go on your iOS or Android device
2. Scan the QR code from the terminal
3. The app will load on your device

**Option 2: Using Emulator**
- For Android: Press `a` in the terminal
- For iOS: Press `i` in the terminal
- For Web: Press `w` in the terminal

## Testing the Application

### Backend API Testing

You can test the API using curl, Postman, or any HTTP client:

```bash
# Test health check (if implemented)
curl http://localhost:8000/api/health

# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@paymaster.com",
    "password": "password123"
  }'
```

### Sample Credentials (from seed data)

- **Admin**: admin@paymaster.com / password123
- **Manager**: manager@paymaster.com / password123
- **Collector**: collector@paymaster.com / password123

## Troubleshooting

### Backend Issues

**Problem**: Database connection error
- Check database credentials in `.env`
- Ensure MySQL is running
- Verify database exists

**Problem**: 404 errors on API routes
- Check that rewrite rules are configured correctly
- Ensure the `public` directory is the document root

**Problem**: CORS errors
- Check `CORS_ALLOWED_ORIGINS` in `.env`
- Add your frontend URL to allowed origins

### Frontend Issues

**Problem**: Cannot connect to backend
- Ensure backend server is running
- Check API URL in config
- If using physical device, use computer's IP instead of localhost
- Check firewall settings

**Problem**: Expo Go not loading
- Ensure phone and computer are on the same network
- Try restarting Expo development server
- Check if port 19000 is available

**Problem**: Database errors on mobile
- Clear app data
- Uninstall and reinstall app
- Check SQLite initialization code

## Next Steps

### Development

1. **Read Documentation**
   - Backend: `backend/README.md`
   - Frontend: `frontend/README.md`
   - Implementation Guide: `IMPLEMENTATION_GUIDE.md`

2. **Explore the Code**
   - Start with domain entities
   - Review use cases and services
   - Understand the architecture

3. **Make Changes**
   - Follow Clean Architecture principles
   - Write tests for new features
   - Update documentation

### Production Deployment

1. **Backend**
   - Deploy to production server (VPS, cloud, etc.)
   - Configure production database
   - Set up HTTPS with SSL certificate
   - Configure environment variables for production
   - Set up automated backups
   - Configure logging and monitoring

2. **Frontend**
   - Build production app using Expo EAS Build
   - Submit to App Store (iOS) and Play Store (Android)
   - Or distribute as standalone APK/IPA

## Support

- Read the documentation thoroughly
- Check troubleshooting section
- Review code comments
- Check issue tracker on GitHub

## Important Notes

- **Security**: Change default passwords before production
- **Environment**: Use different `.env` files for different environments
- **Backups**: Always backup database before major changes
- **Testing**: Test thoroughly before deploying to production
- **Updates**: Keep dependencies updated for security

## Quick Commands Reference

### Backend
```bash
# Start server
php -S localhost:8000 -t public

# Run tests (if configured)
phpunit

# Check logs
tail -f storage/logs/laravel.log
```

### Frontend
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Clear cache
expo start -c
```

## Architecture Overview

```
Mobile App (React Native)
    ↓ HTTPS
Backend API (Laravel)
    ↓
Database (MySQL)
```

**Offline Mode**:
```
Mobile App → Local SQLite → Sync Queue → Backend API (when online)
```

---

**You're all set! Start developing with PayMaster.**
