# FieldPay Deployment Guide

## Prerequisites

### Backend Requirements
- Ubuntu 20.04+ or CentOS 8+
- PHP 8.1 or higher
- Composer 2.x
- MySQL 8.0+ or PostgreSQL 13+
- Nginx or Apache web server
- Node.js 18+ (for frontend builds if needed)
- SSL Certificate (Let's Encrypt recommended)

### Frontend Requirements
- Expo EAS CLI
- Apple Developer Account (for iOS)
- Google Play Console Account (for Android)
- Node.js 18+

## Backend Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP and extensions
sudo apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-pgsql \
    php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-curl \
    php8.1-zip php8.1-gd php8.1-intl php8.1-redis

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Or install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Redis (for caching and queues)
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 2. Create Database

```bash
# For MySQL
sudo mysql -u root -p

CREATE DATABASE fieldpay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fieldpay_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON fieldpay.* TO 'fieldpay_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# For PostgreSQL
sudo -u postgres psql

CREATE DATABASE fieldpay;
CREATE USER fieldpay_user WITH ENCRYPTED PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE fieldpay TO fieldpay_user;
\q
```

### 3. Deploy Laravel Application

```bash
# Create application directory
sudo mkdir -p /var/www/fieldpay
sudo chown -R $USER:$USER /var/www/fieldpay

# Clone repository (or upload files)
cd /var/www/fieldpay
git clone https://github.com/yourusername/FieldPay.git .
cd backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Set up environment
cp .env.example .env
nano .env
```

### 4. Configure Environment (.env)

```bash
APP_NAME=FieldPay
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.fieldpay.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fieldpay
DB_USERNAME=fieldpay_user
DB_PASSWORD=strong_password_here

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@fieldpay.com
MAIL_FROM_NAME="${APP_NAME}"

JWT_SECRET=your_jwt_secret_here
JWT_TTL=60
JWT_REFRESH_TTL=20160
```

### 5. Application Setup

```bash
# Generate application key
php artisan key:generate

# Generate JWT secret (if not already set)
php artisan jwt:secret

# Run migrations
php artisan migrate --force

# Seed roles and permissions
php artisan db:seed --class=RolesAndPermissionsSeeder

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set permissions
sudo chown -R www-data:www-data /var/www/fieldpay/backend/storage
sudo chown -R www-data:www-data /var/www/fieldpay/backend/bootstrap/cache
sudo chmod -R 775 /var/www/fieldpay/backend/storage
sudo chmod -R 775 /var/www/fieldpay/backend/bootstrap/cache
```

### 6. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/fieldpay
```

```nginx
server {
    listen 80;
    server_name api.fieldpay.com;
    root /var/www/fieldpay/backend/public;

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
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
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
sudo ln -s /etc/nginx/sites-available/fieldpay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.fieldpay.com

# Auto-renewal (should be automatic, but verify)
sudo certbot renew --dry-run
```

### 8. Set Up Queue Worker

```bash
# Create supervisor configuration
sudo nano /etc/supervisor/conf.d/fieldpay-worker.conf
```

```ini
[program:fieldpay-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/fieldpay/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/fieldpay/backend/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
# Start supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start fieldpay-worker:*
```

### 9. Set Up Cron Jobs

```bash
# Edit crontab
sudo crontab -e -u www-data
```

```cron
* * * * * cd /var/www/fieldpay/backend && php artisan schedule:run >> /dev/null 2>&1
```

### 10. Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

## Frontend Deployment

### 1. Configure EAS Build

```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure
```

### 2. Update App Configuration

**app.json**
```json
{
  "expo": {
    "name": "FieldPay",
    "slug": "fieldpay",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.fieldpay"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.fieldpay",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      },
      "apiUrl": "https://api.fieldpay.com/api"
    }
  }
}
```

### 3. Build for Android

```bash
# Build APK (for testing)
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

### 4. Build for iOS

```bash
# You need to be on macOS or use EAS Build
eas build --platform ios --profile production
```

### 5. Submit to App Stores

```bash
# Android (Google Play)
eas submit --platform android

# iOS (App Store)
eas submit --platform ios
```

## Monitoring and Maintenance

### 1. Log Monitoring

```bash
# Laravel logs
tail -f /var/www/fieldpay/backend/storage/logs/laravel.log

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# Queue worker logs
tail -f /var/www/fieldpay/backend/storage/logs/worker.log
```

### 2. Database Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-fieldpay-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/fieldpay"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="fieldpay"
DB_USER="fieldpay_user"
DB_PASS="strong_password_here"

mkdir -p $BACKUP_DIR

# For MySQL
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/fieldpay_$TIMESTAMP.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "fieldpay_*.sql.gz" -mtime +30 -delete

echo "Backup completed: fieldpay_$TIMESTAMP.sql.gz"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-fieldpay-db.sh

# Schedule daily backups
sudo crontab -e
```

```cron
0 2 * * * /usr/local/bin/backup-fieldpay-db.sh >> /var/log/fieldpay-backup.log 2>&1
```

### 3. Application Updates

```bash
# Pull latest changes
cd /var/www/fieldpay/backend
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear and rebuild cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Restart queue workers
sudo supervisorctl restart fieldpay-worker:*

# Restart PHP-FPM
sudo systemctl restart php8.1-fpm
```

### 4. Performance Optimization

**Enable OPcache**
```bash
sudo nano /etc/php/8.1/fpm/php.ini
```

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
```

**Configure Redis for better performance**
```bash
sudo nano /etc/redis/redis.conf
```

```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

```bash
sudo systemctl restart redis-server
```

### 5. Security Hardening

```bash
# Disable directory listing
sudo nano /etc/nginx/nginx.conf
# Add: autoindex off;

# Hide PHP version
sudo nano /etc/php/8.1/fpm/php.ini
# Set: expose_php = Off

# Set secure permissions
sudo find /var/www/fieldpay/backend -type d -exec chmod 755 {} \;
sudo find /var/www/fieldpay/backend -type f -exec chmod 644 {} \;
sudo chmod -R 775 /var/www/fieldpay/backend/storage
sudo chmod -R 775 /var/www/fieldpay/backend/bootstrap/cache

# Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check Laravel logs: `/var/www/fieldpay/backend/storage/logs/laravel.log`
   - Check Nginx error logs: `/var/log/nginx/error.log`
   - Verify file permissions
   - Clear and rebuild cache

2. **Database Connection Failed**
   - Verify database credentials in `.env`
   - Check if database service is running
   - Test connection: `php artisan tinker` then `DB::connection()->getPdo()`

3. **Queue Jobs Not Processing**
   - Check supervisor status: `sudo supervisorctl status`
   - Check worker logs: `/var/www/fieldpay/backend/storage/logs/worker.log`
   - Restart workers: `sudo supervisorctl restart fieldpay-worker:*`

4. **JWT Token Issues**
   - Regenerate JWT secret: `php artisan jwt:secret`
   - Clear config cache: `php artisan config:clear`

## Rollback Procedure

```bash
# If deployment fails, rollback
cd /var/www/fieldpay/backend

# Revert to previous version
git reset --hard HEAD~1

# Rollback migrations (if needed)
php artisan migrate:rollback

# Rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo supervisorctl restart fieldpay-worker:*
sudo systemctl restart php8.1-fpm
```

## Support and Maintenance

- Monitor application logs daily
- Review security updates weekly
- Update dependencies monthly
- Full system backup weekly
- Test disaster recovery quarterly

For production support, maintain a runbook with:
- Emergency contacts
- Service credentials
- Escalation procedures
- Common issue resolutions
