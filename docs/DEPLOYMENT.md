# Deployment Guide for CollectPay

## Table of Contents

1. [Backend Deployment](#backend-deployment)
2. [Frontend Deployment](#frontend-deployment)
3. [Database Setup](#database-setup)
4. [Security Configuration](#security-configuration)
5. [Monitoring & Maintenance](#monitoring--maintenance)

## Backend Deployment

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- PHP 8.1 or higher
- Composer
- MySQL 5.7+ or MariaDB 10.3+
- Nginx or Apache
- SSL certificate (Let's Encrypt recommended)

### Step 1: Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install PHP and extensions
sudo apt install -y php8.1-fpm php8.1-cli php8.1-mysql php8.1-xml \
  php8.1-mbstring php8.1-curl php8.1-zip php8.1-bcmath php8.1-redis

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
```

### Step 2: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/CollectPay.git
cd CollectPay/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Set permissions
sudo chown -R www-data:www-data /var/www/CollectPay
sudo chmod -R 755 /var/www/CollectPay
sudo chmod -R 775 storage bootstrap/cache
```

### Step 3: Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Edit .env file
nano .env
```

Production `.env` configuration:

```env
APP_NAME=CollectPay
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=collectpay_prod
DB_USERNAME=collectpay_user
DB_PASSWORD=secure_password_here

JWT_SECRET=your_generated_jwt_secret
JWT_TTL=60
JWT_REFRESH_TTL=20160

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Step 4: Database Migration

```bash
# Run migrations
php artisan migrate --force

# Optional: Seed initial data
php artisan db:seed
```

### Step 5: Web Server Configuration

#### Nginx Configuration

Create `/etc/nginx/sites-available/collectpay`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    root /var/www/CollectPay/backend/public;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
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
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/collectpay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already configured with certbot)
sudo certbot renew --dry-run
```

### Step 7: Process Management

```bash
# Install Supervisor for queue workers
sudo apt install -y supervisor

# Create supervisor config
sudo nano /etc/supervisor/conf.d/collectpay-worker.conf
```

Add configuration:

```ini
[program:collectpay-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/CollectPay/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/CollectPay/backend/storage/logs/worker.log
stopwaitsecs=3600
```

Start supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start collectpay-worker:*
```

## Frontend Deployment

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- EAS CLI (for build and submission)
- Apple Developer Account (for iOS)
- Google Play Console Account (for Android)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Configure Project

```bash
cd frontend

# Login to Expo
eas login

# Configure EAS
eas build:configure
```

### Step 3: Environment Configuration

Create `.env.production`:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
EXPO_PUBLIC_ENCRYPTION_KEY=your_secure_encryption_key
```

### Step 4: Build for Production

#### Android Build

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

#### iOS Build

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

### Step 5: Submit to Stores

#### Google Play Store

```bash
eas submit --platform android
```

Follow prompts to submit to Google Play Console.

#### Apple App Store

```bash
eas submit --platform ios
```

Follow prompts to submit to App Store Connect.

## Database Setup

### Production Database Configuration

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE collectpay_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'collectpay_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON collectpay_prod.* TO 'collectpay_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Database Backup

Create backup script `/usr/local/bin/backup-collectpay.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/collectpay"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="collectpay_prod"
DB_USER="collectpay_user"
DB_PASS="secure_password_here"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/collectpay_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "collectpay_*.sql.gz" -mtime +30 -delete
```

Make executable and schedule:

```bash
sudo chmod +x /usr/local/bin/backup-collectpay.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add line:
0 2 * * * /usr/local/bin/backup-collectpay.sh
```

## Security Configuration

### Firewall Setup

```bash
# Install and configure UFW
sudo apt install -y ufw

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### Security Hardening

1. **Disable PHP functions** in `php.ini`:
```ini
disable_functions = exec,passthru,shell_exec,system,proc_open,popen
```

2. **Configure fail2ban**:
```bash
sudo apt install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

3. **Regular updates**:
```bash
# Setup unattended upgrades
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Monitoring & Maintenance

### Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/collectpay
```

Add configuration:

```
/var/www/CollectPay/backend/storage/logs/*.log {
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

### Monitoring Tools

1. **Application Performance**
   - Laravel Telescope (development)
   - New Relic / Datadog (production)

2. **Server Monitoring**
   - Prometheus + Grafana
   - Uptime monitoring (UptimeRobot)

3. **Error Tracking**
   - Sentry
   - Bugsnag

### Health Checks

Create monitoring script:

```bash
#!/bin/bash
curl -f https://api.yourdomain.com/api/health || echo "API Down" | mail -s "CollectPay Alert" admin@yourdomain.com
```

### Maintenance Mode

```bash
# Enable maintenance mode
php artisan down --message="Scheduled maintenance" --retry=60

# Perform updates
git pull
composer install --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Disable maintenance mode
php artisan up
```

## Production Checklist

### Pre-Deployment

- [ ] Environment configured correctly
- [ ] Database backed up
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Monitoring tools set up

### Post-Deployment

- [ ] API health check passes
- [ ] Authentication working
- [ ] Sync functionality tested
- [ ] Mobile app connects successfully
- [ ] Backups running automatically
- [ ] Monitoring alerts configured
- [ ] Documentation updated

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check PHP error logs: `/var/log/php8.1-fpm.log`
   - Check Laravel logs: `storage/logs/laravel.log`
   - Verify file permissions

2. **Database Connection Failed**
   - Verify credentials in `.env`
   - Check MySQL service: `sudo systemctl status mysql`
   - Test connection: `mysql -u collectpay_user -p`

3. **SSL Certificate Issues**
   - Verify certificate: `sudo certbot certificates`
   - Renew if needed: `sudo certbot renew`

4. **Sync Not Working**
   - Check network connectivity
   - Verify API endpoint
   - Check authentication token
   - Review sync logs

## Rollback Procedure

```bash
# 1. Enable maintenance mode
php artisan down

# 2. Restore database backup
gunzip < /var/backups/collectpay/collectpay_YYYYMMDD_HHMMSS.sql.gz | mysql -u collectpay_user -p collectpay_prod

# 3. Rollback code
git checkout previous_stable_tag

# 4. Install dependencies
composer install --no-dev

# 5. Clear caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 6. Disable maintenance mode
php artisan up
```

## Support

For deployment assistance:
- Documentation: `/docs`
- GitHub Issues
- Email: support@yourdomain.com

---

**Note**: Always test deployment procedures in a staging environment before applying to production.
