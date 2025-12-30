# TrackVault Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Production Configuration](#production-configuration)
5. [Security Checklist](#security-checklist)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Backend Requirements
- PHP 8.1 or higher
- Composer 2.x
- MySQL 8.0+ or PostgreSQL 13+
- Web server (Apache/Nginx)
- SSL certificate
- Redis (optional, for caching and queues)

### Frontend Requirements
- Node.js 18+ and npm/yarn
- Expo CLI
- EAS CLI (for building)
- Apple Developer Account (for iOS)
- Google Play Console Account (for Android)

## Backend Deployment

### Step 1: Server Setup

#### For Ubuntu/Debian Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP and extensions
sudo apt install -y php8.1 php8.1-fpm php8.1-cli php8.1-mysql php8.1-pgsql \
  php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip php8.1-bcmath \
  php8.1-gd php8.1-intl php8.1-redis

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install -y mysql-server

# Or install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Deploy Laravel Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/TrackVault.git
cd TrackVault/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Set permissions
sudo chown -R www-data:www-data /var/www/TrackVault/backend
sudo chmod -R 755 /var/www/TrackVault/backend
sudo chmod -R 775 /var/www/TrackVault/backend/storage
sudo chmod -R 775 /var/www/TrackVault/backend/bootstrap/cache

# Create .env file
cp .env.example .env
nano .env  # Edit configuration
```

### Step 3: Configure Environment

Edit `/var/www/TrackVault/backend/.env`:

```env
APP_NAME=TrackVault
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

LOG_CHANNEL=daily
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trackvault_prod
DB_USERNAME=trackvault_user
DB_PASSWORD=strong_password_here

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

JWT_SECRET=
JWT_TTL=60
JWT_REFRESH_TTL=20160

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### Step 4: Generate Keys and Run Migrations

```bash
# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate --force

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Seed initial data (optional)
php artisan db:seed --force
```

### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/trackvault`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;
    
    root /var/www/TrackVault/backend/public;
    index index.php;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logging
    access_log /var/log/nginx/trackvault-access.log;
    error_log /var/log/nginx/trackvault-error.log;

    # Client upload size
    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
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

### Step 6: Set Up SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

### Step 7: Configure Cron Jobs

```bash
# Edit crontab
sudo crontab -e -u www-data

# Add Laravel scheduler
* * * * * cd /var/www/TrackVault/backend && php artisan schedule:run >> /dev/null 2>&1
```

### Step 8: Set Up Queue Worker (Optional)

Create systemd service `/etc/systemd/system/trackvault-worker.service`:

```ini
[Unit]
Description=TrackVault Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
Restart=always
RestartSec=5s
ExecStart=/usr/bin/php /var/www/TrackVault/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl enable trackvault-worker
sudo systemctl start trackvault-worker
sudo systemctl status trackvault-worker
```

## Frontend Deployment

### Method 1: Expo EAS Build (Recommended)

#### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo

```bash
eas login
```

#### Step 3: Configure EAS

```bash
cd frontend
eas build:configure
```

This creates `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### Step 4: Update app.json

```json
{
  "expo": {
    "name": "TrackVault",
    "slug": "trackvault",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourdomain.trackvault"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourdomain.trackvault"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

#### Step 5: Build for Android

```bash
# Production build
eas build --platform android --profile production

# Preview build (APK)
eas build --platform android --profile preview
```

#### Step 6: Build for iOS

```bash
eas build --platform ios --profile production
```

#### Step 7: Submit to App Stores

```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

### Method 2: Local Build

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

# Build IPA
expo build:ios
```

## Production Configuration

### Backend Optimizations

1. **Enable OPcache**

Edit `/etc/php/8.1/fpm/php.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
```

2. **Optimize PHP-FPM**

Edit `/etc/php/8.1/fpm/pool.d/www.conf`:

```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500
```

3. **Enable Redis Caching**

```bash
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### Frontend Environment Variables

Create `.env.production`:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Security Checklist

### Backend Security

- [ ] Set `APP_DEBUG=false` in production
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall (UFW/iptables)
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up fail2ban
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Use environment-specific JWT secrets
- [ ] Disable unnecessary PHP modules
- [ ] Set proper file permissions

### Frontend Security

- [ ] Use HTTPS for API calls
- [ ] Secure token storage
- [ ] Implement certificate pinning
- [ ] Code obfuscation
- [ ] Enable ProGuard (Android)
- [ ] App Transport Security (iOS)
- [ ] Regular dependency updates

## Monitoring & Maintenance

### Backend Monitoring

1. **Set up Log Monitoring**

```bash
# View Laravel logs
tail -f /var/www/TrackVault/backend/storage/logs/laravel.log

# View Nginx logs
tail -f /var/log/nginx/trackvault-error.log
```

2. **Database Backups**

```bash
# Create backup script
sudo nano /usr/local/bin/backup-trackvault.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/trackvault"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u trackvault_user -p trackvault_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-trackvault.sh

# Add to crontab
sudo crontab -e
0 2 * * * /usr/local/bin/backup-trackvault.sh
```

3. **Health Checks**

```bash
# Create health check endpoint
# Already available at /api/health (if implemented)

# Monitor with cron
*/5 * * * * curl -f https://api.yourdomain.com/api/health || echo "API Down!"
```

### Frontend Monitoring

1. **Expo Analytics**
2. **Sentry for error tracking**
3. **App store reviews monitoring**
4. **Crash analytics**

## Troubleshooting

### Common Issues

1. **Permission denied errors**
```bash
sudo chown -R www-data:www-data /var/www/TrackVault/backend
sudo chmod -R 775 storage bootstrap/cache
```

2. **502 Bad Gateway**
```bash
sudo systemctl restart php8.1-fpm
sudo systemctl restart nginx
```

3. **Database connection issues**
- Check database credentials in `.env`
- Verify database server is running
- Check firewall rules

4. **JWT token issues**
- Regenerate JWT secret
- Clear config cache
- Check token expiration settings

## Updates

### Backend Updates

```bash
cd /var/www/TrackVault/backend
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl restart php8.1-fpm
```

### Frontend Updates

```bash
cd frontend
git pull origin main
npm install
eas build --platform all --profile production
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/TrackVault/issues
- Email: support@yourdomain.com
- Documentation: https://docs.yourdomain.com

---

**Note**: Replace `yourdomain.com`, `yourusername`, and other placeholders with actual values.
