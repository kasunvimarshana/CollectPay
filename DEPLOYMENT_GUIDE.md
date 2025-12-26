# Paywise Deployment Guide

This guide provides step-by-step instructions for deploying the Paywise application to production environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Post-Deployment](#post-deployment)
5. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Backend Requirements
- Linux server (Ubuntu 20.04+ recommended)
- PHP 8.2 or higher
- Composer
- MySQL 8.0+ or PostgreSQL 13+
- Nginx or Apache web server
- SSL certificate (Let's Encrypt recommended)
- Git

### Frontend Requirements
- Node.js 18+ and npm
- Expo account (for managed builds)
- Apple Developer account (for iOS)
- Google Play Developer account (for Android)

## Backend Deployment

### 1. Server Setup

#### Install PHP and Extensions
```bash
sudo apt update
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-bcmath php8.2-gd
```

#### Install Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### Install MySQL
```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Database Setup

```bash
# Connect to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE paywise_production;
CREATE USER 'paywise'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON paywise_production.* TO 'paywise'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clone and Configure Application

```bash
# Create application directory
sudo mkdir -p /var/www/paywise
sudo chown $USER:$USER /var/www/paywise

# Clone repository
cd /var/www/paywise
git clone https://github.com/kasunvimarshana/Paywise.git .

# Navigate to backend
cd backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Create environment file
cp .env.example .env

# Edit environment file
nano .env
```

#### Update .env for Production

```env
APP_NAME=Paywise
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paywise_production
DB_USERNAME=paywise
DB_PASSWORD=strong_password_here

# Generate this with: php artisan key:generate
APP_KEY=

SESSION_DRIVER=database
QUEUE_CONNECTION=database

# For production email
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls

# Set appropriate log level
LOG_LEVEL=error
```

### 4. Application Setup

```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed initial data (admin user)
php artisan db:seed

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data /var/www/paywise/backend/storage
sudo chown -R www-data:www-data /var/www/paywise/backend/bootstrap/cache
sudo chmod -R 755 /var/www/paywise/backend/storage
sudo chmod -R 755 /var/www/paywise/backend/bootstrap/cache
```

### 5. Web Server Configuration

#### Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/paywise
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    root /var/www/paywise/backend/public;
    index index.php;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/paywise /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. SSL Certificate with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
sudo certbot renew --dry-run
```

### 7. Queue Worker Setup (Optional)

```bash
sudo nano /etc/systemd/system/paywise-worker.service
```

```ini
[Unit]
Description=Paywise Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/paywise/backend/artisan queue:work --sleep=3 --tries=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable paywise-worker
sudo systemctl start paywise-worker
```

## Frontend Deployment

### 1. Configure for Production

Update `frontend/src/api/client.js`:

```javascript
const API_BASE_URL = 'https://api.yourdomain.com/api';
```

### 2. Build for Android

```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build APK for testing
eas build --platform android --profile preview

# Build production AAB for Play Store
eas build --platform android --profile production
```

### 3. Build for iOS

```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### 4. Deploy Web Version (Optional)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build web version
npm run web

# Deploy to Netlify
netlify deploy --prod
```

## Post-Deployment

### 1. Verify Backend

```bash
# Test API endpoint
curl https://api.yourdomain.com/api/login

# Check logs
tail -f /var/www/paywise/backend/storage/logs/laravel.log
```

### 2. Test Mobile App

1. Download app from Play Store / App Store
2. Login with default credentials
3. Test all main features:
   - Suppliers listing
   - Products listing
   - Collections creation
   - Payments recording
4. Verify data synchronization

### 3. Create Backup Script

```bash
#!/bin/bash
# /root/backup-paywise.sh

BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="paywise_production"
DB_USER="paywise"
DB_PASS="strong_password_here"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/paywise_$TIMESTAMP.sql

# Backup files
tar -czf $BACKUP_DIR/paywise_files_$TIMESTAMP.tar.gz /var/www/paywise

# Keep only last 7 days
find $BACKUP_DIR -name "paywise_*" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

```bash
chmod +x /root/backup-paywise.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /root/backup-paywise.sh
```

## Monitoring & Maintenance

### 1. Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/paywise
```

```
/var/www/paywise/backend/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 2. Monitor Application

```bash
# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql

# Monitor logs in real-time
tail -f /var/www/paywise/backend/storage/logs/laravel.log
```

### 3. Performance Optimization

```bash
# Enable OPcache in php.ini
sudo nano /etc/php/8.2/fpm/php.ini
```

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

### 4. Regular Maintenance

```bash
# Update dependencies (test in staging first)
cd /var/www/paywise/backend
composer update

# Clear and rebuild cache
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
```

## Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Database user has minimal required permissions
- [ ] `.env` file is not publicly accessible
- [ ] `APP_DEBUG=false` in production
- [ ] Strong passwords for all accounts
- [ ] Firewall configured (allow only 80, 443, 22)
- [ ] Regular backups scheduled
- [ ] Log rotation configured
- [ ] Security headers configured in Nginx
- [ ] File permissions set correctly
- [ ] Queue worker running (if needed)

## Troubleshooting

### 502 Bad Gateway
- Check PHP-FPM: `sudo systemctl status php8.2-fpm`
- Check PHP error logs: `/var/log/php8.2-fpm.log`

### 500 Internal Server Error
- Check Laravel logs: `/var/www/paywise/backend/storage/logs/laravel.log`
- Verify file permissions
- Clear cache: `php artisan cache:clear`

### Database Connection Error
- Verify credentials in `.env`
- Check MySQL status: `sudo systemctl status mysql`
- Test connection: `mysql -u paywise -p paywise_production`

## Rollback Plan

If deployment fails:

```bash
# Restore database backup
mysql -u paywise -p paywise_production < /root/backups/paywise_TIMESTAMP.sql

# Restore code
cd /var/www/paywise
git reset --hard PREVIOUS_COMMIT

# Clear cache
php artisan cache:clear
php artisan config:cache

# Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
```

## Support

For production issues:
1. Check application logs
2. Review server logs
3. Verify configuration files
4. Test API endpoints
5. Contact development team

---

**Remember**: Always test in a staging environment before deploying to production!
