# CollectPay Setup Guide

Complete step-by-step guide to set up and run the CollectPay application.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [First Run](#first-run)
5. [Troubleshooting](#troubleshooting)

## System Requirements

### Backend Requirements
- **PHP**: 8.1 or higher
- **Composer**: Latest version
- **Database**: MySQL 5.7+ or MariaDB 10.3+
- **Web Server**: Nginx or Apache
- **Memory**: Minimum 512MB RAM
- **Storage**: 1GB free space

### Frontend Requirements
- **Node.js**: 18 or higher
- **npm**: 9 or higher
- **Expo CLI**: Latest version
- **Mobile Device** or **Emulator**:
  - Android: Android Studio with Android 6.0+ emulator
  - iOS: Xcode with iOS 13+ simulator (macOS only)

### Development Tools (Recommended)
- **IDE**: VS Code, PHPStorm, or similar
- **Git**: For version control
- **Postman**: For API testing

## Backend Setup

### Step 1: Install PHP and Extensions

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y php8.1 php8.1-cli php8.1-fpm php8.1-mysql \
  php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip php8.1-bcmath
```

#### macOS (using Homebrew)
```bash
brew install php@8.1
brew install composer
```

#### Windows
Download and install PHP from [windows.php.net](https://windows.php.net/download)

### Step 2: Install Composer

```bash
# Download installer
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"

# Install
php composer-setup.php

# Move to global location
sudo mv composer.phar /usr/local/bin/composer

# Verify
composer --version
```

### Step 3: Install MySQL

#### Ubuntu/Debian
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

#### macOS
```bash
brew install mysql
brew services start mysql
```

#### Windows
Download from [dev.mysql.com](https://dev.mysql.com/downloads/installer/)

### Step 4: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE collectpay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional but recommended)
CREATE USER 'collectpay'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON collectpay.* TO 'collectpay'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Configure Backend

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
```

### Step 6: Update .env File

Edit `backend/.env`:

```env
APP_NAME=CollectPay
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=collectpay
DB_USERNAME=collectpay
DB_PASSWORD=your_password

JWT_SECRET=(auto-generated)
JWT_TTL=60
```

### Step 7: Run Migrations

```bash
# Run database migrations
php artisan migrate

# Optional: Seed with sample data
php artisan db:seed
```

### Step 8: Start Backend Server

```bash
# Development server
php artisan serve

# Server will start at http://localhost:8000
```

### Step 9: Test Backend API

```bash
# Health check
curl http://localhost:8000/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T10:00:00+00:00"}
```

## Frontend Setup

### Step 1: Install Node.js

#### Ubuntu/Debian
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### macOS
```bash
brew install node@18
```

#### Windows
Download from [nodejs.org](https://nodejs.org/)

### Step 2: Verify Installation

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show v9.x.x or higher
```

### Step 3: Install Expo CLI

```bash
npm install -g expo-cli
```

### Step 4: Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Step 5: Configure Frontend

```bash
# Copy environment file
cp .env.example .env
```

Edit `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_ENCRYPTION_KEY=your-secure-key-change-in-production
```

**Note for physical devices**: Replace `localhost` with your computer's IP address:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api/v1
```

### Step 6: Start Frontend Development Server

```bash
npm start
```

This will:
1. Start the Metro bundler
2. Open Expo DevTools in your browser
3. Show QR code for device scanning

### Step 7: Run on Device or Emulator

#### Option A: Physical Device

1. **Install Expo Go** on your device:
   - [Android: Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS: App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scan QR Code**:
   - Android: Use Expo Go app to scan QR code
   - iOS: Use Camera app to scan QR code

#### Option B: Android Emulator

```bash
# Make sure Android Studio is installed and emulator is running
npm run android
```

#### Option C: iOS Simulator (macOS only)

```bash
# Make sure Xcode is installed
npm run ios
```

## First Run

### Backend First Run

1. **Start the backend server**:
```bash
cd backend
php artisan serve
```

2. **Create admin user** (via API or database):
```bash
# Using tinker
php artisan tinker

# In tinker:
$user = new App\Models\User();
$user->name = 'Admin User';
$user->email = 'admin@collectpay.local';
$user->password = bcrypt('admin123');
$user->role = 'admin';
$user->is_active = true;
$user->save();
exit;
```

### Frontend First Run

1. **Start the frontend**:
```bash
cd frontend
npm start
```

2. **Login with created credentials**:
   - Email: admin@collectpay.local
   - Password: admin123

3. **First sync will initialize**:
   - Local database will be created
   - Initial data will sync from server
   - Network monitoring will start

## Troubleshooting

### Backend Issues

#### Issue: "PDO driver not found"
```bash
# Solution: Install PHP MySQL extension
sudo apt install php8.1-mysql
# Restart PHP-FPM
sudo systemctl restart php8.1-fpm
```

#### Issue: "Class 'Redis' not found"
```bash
# Solution: Install Redis extension
sudo apt install php8.1-redis
```

#### Issue: Migration fails
```bash
# Solution: Clear cache and retry
php artisan config:clear
php artisan cache:clear
php artisan migrate:fresh
```

#### Issue: Permission denied on storage
```bash
# Solution: Fix permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Frontend Issues

#### Issue: "Unable to resolve module"
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

#### Issue: "Expo Go not connecting"
**Solution**: Ensure both devices are on the same network
```bash
# Get your IP address
# macOS/Linux
ifconfig | grep "inet "
# Windows
ipconfig

# Update .env with correct IP
EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api/v1
```

#### Issue: "Database not initialized"
**Solution**: The app will auto-initialize on first run. If it fails:
```bash
# Clear app data on device and restart
# Or reinstall the app
```

#### Issue: "Network request failed"
**Solutions**:
1. Check backend server is running
2. Verify API URL in `.env`
3. Check firewall settings
4. For Android emulator, use `10.0.2.2` instead of `localhost`

### Network Issues

#### Backend not accessible from mobile device

1. **Check firewall**:
```bash
# Ubuntu/Linux
sudo ufw allow 8000/tcp

# macOS
# System Preferences > Security & Privacy > Firewall
```

2. **Use correct IP address**:
```bash
# Find your local IP
ip addr show | grep inet  # Linux
ifconfig | grep inet      # macOS
ipconfig                  # Windows
```

3. **Test connectivity**:
```bash
# From mobile device browser
http://YOUR_IP:8000/api/health
```

### Database Issues

#### Connection refused
```bash
# Check MySQL is running
sudo systemctl status mysql

# Start if not running
sudo systemctl start mysql
```

#### Access denied
```bash
# Reset MySQL password
sudo mysql
ALTER USER 'collectpay'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;

# Update .env file with new password
```

## Verification Checklist

- [ ] Backend server running on port 8000
- [ ] Database created and migrations run
- [ ] API health endpoint responding
- [ ] Frontend Metro bundler running
- [ ] Mobile app connects to backend
- [ ] Login functionality works
- [ ] Sync functionality works
- [ ] Network monitoring active
- [ ] Offline mode functional

## Next Steps

After successful setup:

1. **Create test data**: Add suppliers, products, and rates
2. **Test collections**: Create sample collections
3. **Test payments**: Process sample payments
4. **Test sync**: Toggle airplane mode and verify sync
5. **Review logs**: Check for any warnings or errors

## Getting Help

- **Documentation**: `/docs` directory
- **GitHub Issues**: Report bugs and issues
- **API Documentation**: `/docs/API.md`
- **Architecture**: `/docs/ARCHITECTURE.md`

## Development Tips

### Backend Development

```bash
# Watch for changes (requires fswatch)
php artisan serve &
fswatch -o app/ | xargs -n1 -I{} echo "Reloading..."

# Run tests
php artisan test

# Generate API documentation
php artisan route:list
```

### Frontend Development

```bash
# Clear cache
expo start -c

# Run with specific port
expo start --port 19001

# Tunnel for testing (slower but works without network)
expo start --tunnel
```

### Database Management

```bash
# Create new migration
php artisan make:migration create_table_name

# Rollback last migration
php artisan migrate:rollback

# Fresh database with seeds
php artisan migrate:fresh --seed
```

---

**Congratulations!** You have successfully set up CollectPay. Start developing or deploy to production using the deployment guide.
