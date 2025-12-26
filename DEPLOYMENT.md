# PayCore Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Security Configuration](#security-configuration)
6. [Environment Configuration](#environment-configuration)
7. [Maintenance](#maintenance)

## Prerequisites

### System Requirements
- **Server**: Ubuntu 20.04+ or CentOS 8+
- **Web Server**: Nginx or Apache 2.4+
- **PHP**: 8.2 or higher
- **Database**: MySQL 8.0+ or PostgreSQL 13+
- **Node.js**: 18.x or higher (for frontend build)
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 20GB available

### Software Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP and extensions
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## Backend Deployment

### 1. Clone Repository
```bash
cd /var/www
git clone https://github.com/kasunvimarshana/PayCore.git
cd PayCore/backend
```

### 2. Install Dependencies
```bash
composer install --no-dev --optimize-autoloader
```

### 3. Environment Configuration
```bash
cp .env.example .env
nano .env
```

Configure the following in `.env`:
```env
APP_NAME=PayCore
APP_ENV=production
APP_KEY=  # Generate with: php artisan key:generate
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paycore_prod
DB_USERNAME=paycore_user
DB_PASSWORD=your_secure_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Run Migrations
```bash
php artisan migrate --force
```

### 6. Optimize Application
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 7. Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/PayCore/backend
sudo chmod -R 755 /var/www/PayCore/backend
sudo chmod -R 775 /var/www/PayCore/backend/storage
sudo chmod -R 775 /var/www/PayCore/backend/bootstrap/cache
```

### 8. Configure Nginx
Create `/etc/nginx/sites-available/paycore`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/PayCore/backend/public;

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
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/paycore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Setup SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 10. Setup Queue Worker (Optional)
Create `/etc/systemd/system/paycore-worker.service`:
```ini
[Unit]
Description=PayCore Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
Restart=always
RestartSec=5s
ExecStart=/usr/bin/php /var/www/PayCore/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable paycore-worker
sudo systemctl start paycore-worker
```

## Database Setup

### 1. Create Database and User
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE paycore_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'paycore_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON paycore_prod.* TO 'paycore_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Configure MySQL for Production
Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

### 3. Backup Strategy
Create backup script `/usr/local/bin/backup-paycore.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/paycore"
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u paycore_user -p'your_password' paycore_prod > "$BACKUP_DIR/db_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/db_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

Make executable and add to cron:
```bash
sudo chmod +x /usr/local/bin/backup-paycore.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-paycore.sh
```

## Frontend Deployment

### Option 1: Build for Mobile App Stores

#### Android
```bash
cd /path/to/PayCore/frontend
npm install
expo build:android
```

Download APK and upload to Google Play Console.

#### iOS
```bash
expo build:ios
```

Download IPA and upload to App Store Connect.

### Option 2: Web Deployment
```bash
cd /path/to/PayCore/frontend
npm install
npm run build
```

Deploy build output to static hosting (Netlify, Vercel, etc.)

### Option 3: Internal Distribution

#### Using Expo
```bash
expo publish
```

Share the Expo Go QR code or deep link with users.

#### Using EAS Build
```bash
npm install -g eas-cli
eas build --platform android --profile production
```

## Security Configuration

### 1. Firewall Setup
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3306/tcp  # Only if remote DB access needed
```

### 2. Rate Limiting
Already configured in Laravel routes. Adjust in `routes/api.php` if needed.

### 3. CORS Configuration
Edit `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['https://yourdomain.com'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'max_age' => 0,
'supports_credentials' => true,
```

### 4. Environment Security
- Never commit `.env` files
- Use strong database passwords
- Rotate API keys regularly
- Enable 2FA for production servers

## Environment Configuration

### Production `.env` Checklist
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL` set to production URL
- [ ] Strong `APP_KEY` generated
- [ ] Database credentials configured
- [ ] Cache driver set (redis/memcached)
- [ ] Queue connection configured
- [ ] Mail settings configured
- [ ] Log channel configured

### Frontend Configuration
Update `frontend/src/constants/index.ts`:
```typescript
export const API_BASE_URL = 'https://api.yourdomain.com/api';
```

## Monitoring and Maintenance

### 1. Log Monitoring
```bash
tail -f /var/www/PayCore/backend/storage/logs/laravel.log
```

### 2. Performance Monitoring
Consider installing:
- New Relic
- Datadog
- Laravel Telescope (development only)

### 3. Regular Maintenance Tasks
```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run queue workers
php artisan queue:work --daemon
```

### 4. Update Procedure
```bash
# Backup database
/usr/local/bin/backup-paycore.sh

# Pull latest code
cd /var/www/PayCore
git pull origin main

# Update dependencies
cd backend
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# Restart services
sudo systemctl reload php8.2-fpm
sudo systemctl reload nginx
sudo systemctl restart paycore-worker
```

## Troubleshooting

### Common Issues

**Issue**: 500 Internal Server Error
```bash
# Check logs
tail -n 50 /var/www/PayCore/backend/storage/logs/laravel.log
# Check PHP-FPM logs
tail -n 50 /var/log/php8.2-fpm.log
```

**Issue**: Database connection errors
```bash
# Test connection
php artisan tinker
>>> DB::connection()->getPdo();
```

**Issue**: Permission errors
```bash
sudo chown -R www-data:www-data /var/www/PayCore/backend/storage
sudo chmod -R 775 /var/www/PayCore/backend/storage
```

## Support

For deployment issues, contact the development team or refer to:
- Laravel Documentation: https://laravel.com/docs
- Expo Documentation: https://docs.expo.dev
- Nginx Documentation: https://nginx.org/en/docs

---

**Version**: 1.0  
**Last Updated**: 2025-12-25
