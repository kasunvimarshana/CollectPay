# Collection Payment System - Deployment Guide

## Prerequisites

### Backend Requirements
- PHP 8.3 or higher
- Composer 2.x
- MySQL 8.0 or PostgreSQL 13+
- Nginx or Apache web server
- SSL certificate (for HTTPS)

### Frontend Requirements
- Node.js 20.x LTS
- npm 10.x or yarn
- Expo CLI
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

## Backend Deployment

### 1. Server Setup

```bash
# Install PHP and extensions
sudo apt update
sudo apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring \
  php8.3-xml php8.3-bcmath php8.3-curl php8.3-zip php8.3-gd

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### 2. Application Setup

```bash
# Clone repository
cd /var/www/
git clone <repository-url> collection-payment-system
cd collection-payment-system/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Setup environment
cp .env.example .env
nano .env
```

### 3. Environment Configuration

Edit `.env` file:

```env
APP_NAME="Collection Payment System"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=collection_payment_db
DB_USERNAME=db_user
DB_PASSWORD=strong_password_here

JWT_SECRET=
JWT_TTL=60
JWT_REFRESH_TTL=20160

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 4. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE collection_payment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'db_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON collection_payment_db.* TO 'db_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate --force

# Seed initial data (optional)
php artisan db:seed
```

### 5. Permissions

```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/collection-payment-system/backend

# Set directory permissions
sudo find /var/www/collection-payment-system/backend -type d -exec chmod 755 {} \;
sudo find /var/www/collection-payment-system/backend -type f -exec chmod 644 {} \;

# Storage and cache permissions
sudo chmod -R 775 /var/www/collection-payment-system/backend/storage
sudo chmod -R 775 /var/www/collection-payment-system/backend/bootstrap/cache
```

### 6. Nginx Configuration

Create `/etc/nginx/sites-available/collection-payment-api`:

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
    root /var/www/collection-payment-system/backend/public;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    index index.php;
    charset utf-8;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

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
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Increase max upload size
    client_max_body_size 100M;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/collection-payment-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Optimization

```bash
# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Install and configure OPcache
sudo apt install php8.3-opcache

# Install Redis for caching
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 8. Queue Workers (Optional)

Setup supervisor for queue workers:

```bash
sudo apt install supervisor
```

Create `/etc/supervisor/conf.d/collection-payment-worker.conf`:

```ini
[program:collection-payment-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/collection-payment-system/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/collection-payment-system/backend/storage/logs/worker.log
stopwaitsecs=3600
```

Start supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start collection-payment-worker:*
```

### 9. Cron Jobs

Add to crontab:
```bash
sudo crontab -e -u www-data

# Add this line
* * * * * cd /var/www/collection-payment-system/backend && php artisan schedule:run >> /dev/null 2>&1
```

### 10. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
sudo systemctl reload nginx
```

### 11. Backup Strategy

Create backup script `/usr/local/bin/backup-collection-payment.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/collection-payment"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u db_user -p'strong_password_here' collection_payment_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/collection-payment-system/backend/storage

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Make executable and add to crontab:
```bash
sudo chmod +x /usr/local/bin/backup-collection-payment.sh
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-collection-payment.sh
```

## Frontend Deployment

### 1. Development Build

```bash
cd frontend
npm install

# Start development server
npm start

# Or run on specific platform
npm run android
npm run ios
npm run web
```

### 2. Environment Configuration

Create `.env` file in frontend directory:

```env
API_BASE_URL=https://api.yourdomain.com/api
API_TIMEOUT=30000
ENABLE_ENCRYPTION=true
SYNC_INTERVAL=300000
MAX_RETRY_ATTEMPTS=3
```

### 3. Production Build (Android)

#### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

#### Using Local Build

```bash
# Build APK
npx expo build:android -t apk

# Build AAB (for Play Store)
npx expo build:android -t app-bundle
```

### 4. App Signing (Android)

Generate keystore:
```bash
keytool -genkeypair -v -keystore collection-payment.keystore \
  -alias collection-payment-key -keyalg RSA -keysize 2048 -validity 10000
```

Update `app.json`:
```json
{
  "expo": {
    "android": {
      "package": "com.yourdomain.collectionpayment",
      "versionCode": 1
    }
  }
}
```

### 5. Distribution

#### Google Play Store
1. Create Google Play Developer account
2. Create new app in Play Console
3. Upload AAB file
4. Fill app details, screenshots
5. Submit for review

#### Direct Distribution (APK)
1. Host APK on secure server
2. Enable "Install from Unknown Sources" on devices
3. Download and install APK

### 6. Over-The-Air (OTA) Updates

Configure in `app.json`:
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
npx expo publish
```

## Monitoring & Maintenance

### 1. Log Monitoring

```bash
# Backend logs
tail -f /var/www/collection-payment-system/backend/storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PHP-FPM logs
tail -f /var/log/php8.3-fpm.log
```

### 2. Performance Monitoring

Install monitoring tools:
```bash
# Install New Relic (optional)
# Follow New Relic PHP agent installation guide

# Setup Laravel Horizon for queue monitoring
composer require laravel/horizon
php artisan horizon:install
php artisan migrate
```

### 3. Health Checks

Create health check endpoint in Laravel:

```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected'
    ]);
});
```

Setup monitoring service to ping endpoint regularly.

### 4. Database Maintenance

```bash
# Optimize tables
php artisan db:optimize

# Clear old sync queue entries
php artisan sync:cleanup --days=30
```

### 5. Security Updates

```bash
# Update backend dependencies
composer update --with-dependencies

# Update frontend dependencies
npm update

# Check for vulnerabilities
composer audit
npm audit
```

## Troubleshooting

### Backend Issues

**Issue**: 500 Internal Server Error
```bash
# Check logs
tail -f storage/logs/laravel.log

# Check permissions
ls -la storage/ bootstrap/cache/

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

**Issue**: Database connection failed
```bash
# Verify database credentials in .env
# Test database connection
mysql -u db_user -p'password' collection_payment_db

# Check MySQL is running
sudo systemctl status mysql
```

**Issue**: JWT Token errors
```bash
# Regenerate JWT secret
php artisan jwt:secret --force

# Clear config cache
php artisan config:clear
```

### Frontend Issues

**Issue**: API connection failed
- Check API_BASE_URL in .env
- Verify SSL certificate is valid
- Check network connectivity
- Verify CORS headers on backend

**Issue**: Sync not working
- Check sync queue in SQLite
- Verify authentication token
- Check network status monitoring
- Review sync logs

## Production Checklist

### Backend
- [ ] Environment set to production
- [ ] Debug mode disabled
- [ ] HTTPS enforced
- [ ] Database credentials secured
- [ ] JWT secrets generated
- [ ] Migrations run
- [ ] Cache optimized
- [ ] Queue workers running
- [ ] Cron jobs configured
- [ ] Backups automated
- [ ] Monitoring setup
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Frontend
- [ ] Production build tested
- [ ] API URLs configured
- [ ] SSL certificate pinning enabled
- [ ] Encryption keys secured
- [ ] App signed with production keystore
- [ ] Version number updated
- [ ] OTA updates configured
- [ ] Error tracking enabled
- [ ] Analytics configured (optional)
- [ ] App store listing prepared

## Support & Resources

- Laravel Documentation: https://laravel.com/docs
- Expo Documentation: https://docs.expo.dev
- React Native Documentation: https://reactnative.dev
- JWT Auth: https://github.com/tymondesigns/jwt-auth

## Security Considerations

1. **Never commit sensitive data** (.env files, keystores, certificates)
2. **Use strong passwords** for database and admin accounts
3. **Enable firewall** on server
4. **Regular security updates** for all dependencies
5. **Monitor for suspicious activity**
6. **Regular backups** and disaster recovery testing
7. **Implement rate limiting** on all API endpoints
8. **Use HTTPS everywhere**
9. **Validate and sanitize** all user inputs
10. **Regular security audits**

## Performance Optimization

1. Enable PHP OPcache
2. Use Redis for caching and sessions
3. Database query optimization with indexes
4. CDN for static assets
5. Image optimization
6. Lazy loading of resources
7. Pagination on large datasets
8. Background processing for heavy tasks
9. Connection pooling
10. Load balancing for high traffic

## Scaling Considerations

### Horizontal Scaling
- Multiple application servers behind load balancer
- Shared Redis/cache layer
- Centralized session storage
- Database replication (master-slave)

### Vertical Scaling
- Increase server resources (CPU, RAM)
- SSD storage for database
- Optimize PHP-FPM pool settings
- Increase Nginx worker processes

## Conclusion

This deployment guide provides a comprehensive approach to deploying the Collection Payment System in a production environment. Follow security best practices, maintain regular backups, and monitor system health for a reliable deployment.
