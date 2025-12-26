# FieldLedger Deployment Guide

This guide covers deployment strategies for both backend (Laravel) and frontend (React Native) components.

## Backend Deployment

### Prerequisites
- VPS or cloud server (AWS, DigitalOcean, etc.)
- Ubuntu 20.04+ or similar
- Domain name with SSL certificate
- MySQL 8.0+ database

### Server Setup

#### 1. Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx
```

#### 2. Configure MySQL
```bash
sudo mysql
```

```sql
CREATE DATABASE fieldledger;
CREATE USER 'fieldledger'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON fieldledger.* TO 'fieldledger'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Deploy Application
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/FieldLedger.git
cd FieldLedger/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Configure environment
cp .env.example .env
nano .env
```

Update `.env`:
```env
APP_NAME=FieldLedger
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fieldledger
DB_USERNAME=fieldledger
DB_PASSWORD=your-secure-password

# Generate a secure key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/fieldledger
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/FieldLedger/backend/public;

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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fieldledger /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Install SSL Certificate
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com
```

### Production Optimizations

#### Enable OPcache
```bash
sudo nano /etc/php/8.2/fpm/php.ini
```

Add:
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

#### Setup Queue Workers
```bash
sudo nano /etc/systemd/system/fieldledger-worker.service
```

```ini
[Unit]
Description=FieldLedger Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/FieldLedger/backend
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable fieldledger-worker
sudo systemctl start fieldledger-worker
```

#### Setup Cron Jobs
```bash
sudo crontab -e
```

Add:
```cron
* * * * * cd /var/www/FieldLedger/backend && php artisan schedule:run >> /dev/null 2>&1
```

### Monitoring & Logging

#### Log Rotation
```bash
sudo nano /etc/logrotate.d/fieldledger
```

```
/var/www/FieldLedger/backend/storage/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    sharedscripts
}
```

## Frontend Deployment

### Building for Production

#### iOS App Store
```bash
cd frontend

# Configure EAS
npm install -g eas-cli
eas login
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### Google Play Store
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### OTA Updates
```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

### Web Deployment
```bash
# Build for web
npm run build:web

# Deploy to hosting service (Vercel, Netlify, etc.)
vercel deploy --prod
```

## Docker Deployment

### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=db
      - DB_DATABASE=fieldledger
      - DB_USERNAME=fieldledger
      - DB_PASSWORD=secret
    depends_on:
      - db
    volumes:
      - ./backend:/var/www/html

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: fieldledger
      MYSQL_USER: fieldledger
      MYSQL_PASSWORD: secret
    volumes:
      - dbdata:/var/lib/mysql

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./backend/public:/var/www/html/public
    depends_on:
      - app

volumes:
  dbdata:
```

```bash
# Deploy
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate --force
```

## Environment Variables

### Backend Production
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=fieldledger
DB_USERNAME=fieldledger
DB_PASSWORD=your-secure-password

# Security
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=yourdomain.com

# Mail (for notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
```

### Frontend Production
```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Backup Strategy

### Database Backup
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u fieldledger -p fieldledger > /backups/db_$DATE.sql
gzip /backups/db_$DATE.sql

# Keep last 30 days
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

### Setup Cron
```bash
sudo crontab -e
```
```cron
0 2 * * * /path/to/backup.sh
```

## Monitoring

### Health Check Endpoint
Available at: `GET /api/health`

### Recommended Tools
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Bugsnag
- **Performance**: New Relic, DataDog
- **Logs**: ELK Stack, Papertrail

## Security Checklist

- [ ] SSL certificate installed
- [ ] Firewall configured (UFW)
- [ ] Database secured
- [ ] Environment variables secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Regular backups automated
- [ ] Monitoring setup
- [ ] Error logging configured

## Troubleshooting

### Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Check Logs
```bash
tail -f storage/logs/laravel.log
```

### Permission Issues
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

## Rollback Strategy

```bash
# Keep previous release
mv backend backend-previous
git clone -b stable backend

# If issues occur
rm -rf backend
mv backend-previous backend
sudo systemctl reload nginx
```

## Support

For deployment issues:
- Check logs: `storage/logs/laravel.log`
- Review Nginx logs: `/var/log/nginx/error.log`
- Contact: support@fieldledger.com

---

Last Updated: 2024-01-01
