# PayMaster Deployment Guide

## Overview

This guide provides detailed instructions for deploying the PayMaster application to production environments.

## Prerequisites

### Server Requirements

**Backend Server**:
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 2+ CPU cores
- 4+ GB RAM
- 20+ GB SSD storage
- Public IP address
- Domain name (optional but recommended)

**Software Requirements**:
- PHP 8.1 or higher
- MySQL 8.0 or MariaDB 10.5+
- Composer
- Nginx or Apache
- SSL certificate (Let's Encrypt recommended)
- Git

**Mobile App Requirements**:
- Expo account
- Apple Developer account (for iOS)
- Google Play Developer account (for Android)

## Backend Deployment

### Option 1: Traditional VPS Deployment

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP and extensions
sudo apt install -y php8.3 php8.3-cli php8.3-fpm php8.3-mysql php8.3-mbstring \
    php8.3-xml php8.3-bcmath php8.3-curl php8.3-zip php8.3-gd

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Git
sudo apt install -y git

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Create Database

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p

# In MySQL prompt:
CREATE DATABASE paymaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'paymaster'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON paymaster.* TO 'paymaster'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 3: Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/paymaster
sudo chown $USER:$USER /var/www/paymaster

# Clone repository
cd /var/www/paymaster
git clone https://github.com/kasunvimarshana/PayMaster.git .

# Navigate to backend
cd backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Configure environment
cp .env.example .env
nano .env
```

**Configure .env**:
```env
APP_NAME=PayMaster
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.paymaster.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paymaster
DB_USERNAME=paymaster
DB_PASSWORD=your_strong_password

SANCTUM_STATEFUL_DOMAINS=app.paymaster.com,admin.paymaster.com
SESSION_DRIVER=cookie
SESSION_LIFETIME=120

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_LEVEL=error
```

#### Step 4: Run Migrations

```bash
# Run database migrations
mysql -u paymaster -p paymaster < database/migrations/001_create_users_table.sql
mysql -u paymaster -p paymaster < database/migrations/002_create_suppliers_table.sql
mysql -u paymaster -p paymaster < database/migrations/003_create_products_table.sql
mysql -u paymaster -p paymaster < database/migrations/004_create_product_rates_table.sql
mysql -u paymaster -p paymaster < database/migrations/005_create_collections_table.sql
mysql -u paymaster -p paymaster < database/migrations/006_create_payments_table.sql
mysql -u paymaster -p paymaster < database/migrations/007_create_sync_logs_table.sql

# Optional: Load sample data (development only)
# mysql -u paymaster -p paymaster < database/seeds/sample_data.sql
```

#### Step 5: Set Permissions

```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/paymaster/backend/storage
sudo chown -R www-data:www-data /var/www/paymaster/backend/bootstrap/cache

# Set proper permissions
sudo chmod -R 755 /var/www/paymaster/backend/storage
sudo chmod -R 755 /var/www/paymaster/backend/bootstrap/cache
```

#### Step 6: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/paymaster
```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name api.paymaster.com;
    root /var/www/paymaster/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;

    charset utf-8;

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

**Enable site**:
```bash
sudo ln -s /etc/nginx/sites-available/paymaster /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Configure SSL

```bash
# Obtain SSL certificate
sudo certbot --nginx -d api.paymaster.com

# Certificate auto-renewal
sudo certbot renew --dry-run
```

#### Step 8: Configure Firewall

```bash
# UFW firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Option 2: Docker Deployment

#### Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

#### Step 2: Deploy with Docker

```bash
# Clone repository
git clone https://github.com/kasunvimarshana/PayMaster.git
cd PayMaster

# Configure environment
cd backend
cp .env.example .env
nano .env  # Configure for production

# Build and start services
cd ..
docker-compose up -d

# Run migrations
docker-compose exec backend mysql -u paymaster -p paymaster < backend/database/migrations/001_create_users_table.sql
# ... (run all migrations)

# View logs
docker-compose logs -f
```

### Option 3: Cloud Platform Deployment

#### AWS Deployment

**Services Used**:
- EC2 for backend
- RDS for MySQL
- S3 for backups
- CloudFront for CDN
- Route 53 for DNS
- Certificate Manager for SSL

#### DigitalOcean Deployment

**Services Used**:
- Droplet for backend
- Managed Database for MySQL
- Spaces for backups
- Load Balancer (optional)

#### Heroku Deployment

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create paymaster-api

# Add MySQL addon
heroku addons:create cleardb:ignite

# Deploy
git push heroku main

# Run migrations
heroku run bash
# Then run migrations manually
```

## Frontend Deployment

### Expo EAS Build

#### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

#### Step 2: Configure EAS

```bash
cd frontend

# Login to Expo
eas login

# Configure project
eas build:configure
```

**eas.json**:
```json
{
  "build": {
    "production": {
      "env": {
        "NODE_ENV": "production"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEFGHIJ"
      }
    }
  }
}
```

#### Step 3: Build Apps

**Android Build**:
```bash
eas build --platform android --profile production
```

**iOS Build**:
```bash
eas build --platform ios --profile production
```

#### Step 4: Submit to Stores

**Google Play Store**:
```bash
eas submit --platform android --profile production
```

**Apple App Store**:
```bash
eas submit --platform ios --profile production
```

### Alternative: Standalone APK

```bash
# Build standalone APK
eas build --platform android --profile production

# Download APK
eas build:download --platform android --latest

# Distribute APK directly to users
# Upload to website or send directly
```

## Post-Deployment Configuration

### 1. Database Optimization

```sql
-- Optimize tables
OPTIMIZE TABLE users, suppliers, products, product_rates, collections, payments;

-- Analyze tables
ANALYZE TABLE users, suppliers, products, product_rates, collections, payments;

-- Check indexes
SHOW INDEX FROM collections;
SHOW INDEX FROM payments;
```

### 2. Performance Optimization

**PHP Configuration** (`/etc/php/8.3/fpm/php.ini`):
```ini
memory_limit = 256M
max_execution_time = 60
upload_max_filesize = 10M
post_max_size = 10M
opcache.enable = 1
opcache.memory_consumption = 128
opcache.max_accelerated_files = 10000
```

**Nginx Configuration**:
```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

# Enable caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Monitoring Setup

**Install monitoring tools**:
```bash
# Install monitoring tools
sudo apt install -y htop nethogs iotop

# Install log monitoring
sudo apt install -y logwatch
```

**Setup log rotation** (`/etc/logrotate.d/paymaster`):
```
/var/www/paymaster/backend/storage/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 4. Backup Configuration

**Database Backup Script** (`/usr/local/bin/backup-paymaster.sh`):
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/paymaster"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u paymaster -p'password' paymaster | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads (if any)
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/paymaster/backend/storage/app

# Remove backups older than 30 days
find $BACKUP_DIR -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 sync $BACKUP_DIR s3://paymaster-backups/
```

**Make executable and schedule**:
```bash
sudo chmod +x /usr/local/bin/backup-paymaster.sh

# Add to crontab
sudo crontab -e

# Add this line (daily at 2 AM)
0 2 * * * /usr/local/bin/backup-paymaster.sh
```

### 5. Security Hardening

```bash
# Disable PHP functions
# Edit /etc/php/8.3/fpm/php.ini
disable_functions = exec,passthru,shell_exec,system,proc_open,popen

# Enable mod_security (optional)
sudo apt install -y libapache2-mod-security2

# Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Health Checks and Monitoring

### Backend Health Check Endpoint

Create `/api/health`:
```php
// Returns system status
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0",
  "timestamp": "2025-12-23T10:00:00Z"
}
```

### Monitoring Checklist

- [ ] API response times < 500ms
- [ ] Database queries < 100ms
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Disk usage < 80%
- [ ] Error rate < 1%
- [ ] Backup success rate = 100%

## Rollback Procedure

### Backend Rollback

```bash
# Stop services
sudo systemctl stop nginx
sudo systemctl stop php8.3-fpm

# Restore database backup
gunzip < /var/backups/paymaster/db_20251223_020000.sql.gz | mysql -u paymaster -p paymaster

# Revert code
cd /var/www/paymaster
git checkout previous_stable_version

# Restart services
sudo systemctl start php8.3-fpm
sudo systemctl start nginx
```

### Mobile App Rollback

- Cannot rollback mobile apps automatically
- Release new version with fixes
- Or revert to previous version in stores

## Scaling Considerations

### Horizontal Scaling

**Load Balancer Setup**:
```nginx
upstream backend {
    server backend1.paymaster.com;
    server backend2.paymaster.com;
    server backend3.paymaster.com;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### Database Scaling

**Read Replicas**:
- Master for writes
- Replicas for reads
- Load balancing between replicas

**Database Sharding** (if needed):
- Shard by region
- Shard by user ID range

### Caching Layer

**Redis Setup**:
```bash
# Install Redis
sudo apt install -y redis-server

# Configure caching in .env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check backup status
- Review access logs

**Weekly**:
- Review performance metrics
- Check disk space
- Update dependencies (security patches)

**Monthly**:
- Database optimization
- Log cleanup
- Security audit
- Performance review

### Update Procedure

```bash
# 1. Backup everything
/usr/local/bin/backup-paymaster.sh

# 2. Enable maintenance mode (if available)
# Display maintenance page

# 3. Pull latest code
cd /var/www/paymaster
git pull origin main

# 4. Update dependencies
cd backend
composer install --no-dev --optimize-autoloader

# 5. Run migrations
# mysql commands...

# 6. Clear cache
# Clear application cache if implemented

# 7. Restart services
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx

# 8. Disable maintenance mode
# Remove maintenance page

# 9. Verify deployment
curl https://api.paymaster.com/api/health
```

## Troubleshooting

### Common Issues

**500 Internal Server Error**:
- Check PHP error logs: `sudo tail -f /var/log/php8.3-fpm.log`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Check application logs: `tail -f /var/www/paymaster/backend/storage/logs/laravel.log`

**Database Connection Issues**:
- Verify credentials in `.env`
- Check MySQL is running: `sudo systemctl status mysql`
- Test connection: `mysql -u paymaster -p`

**Permission Issues**:
- Reset permissions: See Step 5 above
- Check file ownership: `ls -la /var/www/paymaster/backend/storage`

## Support

For deployment issues:
- Check logs first
- Review this guide
- Contact support: support@paymaster.com

---

**Deployment Complete!** Your PayMaster application is now running in production.
