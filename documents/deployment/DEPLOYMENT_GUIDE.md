# Deployment Guide

## Data Collection and Payment Management System

This comprehensive guide covers deploying the system to various environments.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Security Hardening](#security-hardening)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Backend Requirements
- **PHP**: 8.3 or higher
- **Composer**: 2.x
- **Database**: SQLite (dev), MySQL 8.0+ or PostgreSQL 13+ (production)
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Memory**: Minimum 512MB RAM, recommended 2GB+
- **Storage**: Minimum 1GB free space

### Frontend Requirements
- **Node.js**: 20.x LTS
- **npm**: 10.x
- **Expo CLI**: Latest version
- **Mobile OS**: iOS 13+ or Android 8+

---

## Pre-Deployment Checklist

### Backend Checklist
- [ ] Server meets minimum requirements
- [ ] PHP extensions installed: openssl, pdo, mbstring, tokenizer, xml, ctype, json, bcmath
- [ ] Composer installed globally
- [ ] Database server configured and accessible
- [ ] SSL certificate obtained (for HTTPS)
- [ ] Firewall rules configured
- [ ] Backup strategy in place

### Frontend Checklist
- [ ] Node.js and npm installed
- [ ] Expo account created
- [ ] App store accounts prepared (iOS/Android)
- [ ] API endpoint URL decided
- [ ] Mobile device testing completed

---

## Backend Deployment

### Option 1: Traditional Server (Ubuntu/Debian)

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.3
sudo apt install -y php8.3 php8.3-cli php8.3-fpm php8.3-mysql \
  php8.3-pgsql php8.3-sqlite3 php8.3-mbstring php8.3-xml \
  php8.3-bcmath php8.3-curl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Nginx
sudo apt install -y nginx

# Install MySQL (or PostgreSQL)
sudo apt install -y mysql-server
```

#### 2. Clone and Configure

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/kasunvimarshana/ledger.git
cd ledger/backend

# Set permissions
sudo chown -R www-data:www-data /var/www/ledger
sudo chmod -R 755 /var/www/ledger

# Install dependencies
composer install --optimize-autoloader --no-dev

# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Generate keys
php artisan key:generate
php artisan jwt:secret --force

# Run migrations
php artisan migrate --force

# Seed database (optional, only for initial setup)
php artisan db:seed --class=RoleSeeder

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Generate Swagger documentation
php artisan l5-swagger:generate
```

#### 3. Configure Nginx

```nginx
# /etc/nginx/sites-available/ledger
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ledger/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ledger /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Configure SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Option 2: Docker Deployment

```dockerfile
# backend/Dockerfile
FROM php:8.3-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application
COPY . /var/www

# Install dependencies
RUN composer install --optimize-autoloader --no-dev

# Set permissions
RUN chown -R www-data:www-data /var/www

EXPOSE 9000
CMD ["php-fpm"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: ./backend
    container_name: ledger-app
    restart: unless-stopped
    volumes:
      - ./backend:/var/www
    networks:
      - ledger

  nginx:
    image: nginx:alpine
    container_name: ledger-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./backend:/var/www
      - ./nginx:/etc/nginx/conf.d
    networks:
      - ledger

  db:
    image: mysql:8.0
    container_name: ledger-db
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ledger
      MYSQL_ROOT_PASSWORD: your_password
      MYSQL_USER: ledger
      MYSQL_PASSWORD: your_password
    volumes:
      - dbdata:/var/lib/mysql
    networks:
      - ledger

networks:
  ledger:
    driver: bridge

volumes:
  dbdata:
```

---

## Frontend Deployment

### Option 1: Expo EAS Build (Recommended)

#### 1. Configure EAS

```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure
```

#### 2. Update app.json

```json
{
  "expo": {
    "name": "Ledger",
    "slug": "ledger",
    "version": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

#### 3. Build for Production

```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Submit to app stores
eas submit --platform android
eas submit --platform ios
```

### Option 2: Local Build

#### Android

```bash
cd frontend

# Build APK
expo build:android -t apk

# Build AAB (for Play Store)
expo build:android -t app-bundle
```

#### iOS

```bash
cd frontend

# Build for iOS (requires macOS)
expo build:ios
```

---

## Database Setup

### Production MySQL Setup

```sql
-- Create database
CREATE DATABASE ledger CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'ledger'@'localhost' IDENTIFIED BY 'strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON ledger.* TO 'ledger'@'localhost';
FLUSH PRIVILEGES;
```

### PostgreSQL Setup

```sql
-- Create database
CREATE DATABASE ledger WITH ENCODING 'UTF8';

-- Create user
CREATE USER ledger WITH PASSWORD 'strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ledger TO ledger;
```

---

## Environment Configuration

### Backend (.env)

```env
# Application
APP_NAME="Ledger"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ledger
DB_USERNAME=ledger
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_TTL=3600

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
```

### Frontend (.env)

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://api.your-domain.com/api

# App Configuration
EXPO_PUBLIC_APP_NAME=Ledger
EXPO_PUBLIC_APP_VERSION=1.0.0

# Environment
EXPO_PUBLIC_ENV=production
```

---

## Security Hardening

### Backend Security

1. **Disable Debug Mode**
   ```env
   APP_DEBUG=false
   ```

2. **Use HTTPS Only**
   - Force HTTPS in .env: `APP_URL=https://...`
   - Configure web server for SSL

3. **Secure File Permissions**
   ```bash
   # Laravel directories
   chmod -R 755 /var/www/ledger
   chmod -R 775 storage bootstrap/cache
   chown -R www-data:www-data /var/www/ledger
   ```

4. **Configure Firewall**
   ```bash
   # UFW (Ubuntu)
   sudo ufw allow 22/tcp  # SSH
   sudo ufw allow 80/tcp  # HTTP
   sudo ufw allow 443/tcp # HTTPS
   sudo ufw enable
   ```

5. **Database Security**
   - Use strong passwords
   - Restrict database user privileges
   - Enable SSL connections
   - Regular backups

6. **Rate Limiting**
   - Already configured in Laravel
   - Monitor and adjust in `app/Http/Kernel.php`

### Frontend Security

1. **Secure API Communications**
   - Use HTTPS only
   - Implement certificate pinning (optional)

2. **Secure Storage**
   - Use Expo SecureStore for sensitive data
   - Encrypt local SQLite database

3. **Code Obfuscation**
   - Enable ProGuard (Android)
   - Enable bitcode (iOS)

---

## Monitoring and Maintenance

### Backend Monitoring

1. **Log Monitoring**
   ```bash
   # View logs
   tail -f storage/logs/laravel.log
   
   # Use log management service (recommended)
   # - Papertrail
   # - Loggly
   # - Sentry
   ```

2. **Performance Monitoring**
   - Use Laravel Telescope (development)
   - Use APM tools (production):
     - New Relic
     - Datadog
     - Laravel Forge

3. **Database Backups**
   ```bash
   # MySQL backup script
   #!/bin/bash
   mysqldump -u ledger -p ledger > backup_$(date +%Y%m%d).sql
   gzip backup_$(date +%Y%m%d).sql
   
   # Schedule with cron
   0 2 * * * /path/to/backup.sh
   ```

### Frontend Monitoring

1. **Analytics**
   - Implement Expo Analytics
   - Use Google Analytics for Firebase
   - Monitor user behavior and crashes

2. **Error Tracking**
   - Sentry for error reporting
   - Crashlytics for crash reports

3. **Performance**
   - Monitor app performance metrics
   - Track API response times
   - Monitor offline sync operations

---

## Troubleshooting

### Common Backend Issues

**Issue: 500 Internal Server Error**
```bash
# Check logs
tail -f storage/logs/laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Check permissions
chmod -R 775 storage bootstrap/cache
```

**Issue: Database Connection Failed**
```bash
# Test connection
php artisan tinker
>>> DB::connection()->getPdo();

# Check credentials in .env
# Verify database server is running
```

**Issue: JWT Token Invalid**
```bash
# Regenerate JWT secret
php artisan jwt:secret --force

# Clear cache
php artisan config:clear
```

### Common Frontend Issues

**Issue: API Connection Failed**
- Verify EXPO_PUBLIC_API_URL in .env
- Check network connectivity
- Verify SSL certificate (if HTTPS)
- Check CORS configuration on backend

**Issue: Build Failures**
```bash
# Clear cache
expo start -c

# Clear node_modules
rm -rf node_modules
npm install

# Clear Expo cache
expo prebuild --clean
```

---

## Post-Deployment Verification

### Backend Verification

```bash
# Test API
curl -X POST https://api.your-domain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ledger.com","password":"password"}'

# Check Swagger docs
open https://api.your-domain.com/api/documentation
```

### Frontend Verification

1. Install app on test devices
2. Test authentication flow
3. Test all CRUD operations
4. Test offline mode
5. Test synchronization
6. Verify calculations accuracy

---

## Support and Updates

### Updating the Application

#### Backend Updates

```bash
cd /var/www/ledger/backend

# Backup database
php artisan backup:run

# Pull latest code
git pull origin main

# Update dependencies
composer install --optimize-autoloader --no-dev

# Run migrations
php artisan migrate --force

# Clear and rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx
```

#### Frontend Updates

```bash
# Build new version
eas build --platform all --profile production

# Submit updates
eas submit --platform all
```

---

## Backup and Recovery

### Automated Backup Script

```bash
#!/bin/bash
# /usr/local/bin/ledger-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/ledger

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u ledger -p$DB_PASSWORD ledger > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/ledger

# Delete backups older than 30 days
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $DATE"
```

---

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or AWS ELB
2. **Multiple App Servers**: Clone backend to multiple servers
3. **Shared Storage**: Use NFS or S3 for file storage
4. **Database Clustering**: MySQL/PostgreSQL replication
5. **Caching**: Redis cluster for session/cache

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Enable query caching
- Use CDN for static assets

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: December 29, 2025  
**For Support**: support@your-domain.com
