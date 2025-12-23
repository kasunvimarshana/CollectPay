# Deployment Guide

## Production Deployment Guide for TransacTrack

This guide covers deploying both the Laravel backend and React Native mobile app to production.

## Prerequisites

### Backend Requirements
- Ubuntu 20.04+ or similar Linux distribution
- PHP 8.1 or higher
- MySQL 5.7+ or MariaDB 10.3+
- Nginx or Apache
- Composer
- Git
- SSL certificate

### Mobile App Requirements
- Apple Developer Account (iOS)
- Google Play Console Account (Android)
- Expo account
- Node.js 18+

## Backend Deployment

### 1. Server Setup

#### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

#### Install PHP and Extensions
```bash
sudo apt install -y php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring \
php8.1-curl php8.1-zip php8.1-bcmath php8.1-intl
```

#### Install MySQL
```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### Install Nginx
```bash
sudo apt install nginx
```

#### Install Composer
```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
sudo mv composer.phar /usr/local/bin/composer
```

### 2. Application Setup

#### Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/kasunvimarshana/TransacTrack.git
cd TransacTrack/backend
```

#### Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/TransacTrack
sudo chmod -R 755 /var/www/TransacTrack
sudo chmod -R 775 /var/www/TransacTrack/backend/storage
sudo chmod -R 775 /var/www/TransacTrack/backend/bootstrap/cache
```

#### Install Dependencies
```bash
composer install --no-dev --optimize-autoloader
```

#### Configure Environment
```bash
cp .env.example .env
nano .env
```

Edit `.env`:
```env
APP_NAME=TransacTrack
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.transactrack.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=transactrack_prod
DB_USERNAME=transactrack_user
DB_PASSWORD=STRONG_PASSWORD_HERE

DATA_ENCRYPTION_KEY=GENERATE_STRONG_KEY
```

#### Generate Keys
```bash
php artisan key:generate
```

#### Run Migrations
```bash
php artisan migrate --force
```

#### Optimize Application
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Database Setup

#### Create Database and User
```bash
sudo mysql
```

```sql
CREATE DATABASE transactrack_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'transactrack_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON transactrack_prod.* TO 'transactrack_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Web Server Configuration

#### Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/transactrack
```

Add:
```nginx
server {
    listen 80;
    server_name api.transactrack.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.transactrack.com;
    root /var/www/TransacTrack/backend/public;

    ssl_certificate /etc/letsencrypt/live/api.transactrack.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.transactrack.com/privkey.pem;

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
sudo ln -s /etc/nginx/sites-available/transactrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Certificate

#### Using Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.transactrack.com
```

#### Auto-renewal
```bash
sudo certbot renew --dry-run
```

### 6. Process Manager (Optional)

#### Install Supervisor
```bash
sudo apt install supervisor
```

#### Configure Queue Worker
```bash
sudo nano /etc/supervisor/conf.d/transactrack-worker.conf
```

Add:
```ini
[program:transactrack-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/TransacTrack/backend/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/TransacTrack/backend/storage/logs/worker.log
```

Start worker:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start transactrack-worker:*
```

### 7. Firewall Configuration

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 8. Backup Configuration

#### Database Backup Script
```bash
sudo nano /usr/local/bin/backup-transactrack-db.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/transactrack"
mkdir -p $BACKUP_DIR

mysqldump -u transactrack_user -p'PASSWORD' transactrack_prod | \
gzip > $BACKUP_DIR/transactrack_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "transactrack_*.sql.gz" -mtime +30 -delete
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-transactrack-db.sh
```

#### Schedule Backup
```bash
sudo crontab -e
```

Add:
```cron
0 2 * * * /usr/local/bin/backup-transactrack-db.sh
```

### 9. Monitoring Setup

#### Install Monitoring Tools
```bash
sudo apt install monit
```

#### Configure Monitoring
```bash
sudo nano /etc/monit/conf.d/transactrack
```

Add:
```
check process nginx with pidfile /var/run/nginx.pid
    start program = "/usr/sbin/service nginx start"
    stop program = "/usr/sbin/service nginx stop"
    if failed host 127.0.0.1 port 80 then restart

check process mysql with pidfile /var/run/mysqld/mysqld.pid
    start program = "/usr/sbin/service mysql start"
    stop program = "/usr/sbin/service mysql stop"
    if failed host 127.0.0.1 port 3306 then restart
```

## Mobile App Deployment

### 1. Prepare for Build

#### Update Configuration
Edit `mobile/app.json`:
```json
{
  "expo": {
    "name": "TransacTrack",
    "slug": "transactrack",
    "version": "1.0.0",
    "extra": {
      "apiUrl": "https://api.transactrack.com/api"
    }
  }
}
```

#### Install Dependencies
```bash
cd mobile
npm install
```

### 2. iOS Deployment

#### Prerequisites
- macOS with Xcode
- Apple Developer Account ($99/year)
- Valid certificates and provisioning profiles

#### Build for iOS
```bash
expo build:ios
```

Follow prompts:
1. Select build type (archive or app-store)
2. Provide credentials
3. Wait for build to complete

#### Submit to App Store
1. Download IPA from Expo
2. Use Xcode or Application Loader
3. Submit for review

### 3. Android Deployment

#### Build for Android
```bash
expo build:android -t app-bundle
```

Follow prompts:
1. Generate or provide keystore
2. Wait for build to complete

#### Submit to Play Store
1. Download AAB from Expo
2. Upload to Play Console
3. Complete store listing
4. Submit for review

### 4. Over-the-Air Updates (OTA)

#### Configure Updates
```bash
expo publish
```

Updates will be delivered automatically to users.

## Post-Deployment

### 1. Verification Checklist

- [ ] API endpoints responding
- [ ] Database connections working
- [ ] SSL certificate valid
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] Email notifications working (if configured)
- [ ] Backup script running
- [ ] Monitoring active
- [ ] Logs rotating properly
- [ ] Mobile app connecting to API

### 2. Performance Tuning

#### PHP-FPM Optimization
```bash
sudo nano /etc/php/8.1/fpm/pool.d/www.conf
```

Adjust:
```ini
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
```

#### MySQL Optimization
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add:
```ini
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
```

### 3. Monitoring and Maintenance

#### Log Monitoring
```bash
tail -f /var/www/TransacTrack/backend/storage/logs/laravel.log
```

#### System Resources
```bash
htop
df -h
free -m
```

#### Database Performance
```bash
mysql -u root -p
SHOW PROCESSLIST;
SHOW STATUS;
```

## Rollback Procedure

### If Issues Occur

1. **Revert Code**
```bash
cd /var/www/TransacTrack
git checkout <previous-commit>
composer install --no-dev
```

2. **Restore Database**
```bash
gunzip < /var/backups/transactrack/transactrack_YYYYMMDD.sql.gz | \
mysql -u transactrack_user -p transactrack_prod
```

3. **Clear Cache**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## Security Hardening

### Additional Security Measures

1. **Install Fail2ban**
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

2. **Disable Root Login**
```bash
sudo nano /etc/ssh/sshd_config
```
Set: `PermitRootLogin no`

3. **Enable Automatic Security Updates**
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## Support

For deployment issues:
- Email: devops@transactrack.com
- Documentation: https://docs.transactrack.com/deployment
- GitHub Issues: https://github.com/kasunvimarshana/TransacTrack/issues
