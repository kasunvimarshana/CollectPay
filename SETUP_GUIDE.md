# Paywise Setup Guide

**Version:** 1.0  
**Last Updated:** December 25, 2025  
**Estimated Setup Time:** 30-45 minutes

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Backend Setup](#detailed-backend-setup)
4. [Detailed Frontend Setup](#detailed-frontend-setup)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Testing the Installation](#testing-the-installation)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Prerequisites

### System Requirements

**Backend Requirements:**
- PHP 8.2 or higher
- Composer 2.x
- SQLite (included) or MySQL 8.0+ / PostgreSQL 13+
- Apache or Nginx web server (for production)

**Frontend Requirements:**
- Node.js 18.x or higher
- npm 9.x or higher
- iOS Simulator (for macOS) or Android Emulator
- Expo CLI (auto-installed with dependencies)

**Optional:**
- Git 2.x or higher
- Docker and Docker Compose (for containerized deployment)
- Postman or Insomnia (for API testing)

### Check Your Environment

Run these commands to verify your setup:

```bash
# Check PHP version
php --version

# Check Composer
composer --version

# Check Node.js
node --version

# Check npm
npm --version

# Check Git
git --version
```

---

## Quick Start

For experienced developers who want to get up and running quickly:

```bash
# 1. Clone the repository
git clone https://github.com/kasunvimarshana/Paywise.git
cd Paywise

# 2. Backend setup
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
# Backend will be available at http://localhost:8000

# 3. Frontend setup (in a new terminal)
cd ../frontend
npm install
npm start
# Follow on-screen instructions to open app
```

**Default Login:**
- Email: `admin@paywise.com`
- Password: `password`

---

## Detailed Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
composer install
```

This will install Laravel and all required PHP packages. The process may take 2-5 minutes depending on your internet connection.

**What gets installed:**
- Laravel Framework 11.x
- Laravel Sanctum (API authentication)
- PHPUnit (testing framework)
- Various Laravel utilities

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

**Edit `.env` file** with your preferred settings:

```env
APP_NAME=Paywise
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database configuration
DB_CONNECTION=sqlite
# For SQLite, no additional DB config needed

# For MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=paywise
# DB_USERNAME=root
# DB_PASSWORD=

# Seed password (used for initial users)
SEED_DEFAULT_PASSWORD=password
```

### Step 3: Setup Database

**For SQLite (Default):**
```bash
# Create database file
touch database/database.sqlite

# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed
```

**For MySQL/PostgreSQL:**
```bash
# Create database first
mysql -u root -p
CREATE DATABASE paywise;
EXIT;

# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed
```

**What gets created:**
- 10 database tables
- 3 default users (admin, manager, collector)
- All necessary indexes and constraints

### Step 4: Start Development Server

```bash
php artisan serve
```

**Verify backend is running:**
- Open browser to `http://localhost:8000`
- You should see Laravel welcome page
- API is available at `http://localhost:8000/api`

**Test API:**
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"ok"}
```

---

## Detailed Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This installs React Native, Expo, and all dependencies. Takes 3-7 minutes.

**What gets installed:**
- Expo SDK
- React Navigation
- Axios (HTTP client)
- AsyncStorage
- React Native Picker
- Other UI components

### Step 2: Configure API Connection

**Edit `src/api/client.js`:**

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
// For physical device, use your computer's IP:
// const API_BASE_URL = 'http://192.168.1.100:8000/api';
```

**For Android Emulator:**
```javascript
const API_BASE_URL = 'http://10.0.2.2:8000/api';
```

**For iOS Simulator:**
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Step 3: Start Expo Development Server

```bash
npm start
```

This opens the Expo Developer Tools in your browser.

**Options:**
- Press `i` - Open iOS Simulator (macOS only)
- Press `a` - Open Android Emulator
- Press `w` - Open in web browser
- Scan QR code with Expo Go app on your phone

### Step 4: Test the App

1. **Login Screen:** Should appear on app start
2. **Enter credentials:**
   - Email: `admin@paywise.com`
   - Password: `password`
3. **Home Screen:** Should show after successful login
4. **Navigation:** Test navigating to Suppliers, Products, etc.

---

## Environment Configuration

### Backend Environment Variables

**Essential Variables:**

```env
# Application
APP_NAME=Paywise
APP_ENV=local          # local, staging, production
APP_DEBUG=true         # false in production
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=sqlite   # sqlite, mysql, pgsql
DB_DATABASE=/absolute/path/to/database.sqlite

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1

# CORS
FRONTEND_URL=http://localhost:19006

# Seed Data
SEED_DEFAULT_PASSWORD=password
```

**Optional Variables:**

```env
# Mail (for password resets)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=

# Queue
QUEUE_CONNECTION=database  # database, redis, sync

# Cache
CACHE_DRIVER=file          # file, redis, database

# Session
SESSION_DRIVER=file        # file, cookie, database
```

### Frontend Environment Variables

Create `.env` in frontend directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Database Setup

### SQLite Setup (Recommended for Development)

**Advantages:**
- No installation required
- Single file database
- Easy to reset
- Fast for development

**Setup:**
```bash
cd backend
touch database/database.sqlite
php artisan migrate
php artisan db:seed
```

**Reset database:**
```bash
php artisan migrate:fresh --seed
```

### MySQL Setup

**Install MySQL:**
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS (with Homebrew)
brew install mysql
brew services start mysql
```

**Create Database:**
```bash
mysql -u root -p
CREATE DATABASE paywise CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'paywise'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON paywise.* TO 'paywise'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Configure .env:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paywise
DB_USERNAME=paywise
DB_PASSWORD=password
```

**Run migrations:**
```bash
php artisan migrate
php artisan db:seed
```

### PostgreSQL Setup

**Install PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS (with Homebrew)
brew install postgresql@15
brew services start postgresql@15
```

**Create Database:**
```bash
sudo -u postgres psql
CREATE DATABASE paywise;
CREATE USER paywise WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE paywise TO paywise;
\q
```

**Configure .env:**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=paywise
DB_USERNAME=paywise
DB_PASSWORD=password
```

**Run migrations:**
```bash
php artisan migrate
php artisan db:seed
```

---

## Testing the Installation

### Backend Tests

```bash
cd backend

# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test file
php artisan test tests/Feature/SupplierApiTest.php

# Run specific test method
php artisan test --filter testCanCreateSupplier
```

**Expected Output:**
```
Tests:    48 passed (127 assertions)
Duration: 2.34s
```

### Frontend Manual Testing

**Checklist:**
- [ ] Login screen loads
- [ ] Can login with admin credentials
- [ ] Home screen shows navigation cards
- [ ] Suppliers list loads
- [ ] Can create new supplier
- [ ] Products list loads
- [ ] Can create new product with rate
- [ ] Collections list loads
- [ ] Can create new collection
- [ ] Payments list loads
- [ ] Can create new payment
- [ ] Logout works

### API Testing with cURL

**Health Check:**
```bash
curl http://localhost:8000/api/health
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paywise.com","password":"password","device_name":"test"}'
```

**Get Suppliers (requires token):**
```bash
curl http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Backend Issues

**Issue: "vendor/autoload.php not found"**
```bash
# Solution: Install dependencies
cd backend
composer install
```

**Issue: "No application encryption key has been specified"**
```bash
# Solution: Generate key
php artisan key:generate
```

**Issue: "Database does not exist"**
```bash
# For SQLite
touch database/database.sqlite
php artisan migrate

# For MySQL/PostgreSQL
# Create database first, then run migrations
```

**Issue: "Permission denied" on storage**
```bash
# Solution: Fix permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

**Issue: "Tests failing"**
```bash
# Solution: Check test database configuration
cp .env .env.testing
# Edit .env.testing to use separate test database
php artisan test
```

### Frontend Issues

**Issue: "node_modules not found"**
```bash
# Solution: Install dependencies
cd frontend
npm install
```

**Issue: "Can't connect to API"**
```bash
# Solution: Check API URL in src/api/client.js
# For physical device, use your computer's local IP
# For Android emulator, use http://10.0.2.2:8000/api
# For iOS simulator, use http://localhost:8000/api
```

**Issue: "Expo app crashes on start"**
```bash
# Solution: Clear cache and reinstall
npm start -- --clear
# Or
rm -rf node_modules
npm install
npm start
```

**Issue: "Login fails with 401"**
```bash
# Check backend is running: http://localhost:8000
# Verify credentials are correct
# Check API URL matches backend URL
```

### Common Issues

**Issue: Port 8000 already in use**
```bash
# Solution: Use different port
php artisan serve --port=8080

# Update frontend API URL accordingly
```

**Issue: CORS errors in browser**
```bash
# Solution: Configure CORS in backend
# Edit config/cors.php
# Add frontend URL to allowed origins
```

---

## Next Steps

### After Successful Setup

1. **Read Documentation:**
   - [API Documentation](backend/API_DOCUMENTATION.md)
   - [Architecture Guide](ARCHITECTURE.md)
   - [Testing Guide](TESTING_GUIDE.md)

2. **Explore the Code:**
   - Backend controllers in `backend/app/Http/Controllers/Api`
   - Frontend screens in `frontend/src/screens`
   - Database migrations in `backend/database/migrations`

3. **Try Features:**
   - Create suppliers
   - Add products with rates
   - Record collections
   - Manage payments
   - Test with multiple users

4. **Run Tests:**
   - Execute backend test suite
   - Verify all tests pass
   - Check code coverage

5. **Customize:**
   - Update branding in frontend
   - Modify business logic as needed
   - Add custom features
   - Configure for production

### Development Workflow

```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: Testing
cd backend
php artisan test --filter YourTest
```

### Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for:
- Server setup
- SSL configuration
- Database optimization
- Security hardening
- Monitoring setup
- CI/CD pipeline

---

## Support

**Documentation:**
- [README](README.md)
- [Architecture](ARCHITECTURE.md)
- [API Documentation](backend/API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

**Testing:**
- Run `php artisan test` for backend
- Check logs in `backend/storage/logs`

**Need Help?**
- Review documentation thoroughly
- Check troubleshooting section above
- Verify all prerequisites are met
- Ensure environment is configured correctly

---

**Setup Status:** Production Ready ✅  
**Last Updated:** December 25, 2025  
**Tested On:** PHP 8.2, Node.js 18, Laravel 11, Expo SDK 50
