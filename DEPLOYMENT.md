# CollectPay Deployment Guide

This guide covers deploying CollectPay to production environments.

## Backend Deployment (Laravel API)

### Prerequisites
- PHP 8.2+
- Composer
- MySQL/PostgreSQL database
- Web server (Apache/Nginx)
- SSL certificate (recommended)

### Deployment Steps

#### 1. Server Setup

```bash
# Install PHP and required extensions
sudo apt update
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install mysql-server
```

#### 2. Deploy Code

```bash
# Clone repository
git clone https://github.com/kasunvimarshana/CollectPay.git
cd CollectPay/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

#### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit .env
nano .env
```

Update these values:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=collectpay_prod
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

# Generate secure key
php artisan key:generate
```

#### 4. Database Setup

```bash
# Run migrations
php artisan migrate --force

# Optional: Seed initial data
php artisan db:seed
```

#### 5. Optimize for Production

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

#### 6. Web Server Configuration

**Nginx Configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.collectpay.com;
    root /var/www/collectpay/backend/public;

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

#### 7. SSL Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.collectpay.com
```

#### 8. Queue Workers (Optional)

```bash
# Install supervisor
sudo apt install supervisor

# Create supervisor configuration
sudo nano /etc/supervisor/conf.d/collectpay-worker.conf
```

```ini
[program:collectpay-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/collectpay/backend/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/collectpay/backend/storage/logs/worker.log
```

```bash
# Start worker
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start collectpay-worker:*
```

#### 9. Scheduled Tasks

Add to crontab:
```bash
crontab -e
```

```cron
* * * * * cd /var/www/collectpay/backend && php artisan schedule:run >> /dev/null 2>&1
```

## Frontend Deployment (React Native/Expo)

### Building for Production

#### iOS Build

```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios
```

#### Android Build

```bash
# Build APK for Android
eas build --platform android --profile production

# Or build AAB for Google Play
eas build --platform android --profile production
```

### App Store Submission

#### iOS (App Store)
1. Create app in App Store Connect
2. Upload build from EAS
3. Configure app details and screenshots
4. Submit for review

#### Android (Google Play)
1. Create app in Google Play Console
2. Upload AAB file
3. Configure store listing
4. Submit for review

### OTA Updates

Configure OTA updates in `app.json`:

```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    }
  }
}
```

Publish updates:
```bash
eas update --branch production
```

## Environment Variables

### Backend (.env)
```env
APP_NAME=CollectPay
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.collectpay.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=collectpay
DB_USERNAME=collectpay_user
DB_PASSWORD=secure_password

SANCTUM_STATEFUL_DOMAINS=collectpay.com,api.collectpay.com
```

### Frontend (Update src/services/api.ts)
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api' 
  : 'https://api.collectpay.com/api';
```

## Monitoring & Maintenance

### Log Monitoring

```bash
# Laravel logs
tail -f /var/www/collectpay/backend/storage/logs/laravel.log

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### Database Backups

```bash
# Create backup script
nano /usr/local/bin/backup-collectpay.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/collectpay"
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u collectpay_user -p'secure_password' collectpay > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /usr/local/bin/backup-collectpay.sh

# Schedule daily backup
crontab -e
```

```cron
0 2 * * * /usr/local/bin/backup-collectpay.sh
```

### Performance Optimization

1. **Enable OPcache** (php.ini):
```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
```

2. **Use Redis for cache** (.env):
```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

3. **Database indexing**: Already included in migrations

4. **CDN for assets**: Configure CDN for static assets

### Security Checklist

- [ ] SSL/TLS enabled
- [ ] Firewall configured (only 80, 443 open)
- [ ] Database not exposed to internet
- [ ] Environment files not in web root
- [ ] Regular security updates
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Strong database passwords
- [ ] Regular backups
- [ ] Monitoring alerts set up

### Scaling Considerations

1. **Database**: Use read replicas for heavy read loads
2. **Cache**: Redis cluster for distributed cache
3. **Load Balancer**: Multiple app servers behind load balancer
4. **Queue Workers**: Scale workers based on queue size
5. **CDN**: Use CDN for static assets and API responses

## Troubleshooting

### Common Issues

**Permission errors:**
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

**500 errors:**
```bash
# Check logs
tail -f storage/logs/laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

**Database connection errors:**
- Verify database credentials in .env
- Check MySQL is running: `sudo systemctl status mysql`
- Test connection: `mysql -u username -p`

## Rollback Procedure

```bash
# Backup current state
cp -r /var/www/collectpay /var/www/collectpay.backup

# Pull previous version
git checkout <previous-tag>

# Install dependencies
composer install --no-dev

# Run migrations if needed
php artisan migrate --force

# Clear caches
php artisan config:cache
php artisan route:cache
```

## Support

For deployment issues, check:
- Laravel logs: `storage/logs/laravel.log`
- Web server logs: `/var/log/nginx/` or `/var/log/apache2/`
- System logs: `/var/log/syslog`

Create an issue on GitHub for assistance.
