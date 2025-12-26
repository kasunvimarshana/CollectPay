# FieldSyncLedger - Production Deployment Guide

## Overview

This guide covers deploying FieldSyncLedger to production environments. The application consists of:
- Laravel backend API
- MySQL database
- React Native mobile application

## Prerequisites

### Server Requirements

**Backend Server**:
- Ubuntu 20.04 LTS or higher (recommended)
- 2 CPU cores minimum (4+ recommended)
- 4GB RAM minimum (8GB+ recommended)
- 50GB storage minimum
- PHP 8.1 or higher
- MySQL 8.0 or higher
- Nginx or Apache web server
- SSL certificate (Let's Encrypt recommended)

**Mobile App Distribution**:
- Apple Developer Account (for iOS)
- Google Play Developer Account (for Android)
- EAS Build credits or local build environment

## Backend Deployment

### Option 1: Docker Deployment (Recommended)

#### 1. Prepare Production Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
```

#### 2. Clone and Configure

```bash
# Clone repository
git clone https://github.com/kasunvimarshana/FieldSyncLedger.git
cd FieldSyncLedger

# Create production environment file
cp backend/.env.example backend/.env
nano backend/.env
```

Update `.env` with production values:

```env
APP_NAME=FieldSyncLedger
APP_ENV=production
APP_DEBUG=false
APP_KEY=  # Generate with: php artisan key:generate
APP_URL=https://api.yourdomacom

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=fieldsyncledger
DB_USERNAME=laravel
DB_PASSWORD=STRONG_PASSWORD_HERE

# Generate secure passwords
MYSQL_ROOT_PASSWORD=STRONG_ROOT_PASSWORD
```

#### 3. Update Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: fieldsyncledger_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql-backup:/backup
    networks:
      - fieldsyncledger_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: fieldsyncledger_backend
    restart: always
    volumes:
      - ./backend/storage:/var/www/html/storage
      - ./backend/.env:/var/www/html/.env
    environment:
      - APP_ENV=production
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - fieldsyncledger_network

  nginx:
    image: nginx:alpine
    container_name: fieldsyncledger_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./backend/public:/var/www/html/public
    depends_on:
      - backend
    networks:
      - fieldsyncledger_network

volumes:
  mysql_data:
    driver: local

networks:
  fieldsyncledger_network:
    driver: bridge
```

#### 4. Create Production Dockerfile

Create `backend/Dockerfile.prod`:

```dockerfile
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]
```

#### 5. Configure Nginx

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;

    upstream backend {
        server backend:9000;
    }

    server {
        listen 80;
        server_name api.yourdomain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;
        root /var/www/html/public;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        index index.php;

        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }

        location ~ \.php$ {
            fastcgi_pass backend;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }

        location ~ /\.(?!well-known).* {
            deny all;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

#### 6. Deploy

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate --force

# Clear and cache config
docker-compose -f docker-compose.prod.yml exec backend php artisan config:cache
docker-compose -f docker-compose.prod.yml exec backend php artisan route:cache
docker-compose -f docker-compose.prod.yml exec backend php artisan view:cache

# Set proper permissions
docker-compose -f docker-compose.prod.yml exec backend chown -R www-data:www-data storage bootstrap/cache
```

### Option 2: Traditional Server Deployment

#### 1. Install Dependencies

```bash
# Install PHP and extensions
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
    php8.2-xml php8.2-bcmath php8.2-curl php8.2-gd

# Install MySQL
sudo apt install mysql-server

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Nginx
sudo apt install nginx
```

#### 2. Configure MySQL

```bash
sudo mysql_secure_installation

# Create database and user
sudo mysql
```

```sql
CREATE DATABASE fieldsyncledger;
CREATE USER 'laravel'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON fieldsyncledger.* TO 'laravel'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Deploy Application

```bash
# Clone to web directory
cd /var/www
sudo git clone https://github.com/kasunvimarshana/FieldSyncLedger.git
cd FieldSyncLedger/backend

# Install dependencies
sudo composer install --no-dev --optimize-autoloader

# Configure environment
sudo cp .env.example .env
sudo nano .env  # Update with production values

# Generate key
sudo php artisan key:generate

# Run migrations
sudo php artisan migrate --force

# Cache configuration
sudo php artisan config:cache
sudo php artisan route:cache
sudo php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data /var/www/FieldSyncLedger
sudo chmod -R 755 /var/www/FieldSyncLedger
sudo chmod -R 775 /var/www/FieldSyncLedger/backend/storage
sudo chmod -R 775 /var/www/FieldSyncLedger/backend/bootstrap/cache
```

#### 4. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/fieldsyncledger
```

Add configuration (similar to Docker nginx.conf above, adjust paths)

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fieldsyncledger /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

## Mobile App Deployment

### Building for iOS

#### 1. Configure EAS Build

```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure
```

#### 2. Update app.json

```json
{
  "expo": {
    "name": "FieldSyncLedger",
    "slug": "fieldsyncledger",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.fieldsyncledger",
      "buildNumber": "1"
    }
  }
}
```

#### 3. Build

```bash
# Build for iOS
eas build --platform ios

# Or build locally (requires Xcode)
eas build --platform ios --local
```

#### 4. Submit to App Store

```bash
eas submit --platform ios
```

### Building for Android

#### 1. Configure Build

Update `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.fieldsyncledger",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

#### 2. Build

```bash
# Build AAB for Play Store
eas build --platform android

# Or build APK for testing
eas build --platform android --profile preview
```

#### 3. Submit to Play Store

```bash
eas submit --platform android
```

### Update Production API URL

Before building, update the API URL:

```bash
# frontend/.env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Database Backup

### Automated Backup Script

Create `/home/ubuntu/backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/fieldsyncledger"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fieldsyncledger_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

docker-compose -f /var/www/FieldSyncLedger/docker-compose.prod.yml \
    exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD fieldsyncledger \
    | gzip > $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

Make executable and schedule:

```bash
chmod +x /home/ubuntu/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/ubuntu/backup-db.sh
```

## Monitoring and Logging

### Application Logs

```bash
# Backend logs (Docker)
docker-compose -f docker-compose.prod.yml logs -f backend

# Nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx

# Laravel logs
tail -f backend/storage/logs/laravel.log
```

### System Monitoring

Install monitoring tools:

```bash
# Install monitoring stack
sudo apt install prometheus grafana

# Or use cloud services
# - AWS CloudWatch
# - New Relic
# - Datadog
```

## Performance Optimization

### Backend Optimization

```bash
# Enable OPcache (in php.ini)
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000

# Use Redis for caching (optional)
docker-compose -f docker-compose.prod.yml exec backend composer require predis/predis

# Update .env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_HOST=redis
```

### Database Optimization

```sql
-- Add indexes for commonly queried fields
CREATE INDEX idx_collections_supplier_date ON collections(supplier_id, collection_date);
CREATE INDEX idx_payments_supplier ON payments(supplier_id);
CREATE INDEX idx_sync_status ON collections(sync_status);

-- Optimize tables
OPTIMIZE TABLE suppliers, products, collections, payments;
```

## Security Checklist

- [ ] SSL certificate installed and configured
- [ ] Firewall configured (UFW or iptables)
- [ ] SSH key-based authentication enabled
- [ ] Root login disabled
- [ ] Database accessible only from localhost
- [ ] Strong passwords for all accounts
- [ ] Regular security updates scheduled
- [ ] Backup and recovery tested
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] File permissions properly set

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (Nginx, HAProxy, AWS ELB)
- Deploy multiple backend instances
- Use shared session storage (Redis)
- Implement CDN for static assets

### Database Scaling

- Read replicas for read-heavy operations
- Database connection pooling
- Query optimization and indexing
- Consider managed database services (AWS RDS, Google Cloud SQL)

## Troubleshooting

### Common Issues

**502 Bad Gateway**:
- Check backend container is running
- Verify PHP-FPM is running
- Check nginx logs

**Database Connection Failed**:
- Verify MySQL container is running
- Check database credentials
- Ensure database migrations ran successfully

**SSL Certificate Issues**:
- Verify certificate files exist
- Check certificate expiry
- Ensure Certbot auto-renewal is working

## Rollback Procedure

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-tag>

# Restore database backup
gunzip < /var/backups/fieldsyncledger/backup.sql.gz | \
    docker-compose -f docker-compose.prod.yml exec -T mysql \
    mysql -u root -p$MYSQL_ROOT_PASSWORD fieldsyncledger

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# Run any necessary migrations rollback
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate:rollback
```

## Support and Maintenance

- Monitor error logs daily
- Apply security patches promptly
- Test backup restoration monthly
- Review and optimize database queries
- Update dependencies regularly
- Monitor server resources (CPU, RAM, disk)

## Additional Resources

- [Laravel Deployment Docs](https://laravel.com/docs/deployment)
- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
