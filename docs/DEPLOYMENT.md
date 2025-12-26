# SyncLedger Deployment Guide

## Production Deployment

### Prerequisites

- Ubuntu 20.04+ or CentOS 8+ server
- Minimum 2GB RAM, 2 CPU cores
- 20GB storage
- Domain name with SSL certificate
- MySQL 8.0+
- PHP 8.1+
- Composer
- Node.js 16+ (for frontend build)

### Backend Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-mbstring \
  php8.1-xml php8.1-bcmath php8.1-curl php8.1-zip \
  nginx mysql-server composer git

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. MySQL Setup

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
```

```sql
CREATE DATABASE syncledger CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'syncledger'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON syncledger.* TO 'syncledger'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Deploy Backend

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-repo/SyncLedger.git
cd SyncLedger/backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Configure environment
cp .env.example .env
nano .env
```

Update `.env`:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=syncledger
DB_USERNAME=syncledger
DB_PASSWORD=secure_password_here

# Generate secure key
APP_KEY=
ENCRYPTION_KEY=
```

```bash
# Generate keys
php artisan key:generate

# Run migrations
php artisan migrate --force

# Set permissions
sudo chown -R www-data:www-data /var/www/SyncLedger/backend/storage
sudo chown -R www-data:www-data /var/www/SyncLedger/backend/bootstrap/cache
sudo chmod -R 775 /var/www/SyncLedger/backend/storage
sudo chmod -R 775 /var/www/SyncLedger/backend/bootstrap/cache
```

#### 4. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/syncledger
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/SyncLedger/backend/public;

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
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
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
sudo ln -s /etc/nginx/sites-available/syncledger /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL Certificate

```bash
sudo certbot --nginx -d api.yourdomain.com
```

#### 6. Schedule Tasks (Optional)

```bash
sudo crontab -e
```

Add:
```
* * * * * cd /var/www/SyncLedger/backend && php artisan schedule:run >> /dev/null 2>&1
```

### Frontend Deployment

#### 1. Build for Android

```bash
cd frontend

# Install dependencies
npm install

# Build APK
expo build:android

# Or build AAB for Play Store
expo build:android -t app-bundle
```

#### 2. Build for iOS

```bash
# Build IPA
expo build:ios

# Submit to App Store
expo upload:ios
```

#### 3. Over-the-Air Updates (Optional)

```bash
# Publish update
expo publish

# Users will automatically receive updates
```

### Docker Deployment (Alternative)

```bash
# Clone repository
git clone https://github.com/your-repo/SyncLedger.git
cd SyncLedger

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend php artisan migrate --force

# Check status
docker-compose ps
```

## Monitoring

### Application Monitoring

#### Laravel Logs
```bash
tail -f /var/www/SyncLedger/backend/storage/logs/laravel.log
```

#### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Database Backup

```bash
# Daily backup script
nano /usr/local/bin/backup-syncledger.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/syncledger"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u syncledger -p'secure_password_here' syncledger | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /usr/local/bin/backup-syncledger.sh

# Add to crontab
sudo crontab -e
```

Add:
```
0 2 * * * /usr/local/bin/backup-syncledger.sh >> /var/log/syncledger-backup.log 2>&1
```

### Performance Monitoring

#### Install monitoring tools
```bash
# Install htop for system monitoring
sudo apt install -y htop

# Install MySQL tuning tool
sudo apt install -y mysqltuner

# Run tuner
sudo mysqltuner
```

## Security Hardening

### Firewall Setup

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow MySQL only from localhost
sudo ufw deny 3306

# Check status
sudo ufw status
```

### Fail2Ban Setup

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true
```

```bash
sudo systemctl restart fail2ban
```

### Regular Updates

```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Composer updates (test first!)
cd /var/www/SyncLedger/backend
composer update

# Run migrations
php artisan migrate
```

## Troubleshooting

### Backend Issues

#### Check PHP-FPM status
```bash
sudo systemctl status php8.1-fpm
```

#### Check Laravel logs
```bash
tail -f storage/logs/laravel.log
```

#### Clear cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Database Issues

#### Check MySQL status
```bash
sudo systemctl status mysql
```

#### Check connections
```bash
mysql -u syncledger -p -e "SHOW PROCESSLIST;"
```

#### Optimize tables
```bash
mysql -u syncledger -p syncledger -e "OPTIMIZE TABLE suppliers, products, rates, collections, payments;"
```

### Performance Issues

#### Check disk space
```bash
df -h
```

#### Check memory usage
```bash
free -m
```

#### Check slow queries
```bash
mysql -u root -p -e "SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;"
```

## Rollback Procedure

### Database Rollback

```bash
# Restore from backup
gunzip < /backups/syncledger/db_20240115_020000.sql.gz | mysql -u syncledger -p syncledger
```

### Code Rollback

```bash
cd /var/www/SyncLedger/backend
git log --oneline
git reset --hard <commit-hash>
composer install
php artisan migrate
sudo systemctl reload php8.1-fpm
```

## Health Checks

### API Health Check
```bash
curl https://api.yourdomain.com/api/sync/status
```

Expected response:
```json
{
  "status": "online",
  "server_time": "2024-01-15T10:30:00Z"
}
```

### Database Health Check
```bash
mysql -u syncledger -p -e "SELECT COUNT(*) FROM suppliers;"
```

## Support Contacts

- Technical Issues: support@yourdomain.com
- Emergency: +1234567890
- Documentation: https://docs.yourdomain.com
