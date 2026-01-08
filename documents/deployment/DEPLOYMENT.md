# Production Deployment Guide

## Data Collection and Payment Management System

This guide provides step-by-step instructions for deploying the system to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Post-Deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Backend Requirements
- PHP 8.3 or higher
- Composer 2.x
- MySQL 8.0+ or PostgreSQL 14+
- Web server (Apache/Nginx)
- SSL certificate for HTTPS

### Frontend Requirements
- Node.js 20.x or higher
- npm 10.x or higher
- Expo CLI
- iOS/Android development environment (optional)

---

## Backend Deployment

### 1. Server Setup

```bash
# Clone repository
git clone https://github.com/your-org/your-repo.git
cd your-repo/backend

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Set proper permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 2. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit .env with production values
nano .env
```

Configure the following critical settings:

```env
APP_NAME="Ledger"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=ledger_production
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password

JWT_SECRET=your-very-long-random-secret-key
JWT_TTL=60
JWT_REFRESH_TTL=20160

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 3. Database Setup

```bash
# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate --force

# Seed initial data (roles, etc.)
php artisan db:seed --class=RoleSeeder

# Create admin user (optional)
php artisan tinker
>>> User::create([
    'name' => 'Administrator',
    'email' => 'admin@yourcompany.com',
    'password' => Hash::make('secure-password-here'),
    'role_id' => 1,
    'is_active' => true
]);
```

### 4. Optimization

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### 5. Web Server Configuration

#### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;
    root /var/www/ledger/backend/public;

    # SSL Configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    # Index files
    index index.php;

    charset utf-8;

    # Laravel routing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to hidden files
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/ledger/backend/public

    <Directory /var/www/ledger/backend/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/fullchain.pem
    SSLCertificateKeyFile /path/to/privkey.pem

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/ledger-error.log
    CustomLog ${APACHE_LOG_DIR}/ledger-access.log combined
</VirtualHost>
```

---

## Frontend Deployment

### 1. Configure Environment

```bash
cd frontend

# Create .env file
cp .env.example .env

# Edit with production API URL
nano .env
```

Update `.env`:

```env
EXPO_PUBLIC_API_URL=https://your-domain.com/api
EXPO_PUBLIC_APP_NAME=Ledger
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENV=production
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Options

#### Option A: Expo Build Service (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both
eas build --platform all
```

#### Option B: Local Build

```bash
# Android
npm run android:build

# iOS (requires macOS)
npm run ios:build
```

### 4. Distribute App

#### Android (Google Play)
1. Download APK/AAB from Expo or local build
2. Create Play Store listing
3. Upload to Play Console
4. Complete store listing
5. Submit for review

#### iOS (App Store)
1. Download IPA from Expo or local build
2. Create App Store Connect listing
3. Upload via Transporter
4. Complete app information
5. Submit for review

#### Internal Distribution (for testing)
```bash
# Create development build
eas build --profile development --platform android

# Share link or APK with team
```

---

## Post-Deployment

### 1. Security Checklist

- [ ] HTTPS enabled and forced
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] JWT secrets are long and random
- [ ] File permissions set correctly
- [ ] Debug mode disabled
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers added

### 2. Monitoring Setup

```bash
# Set up Laravel Horizon (for queue monitoring)
php artisan horizon:install

# Configure supervisor for Horizon
sudo nano /etc/supervisor/conf.d/horizon.conf
```

Supervisor configuration:

```ini
[program:horizon]
process_name=%(program_name)s
command=php /var/www/ledger/backend/artisan horizon
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/ledger/backend/storage/logs/horizon.log
stopwaitsecs=3600
```

### 3. Backup Strategy

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u username -p password ledger_production > /backups/ledger_$DATE.sql
```

### 4. Performance Optimization

```bash
# Enable OPcache in php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000

# Redis configuration (NOTE: CLI changes are temporary; add to redis.conf for persistence)
redis-cli config set maxmemory 256mb
redis-cli config set maxmemory-policy allkeys-lru

# For persistent Redis configuration, edit /etc/redis/redis.conf:
# maxmemory 256mb
# maxmemory-policy allkeys-lru
```

### 5. Testing Production

```bash
# Test API endpoints
curl https://your-domain.com/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourcompany.com","password":"your-password"}'

# Test mobile app
# Install app on device and perform:
# - Login/logout
# - Create/read/update/delete operations
# - Offline sync
# - Payment calculations
```

---

## Troubleshooting

### Common Issues

#### 1. "500 Internal Server Error"
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Check web server logs
sudo tail -f /var/log/nginx/error.log  # Nginx
sudo tail -f /var/log/apache2/error.log  # Apache

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

#### 2. Database Connection Issues
```bash
# Test database connection
php artisan tinker
>>> DB::connection()->getPdo();

# Check credentials
php artisan config:show database
```

#### 3. JWT Authentication Failures
```bash
# Regenerate JWT secret
php artisan jwt:secret --force

# Clear config cache
php artisan config:clear
```

#### 4. Frontend Cannot Connect to API
```env
# Ensure API URL is correct in frontend/.env
EXPO_PUBLIC_API_URL=https://your-domain.com/api

# Check CORS in backend/config/cors.php
'allowed_origins' => ['*'],  # For testing only
```

#### 5. File Permission Errors
```bash
# Fix Laravel permissions
sudo chown -R www-data:www-data /var/www/ledger/backend
sudo chmod -R 775 /var/www/ledger/backend/storage
sudo chmod -R 775 /var/www/ledger/backend/bootstrap/cache
```

---

## Maintenance

### Regular Tasks

```bash
# Update dependencies (monthly)
composer update
npm update

# Database backup (daily)
php artisan backup:run

# Clean old logs (weekly)
php artisan log:clear --days=30

# Clear expired sessions (weekly)
php artisan session:flush
```

### Health Checks

```bash
# Check disk space
df -h

# Check memory usage
free -m

# Check database size
mysql -u root -p -e "SELECT table_schema AS 'Database', 
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
  FROM information_schema.TABLES 
  WHERE table_schema = 'ledger_production';"

# Monitor processes
top
htop
```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/kasunvimarshana/ledger/issues
- Email: support@yourcompany.com

---

**Last Updated:** December 2025
**Version:** 1.0.0
