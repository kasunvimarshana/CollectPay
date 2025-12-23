# SyncCollect - Deployment Guide

## Overview

This guide covers deploying the SyncCollect application in development, staging, and production environments.

## System Requirements

### Backend (Laravel)
- PHP 8.2 or higher
- Composer 2.9+
- MySQL 8.0+ / PostgreSQL 13+ / SQLite 3.35+
- Web server (Apache/Nginx)
- 512MB RAM minimum (2GB+ recommended)
- SSL certificate (production)

### Frontend (React Native)
- Node.js 20+
- npm 10+
- Expo CLI
- Android SDK / Xcode (for native builds)

## Backend Deployment

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install PHP and extensions
sudo apt install -y php8.3 php8.3-cli php8.3-fpm php8.3-mysql \
  php8.3-pgsql php8.3-sqlite3 php8.3-mbstring php8.3-xml \
  php8.3-curl php8.3-zip php8.3-gd php8.3-intl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install and configure web server (Nginx example)
sudo apt install -y nginx
```

### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/kasunvimarshana/SyncCollect.git
cd SyncCollect/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Environment configuration
cp .env.example .env
nano .env  # Edit configuration
```

### 3. Environment Configuration

**`.env` file for production:**

```env
APP_NAME=SyncCollect
APP_ENV=production
APP_KEY=  # Generate with: php artisan key:generate
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

LOG_CHANNEL=daily
LOG_LEVEL=error
LOG_DEPRECATIONS_CHANNEL=null

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=synccollect
DB_USERNAME=synccollect_user
DB_PASSWORD=your_secure_password

# Cache & Queue
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Sanctum
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,api.yourdomain.com
```

### 4. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE synccollect;"
mysql -u root -p -e "CREATE USER 'synccollect_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON synccollect.* TO 'synccollect_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# Run migrations
php artisan migrate --force

# Seed initial data (optional for dev/staging)
php artisan db:seed --force
```

### 5. Web Server Configuration

**Nginx configuration (`/etc/nginx/sites-available/synccollect`):**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;
    root /var/www/SyncCollect/backend/public;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;

    charset utf-8;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

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

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/synccollect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Queue Workers

```bash
# Create systemd service file
sudo nano /etc/systemd/system/synccollect-worker.service
```

**Service file content:**
```ini
[Unit]
Description=SyncCollect Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/SyncCollect/backend
ExecStart=/usr/bin/php /var/www/SyncCollect/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl enable synccollect-worker
sudo systemctl start synccollect-worker
sudo systemctl status synccollect-worker
```

### 7. Scheduled Tasks (Cron)

```bash
# Edit crontab
crontab -e

# Add this line
* * * * * cd /var/www/SyncCollect/backend && php artisan schedule:run >> /dev/null 2>&1
```

### 8. Optimization

```bash
# Production optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# After deployment updates
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
```

---

## Frontend Deployment

### 1. Development Build

```bash
cd SyncCollect/frontend

# Install dependencies
npm install

# Configure API endpoint
echo "EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1" > .env

# Start development server
npm start
```

### 2. Production Build (Android)

```bash
# Build APK
eas build --platform android --profile production

# Or local build
npm run android:build
```

### 3. Production Build (iOS)

```bash
# Build IPA
eas build --platform ios --profile production
```

### 4. Expo Configuration

**`app.json`:**
```json
{
  "expo": {
    "name": "SyncCollect",
    "slug": "synccollect",
    "version": "1.0.0",
    "extra": {
      "apiUrl": "https://api.yourdomain.com/api/v1"
    },
    "ios": {
      "bundleIdentifier": "com.yourdomain.synccollect"
    },
    "android": {
      "package": "com.yourdomain.synccollect",
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 2. Fail2Ban

```bash
# Install
sudo apt install -y fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Database Security

```bash
# MySQL secure installation
sudo mysql_secure_installation

# Regular backups
# Add to crontab
0 2 * * * mysqldump -u synccollect_user -p'password' synccollect > /backups/synccollect_$(date +\%Y\%m\%d).sql
```

### 4. SSL/TLS Certificate

```bash
# Let's Encrypt (recommended)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
sudo certbot renew --dry-run
```

---

## Monitoring & Logging

### 1. Laravel Telescope (Development/Staging)

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

### 2. Log Monitoring

```bash
# View logs
tail -f storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. Performance Monitoring

```bash
# Install Redis for caching
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## Backup Strategy

### 1. Database Backups

```bash
#!/bin/bash
# /usr/local/bin/backup-db.sh

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="synccollect"

mkdir -p $BACKUP_DIR

mysqldump -u synccollect_user -p'password' $DB_NAME | gzip > $BACKUP_DIR/synccollect_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 2. Application Files

```bash
#!/bin/bash
# /usr/local/bin/backup-files.sh

BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/SyncCollect"

mkdir -p $BACKUP_DIR

tar -czf $BACKUP_DIR/synccollect_files_$DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='vendor' \
  --exclude='storage/logs/*' \
  --exclude='storage/framework/cache/*' \
  $APP_DIR

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 3. Schedule Backups

```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup-db.sh
0 3 * * 0 /usr/local/bin/backup-files.sh
```

---

## Troubleshooting

### Common Issues

**1. Permission errors:**
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

**2. Database connection errors:**
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();
```

**3. Queue not processing:**
```bash
# Restart queue worker
sudo systemctl restart synccollect-worker
# Check logs
sudo journalctl -u synccollect-worker -f
```

**4. Cache issues:**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer:** Use Nginx or HAProxy to distribute traffic
2. **Separate Database Server:** Move database to dedicated server
3. **Redis Cluster:** For session and cache management
4. **Queue Workers:** Run multiple queue workers on separate servers

### Vertical Scaling

1. **Increase server resources:** CPU, RAM, storage
2. **Database optimization:** Indexes, query optimization
3. **Caching:** Use Redis/Memcached aggressively
4. **CDN:** Serve static assets via CDN

---

## Health Checks

### Backend Health Check

**Endpoint:** `GET /up`

Returns HTTP 200 if application is healthy.

### Automated Monitoring

```bash
# Add to crontab
*/5 * * * * curl -f https://api.yourdomain.com/up || echo "API is down" | mail -s "Alert: API Down" admin@yourdomain.com
```

---

## Rollback Procedure

```bash
# 1. Stop application
sudo systemctl stop synccollect-worker

# 2. Restore database
gunzip < /backups/database/synccollect_YYYYMMDD_HHMMSS.sql.gz | mysql -u synccollect_user -p'password' synccollect

# 3. Restore application files
cd /var/www
sudo mv SyncCollect SyncCollect.broken
sudo tar -xzf /backups/files/synccollect_files_YYYYMMDD_HHMMSS.tar.gz

# 4. Restart services
sudo systemctl start synccollect-worker
sudo systemctl reload nginx
```

---

## Support & Maintenance

- **Regular Updates:** Keep dependencies updated
- **Security Patches:** Apply security updates promptly
- **Monitor Logs:** Check logs daily for errors
- **Performance Testing:** Regular load testing
- **Backup Testing:** Verify backups work monthly

---

## Additional Resources

- [Laravel Deployment Documentation](https://laravel.com/docs/deployment)
- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
