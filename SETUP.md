# Setup Guide

This guide will help you set up the Ledgerly Data Collection and Payment Management System from scratch.

## Prerequisites

### Backend Requirements
- PHP 8.1 or higher
- Composer (latest version)
- MySQL 8.0+ or PostgreSQL 13+
- Git

### Frontend Requirements
- Node.js 18 or higher
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio (for emulator)

### Recommended Tools
- VSCode or PHPStorm
- Postman or Insomnia (for API testing)
- TablePlus or phpMyAdmin (for database management)

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kasunvimarshana/Ledgerly.git
cd Ledgerly
```

### 2. Install Backend Dependencies

```bash
cd backend
composer install
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Configure Database

Edit `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ledgerly
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Create Database

```bash
# MySQL
mysql -u root -p
CREATE DATABASE ledgerly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Or PostgreSQL
psql -U postgres
CREATE DATABASE ledgerly;
\q
```

### 6. Run Migrations

```bash
php artisan migrate
```

### 7. Seed Database (Optional)

```bash
php artisan db:seed
```

This will create:
- Admin user (admin@ledgerly.com / password)
- Sample suppliers
- Sample products
- Sample collections

### 8. Start Development Server

```bash
php artisan serve
```

Backend will be available at `http://localhost:8000`

### 9. Test API

```bash
# Health check
curl http://localhost:8000/api/health

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ledgerly.com","password":"password"}'
```

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd ../frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Endpoint

Edit `app.json` to point to your backend:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://localhost:8000"
    }
  }
}
```

**Note**: For physical devices, use your computer's IP address instead of localhost.

### 4. Start Development Server

```bash
npm start
```

This will start Expo Dev Tools in your browser.

### 5. Run on Device/Simulator

**iOS Simulator** (Mac only):
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

**Physical Device**:
1. Install Expo Go app from App Store / Play Store
2. Scan QR code from Expo Dev Tools

### 6. Test Login

Use the default admin credentials:
- Email: `admin@ledgerly.com`
- Password: `password`

## Database Schema Setup

The migrations will create the following tables:

1. **users** - User accounts with RBAC/ABAC
2. **suppliers** - Supplier profiles
3. **products** - Product catalog
4. **product_rates** - Historical product rates
5. **collections** - Collection records
6. **payments** - Payment transactions
7. **audit_logs** - Audit trail

### Database Indexes

All foreign keys are automatically indexed. Additional indexes are created for:
- Frequently queried columns (email, code, name)
- Date range queries (collection_date, payment_date)
- Composite indexes for common query patterns

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All endpoints (except `/auth/login`) require authentication:
```
Authorization: Bearer {token}
```

### Core Endpoints

#### Authentication
```
POST   /auth/login      - Login
POST   /auth/logout     - Logout
POST   /auth/refresh    - Refresh token
```

#### Users
```
GET    /users           - List users
POST   /users           - Create user
GET    /users/{id}      - Get user
PUT    /users/{id}      - Update user
DELETE /users/{id}      - Delete user
```

#### Suppliers
```
GET    /suppliers       - List suppliers
POST   /suppliers       - Create supplier
GET    /suppliers/{id}  - Get supplier
PUT    /suppliers/{id}  - Update supplier
DELETE /suppliers/{id}  - Delete supplier
```

#### Products
```
GET    /products        - List products
POST   /products        - Create product
GET    /products/{id}   - Get product
PUT    /products/{id}   - Update product
DELETE /products/{id}   - Delete product
GET    /products/{id}/rates - Get rate history
```

#### Collections
```
GET    /collections     - List collections
POST   /collections     - Create collection
GET    /collections/{id} - Get collection
PUT    /collections/{id} - Update collection
DELETE /collections/{id} - Delete collection
```

#### Payments
```
GET    /payments        - List payments
POST   /payments        - Create payment
GET    /payments/{id}   - Get payment
PUT    /payments/{id}   - Update payment
DELETE /payments/{id}   - Delete payment
GET    /payments/calculate/{supplierId} - Calculate balance
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test tests/Feature/CollectionTest.php
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Troubleshooting

### Backend Issues

**Issue**: Database connection failed
```bash
# Check credentials in .env
# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

**Issue**: Migration fails
```bash
# Reset database
php artisan migrate:fresh

# Or drop and recreate
php artisan db:wipe
php artisan migrate
```

**Issue**: Permission denied errors
```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
```

### Frontend Issues

**Issue**: Metro bundler error
```bash
# Clear cache
npm start -- --clear
```

**Issue**: Cannot connect to API
```bash
# Check API URL in app.json
# Use IP address instead of localhost for physical devices
# Verify backend is running
```

**Issue**: Expo Go not connecting
```bash
# Ensure device and computer are on same network
# Check firewall settings
# Try tunnel mode: expo start --tunnel
```

## Production Deployment

### Backend Deployment

1. **Choose hosting provider** (DigitalOcean, AWS, Heroku, etc.)

2. **Configure environment**
```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
```

3. **Optimize for production**
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

4. **Setup HTTPS**
   - Install SSL certificate (Let's Encrypt recommended)
   - Configure web server (Nginx/Apache)

5. **Setup queue workers** (optional)
```bash
php artisan queue:work --daemon
```

### Frontend Deployment

#### Build for Production

**iOS** (requires Mac and Apple Developer account):
```bash
expo build:ios
```

**Android**:
```bash
expo build:android
```

#### Using EAS Build (Recommended)

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Security Checklist

- [ ] Change default passwords
- [ ] Set strong APP_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable firewall
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitoring and logging configured

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check system performance

**Weekly**:
- Review audit logs
- Check database backups

**Monthly**:
- Update dependencies
- Security audit
- Performance optimization

### Backup Commands

```bash
# Database backup
mysqldump -u username -p ledgerly > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u username -p ledgerly < backup_20240101.sql
```

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/kasunvimarshana/Ledgerly/issues
- Email: support@ledgerly.com

## Next Steps

1. ✅ Complete backend setup
2. ✅ Complete frontend setup
3. ✅ Test all API endpoints
4. ✅ Test mobile app on device
5. ✅ Review architecture documentation
6. ✅ Customize for your use case
7. ✅ Deploy to production

Congratulations! Your Ledgerly system is now set up and ready to use.
