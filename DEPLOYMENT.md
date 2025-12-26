# Deployment Guide - TrackVault

Complete guide for deploying TrackVault to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Backend Requirements
- PHP 8.2 or higher
- Composer 2.x
- Web server (Apache/Nginx)
- MySQL 8.0+ or PostgreSQL 13+ (SQLite for development only)
- SSL/TLS certificate for HTTPS
- Minimum 512MB RAM, 1GB recommended

### Frontend Requirements
- Node.js 18+
- npm 9+
- Expo CLI
- iOS Developer Account (for iOS deployment)
- Google Play Developer Account (for Android deployment)

### Infrastructure Requirements
- Domain name with DNS access
- Server with root/sudo access
- Backup storage
- (Optional) CDN for static assets
- (Optional) Redis for caching

---

## Backend Deployment

### Option 1: Traditional Server (Ubuntu/Debian)

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring \
    php8.2-curl php8.2-zip php8.2-gd php8.2-bcmath php8.2-intl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Nginx
sudo apt install -y nginx

# Install MySQL
sudo apt install -y mysql-server
```

#### 2. Configure MySQL

```bash
sudo mysql_secure_installation

# Create database
sudo mysql
```

```sql
CREATE DATABASE trackvault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'trackvault'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON trackvault.* TO 'trackvault'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/kasunvimarshana/TrackVault.git
cd TrackVault/backend

# Set permissions
sudo chown -R www-data:www-data /var/www/TrackVault
sudo chmod -R 755 /var/www/TrackVault

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Configure environment
cp .env.example .env
php artisan key:generate
```

#### 4. Configure .env File

```env
APP_NAME=TrackVault
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://api.trackvault.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trackvault
DB_USERNAME=trackvault
DB_PASSWORD=your_secure_password

SANCTUM_STATEFUL_DOMAINS=app.trackvault.com
SESSION_DOMAIN=.trackvault.com

FRONTEND_URL=https://app.trackvault.com
```

#### 5. Run Migrations

```bash
php artisan migrate --force
php artisan db:seed --force
```

#### 6. Configure Nginx

Create `/etc/nginx/sites-available/trackvault`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.trackvault.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.trackvault.com;
    root /var/www/TrackVault/backend/public;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.trackvault.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.trackvault.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/trackvault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.trackvault.com
```

#### 8. Set Up Cron Jobs

```bash
sudo crontab -e -u www-data
```

Add:
```
* * * * * cd /var/www/TrackVault/backend && php artisan schedule:run >> /dev/null 2>&1
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

`backend/Dockerfile`:

```dockerfile
FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www

EXPOSE 9000
CMD ["php-fpm"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - ./backend:/var/www
    networks:
      - trackvault

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./backend:/var/www
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    networks:
      - trackvault

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: trackvault
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_USER: trackvault
      MYSQL_PASSWORD: secure_password
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - trackvault

volumes:
  db_data:

networks:
  trackvault:
    driver: bridge
```

#### 3. Deploy

```bash
docker-compose up -d
docker-compose exec app php artisan migrate --force
docker-compose exec app php artisan db:seed --force
```

---

## Frontend Deployment

### Development/Testing

```bash
cd frontend
npm install
npm start
```

### Production Builds

#### iOS Build (via EAS)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure EAS:
```bash
eas login
eas build:configure
```

3. Update `app.json`:
```json
{
  "expo": {
    "name": "TrackVault",
    "slug": "trackvault",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.trackvault.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.trackvault.app",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

4. Create `.env.production`:
```env
EXPO_PUBLIC_API_URL=https://api.trackvault.com/api
```

5. Build:
```bash
eas build --platform ios --profile production
```

#### Android Build

```bash
eas build --platform android --profile production
```

### Alternative: Classic Expo Build

```bash
# iOS
expo build:ios

# Android
expo build:android
```

---

## Database Setup

### Migrations

```bash
# Run all migrations
php artisan migrate --force

# Rollback last migration
php artisan migrate:rollback

# Reset and re-run all migrations
php artisan migrate:fresh --force
```

### Seeders

```bash
# Seed database with sample data (development only)
php artisan db:seed

# Seed specific seeder
php artisan db:seed --class=DatabaseSeeder
```

### Backup Strategy

#### Automated Daily Backups

Create `/usr/local/bin/backup-trackvault.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/trackvault"
DB_NAME="trackvault"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u trackvault -p'your_password' $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/TrackVault/backend/storage

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
0 2 * * * /usr/local/bin/backup-trackvault.sh >> /var/log/trackvault-backup.log 2>&1
```

---

## Environment Configuration

### Backend Environment Variables

**Production `.env` checklist**:

```env
# Application
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:GENERATE_STRONG_KEY

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=trackvault
DB_USERNAME=trackvault
DB_PASSWORD=STRONG_PASSWORD

# Security
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1

# Logging
LOG_CHANNEL=daily
LOG_LEVEL=error
```

### Frontend Environment Variables

Create `.env.production`:

```env
EXPO_PUBLIC_API_URL=https://api.your-domain.com/api
```

---

## Security Hardening

### 1. File Permissions

```bash
sudo chown -R www-data:www-data /var/www/TrackVault
sudo chmod -R 755 /var/www/TrackVault
sudo chmod -R 775 /var/www/TrackVault/backend/storage
sudo chmod -R 775 /var/www/TrackVault/backend/bootstrap/cache
```

### 2. Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Fail2Ban (Brute Force Protection)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Security Headers

Already configured in Nginx config above, verify:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

---

## Monitoring & Maintenance

### Application Monitoring

#### Laravel Telescope (Development)

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

#### Logging

Check logs:
```bash
tail -f /var/www/TrackVault/backend/storage/logs/laravel.log
```

### Server Monitoring

#### Basic Health Check

Create health check endpoint:

```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'database' => DB::connection()->getDatabaseName(),
    ]);
});
```

#### External Monitoring

Use services like:
- UptimeRobot
- Pingdom
- New Relic
- DataDog

### Performance Optimization

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

### Updates & Maintenance

```bash
# Pull latest code
cd /var/www/TrackVault
sudo git pull origin main

# Update dependencies
cd backend
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
```

---

## Troubleshooting

### Common Issues

#### 1. 500 Internal Server Error

Check logs:
```bash
tail -f /var/www/TrackVault/backend/storage/logs/laravel.log
tail -f /var/log/nginx/error.log
```

Common causes:
- Missing `.env` file
- Wrong file permissions
- PHP-FPM not running
- Database connection issues

#### 2. Database Connection Failed

Verify:
```bash
# Test MySQL connection
mysql -u trackvault -p trackvault

# Check .env configuration
cat /var/www/TrackVault/backend/.env | grep DB_
```

#### 3. CORS Issues

Update `config/cors.php`:
```php
'allowed_origins' => [env('FRONTEND_URL', '*')],
```

#### 4. Frontend Can't Connect to API

- Verify API URL in frontend `.env`
- Check SSL certificate
- Verify CORS settings
- Check firewall rules

### Debug Mode (Temporary)

**NEVER leave enabled in production**

```bash
# Enable
sed -i 's/APP_DEBUG=false/APP_DEBUG=true/' .env
php artisan config:cache

# Disable after debugging
sed -i 's/APP_DEBUG=true/APP_DEBUG=false/' .env
php artisan config:cache
```

---

## Production Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] SSL certificate obtained
- [ ] Database backup completed
- [ ] Rollback plan prepared

### Deployment
- [ ] Application deployed
- [ ] Migrations run successfully
- [ ] File permissions set correctly
- [ ] Services restarted
- [ ] Health check passing
- [ ] Manual testing completed

### Post-Deployment
- [ ] Monitoring enabled
- [ ] Backup system verified
- [ ] Performance metrics normal
- [ ] No error logs
- [ ] User acceptance testing
- [ ] Documentation updated

---

## Support

For deployment issues or questions:
- GitHub Issues: https://github.com/kasunvimarshana/TrackVault/issues
- Email: support@trackvault.com
- Documentation: https://docs.trackvault.com

---

**Last Updated**: 2025-12-25
**Version**: 1.0
