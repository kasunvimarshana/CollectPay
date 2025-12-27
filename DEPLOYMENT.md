# TrackVault - Deployment Guide

## Prerequisites

### Backend Requirements
- **Server**: Linux (Ubuntu 20.04+ recommended)
- **PHP**: 8.2 or higher with extensions:
  - pdo_mysql
  - openssl
  - json
  - mbstring
- **Database**: MySQL 5.7+ or PostgreSQL 12+
- **Web Server**: Apache or Nginx
- **Composer**: Latest version

### Frontend Requirements
- **Node.js**: 18+ LTS
- **npm or yarn**: Latest version
- **Expo CLI**: For building mobile apps

## Backend Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml php8.2-curl

# Install MySQL
sudo apt install -y mysql-server

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 2. Database Setup

```bash
# Login to MySQL
sudo mysql -u root

# Create database and user
CREATE DATABASE trackvault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'trackvault'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON trackvault.* TO 'trackvault'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run migrations
mysql -u trackvault -p trackvault < backend/database/migrations/001_create_tables.sql
```

### 3. Application Setup

```bash
# Clone repository
git clone https://github.com/yourusername/TrackVault.git
cd TrackVault/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings
```

### 4. Environment Configuration

Edit `backend/.env`:

```ini
# Application
APP_ENV=production
APP_DEBUG=false

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trackvault
DB_USER=trackvault
DB_PASSWORD=your-secure-password

# Security (Generate secure random strings!)
JWT_SECRET=your-secure-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-secure-encryption-key-exactly-32-chars

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

### 5. Web Server Configuration

#### Nginx Configuration

Create `/etc/nginx/sites-available/trackvault`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/TrackVault/backend/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
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
sudo ln -s /etc/nginx/sites-available/trackvault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 7. Permissions

```bash
cd /var/www/TrackVault/backend
sudo chown -R www-data:www-data storage
sudo chmod -R 775 storage
```

## Frontend Deployment

### 1. Build for Production

```bash
cd frontend

# Install dependencies
npm install

# Configure production API endpoint
echo "API_BASE_URL=https://api.yourdomain.com/api" > .env

# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### 2. App Store Deployment

#### iOS (Apple App Store)
1. Create App Store Connect account
2. Create app in App Store Connect
3. Upload IPA file using Transporter or Xcode
4. Submit for review

#### Android (Google Play Store)
1. Create Google Play Console account
2. Create new application
3. Upload APK/AAB file
4. Submit for review

## Security Hardening

### 1. Generate Secure Keys

```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate Encryption Key (exactly 32 characters)
openssl rand -hex 16
```

### 2. Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 3. Database Security

```bash
# Run MySQL secure installation
sudo mysql_secure_installation
```

### 4. Regular Updates

```bash
# Create update script
cat > /usr/local/bin/update-trackvault.sh << 'EOF'
#!/bin/bash
cd /var/www/TrackVault
git pull
cd backend
composer install --no-dev --optimize-autoloader
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
EOF

chmod +x /usr/local/bin/update-trackvault.sh
```

## Monitoring

### 1. Application Logs

```bash
# View backend logs
tail -f /var/www/TrackVault/backend/storage/logs/*.log

# View Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# View PHP-FPM logs
tail -f /var/log/php8.2-fpm.log
```

### 2. Database Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-trackvault.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/trackvault"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u trackvault -p trackvault > $BACKUP_DIR/trackvault_$DATE.sql
gzip $BACKUP_DIR/trackvault_$DATE.sql
# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-trackvault.sh

# Add to cron (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-trackvault.sh
```

### 3. Performance Monitoring

Consider using:
- New Relic
- Datadog
- Sentry for error tracking

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Database Replication**: MySQL master-slave setup
3. **Session Storage**: Use Redis for shared sessions
4. **File Storage**: Use S3 or similar for file uploads

### Vertical Scaling

Increase server resources as needed:
- CPU: 2-4 cores minimum
- RAM: 4-8 GB minimum
- Storage: SSD recommended

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   sudo chown -R www-data:www-data /var/www/TrackVault/backend/storage
   ```

2. **Database Connection Issues**
   - Check credentials in `.env`
   - Verify MySQL is running: `sudo systemctl status mysql`

3. **PHP Extension Missing**
   ```bash
   sudo apt install php8.2-{extension-name}
   sudo systemctl restart php8.2-fpm
   ```

## Rollback Procedure

```bash
# Rollback to previous version
cd /var/www/TrackVault
git log --oneline  # Find previous commit
git checkout {commit-hash}
cd backend
composer install --no-dev
sudo systemctl restart php8.2-fpm
```

## Support

For production support issues:
1. Check application logs
2. Check audit logs in database
3. Review error messages
4. Contact development team

## Maintenance Schedule

Recommended maintenance windows:
- **Weekly**: Log review and cleanup
- **Monthly**: Security updates
- **Quarterly**: Performance optimization
- **Annually**: Security audit
