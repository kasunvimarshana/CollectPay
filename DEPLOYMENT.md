# Collectix Deployment Guide

This guide covers deploying Collectix to production environments.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Database backup created
- [ ] Environment variables configured
- [ ] SSL certificate obtained
- [ ] Domain name configured
- [ ] Server resources adequate
- [ ] Security measures reviewed

## Backend Deployment (Laravel)

### Option 1: Traditional Server (VPS/Dedicated)

#### 1. Server Preparation

**Install Requirements:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl
sudo apt install mysql-server nginx git composer
```

#### 2. Clone and Setup

```bash
cd /var/www
sudo git clone https://github.com/kasunvimarshana/Collectix.git
cd Collectix/backend
sudo composer install --optimize-autoloader --no-dev
```

#### 3. Configure Environment

```bash
sudo cp .env.example .env
sudo nano .env
```

Update production settings:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=collectix_prod
DB_USERNAME=collectix_user
DB_PASSWORD=strong_password_here
```

#### 4. Generate Keys and Setup

```bash
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 5. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/Collectix
sudo chmod -R 755 /var/www/Collectix
sudo chmod -R 775 /var/www/Collectix/backend/storage
sudo chmod -R 775 /var/www/Collectix/backend/bootstrap/cache
```

#### 6. Nginx Configuration

Create `/etc/nginx/sites-available/collectix`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/Collectix/backend/public;

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

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/collectix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. SSL Configuration (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Platform as a Service

#### Laravel Forge
1. Connect your server to Forge
2. Create new site
3. Deploy repository
4. Configure environment
5. Enable SSL

#### Heroku
1. Create Heroku app
2. Add MySQL addon
3. Configure buildpacks
4. Deploy via Git

## Frontend Deployment (React Native)

### Option 1: Expo Application Services (EAS)

#### 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

#### 2. Configure EAS

```bash
cd frontend
eas build:configure
```

#### 3. Build for Production

**Android:**
```bash
eas build --platform android --profile production
```

**iOS:**
```bash
eas build --platform ios --profile production
```

#### 4. Submit to Stores

**Android (Google Play):**
```bash
eas submit --platform android
```

**iOS (App Store):**
```bash
eas submit --platform ios
```

### Option 2: Web Deployment

#### Build Web Version

```bash
cd frontend
npx expo export:web
```

#### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --dir=web-build --prod
```

#### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

## Database Management

### Backup Strategy

**Automated Daily Backups:**
```bash
# Create backup script
cat > /usr/local/bin/backup-collectix.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/collectix"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u collectix_user -p'password' collectix_prod > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-collectix.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-collectix.sh") | crontab -
```

## Monitoring

### Application Monitoring

**Laravel Telescope (Development Only):**
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

### Server Monitoring

Install monitoring tools:
- **New Relic** for application performance
- **Sentry** for error tracking
- **Datadog** for infrastructure monitoring

## Security Hardening

### 1. Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 3. Regular Updates

```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Environment Security

- Never commit `.env` to version control
- Use strong database passwords
- Rotate API keys regularly
- Enable two-factor authentication for admin accounts

## Performance Optimization

### 1. Enable OPcache

Edit `/etc/php/8.2/fpm/php.ini`:
```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
```

### 2. Redis Caching

```bash
sudo apt install redis-server
composer require predis/predis
```

Update `.env`:
```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### 3. Database Optimization

```sql
-- Add indexes
ALTER TABLE collections ADD INDEX idx_collection_date (collection_date);
ALTER TABLE payments ADD INDEX idx_payment_date (payment_date);
```

## Rollback Strategy

### Quick Rollback

```bash
cd /var/www/Collectix/backend
git log --oneline -10
git checkout <previous-commit-hash>
composer install
php artisan migrate:rollback
php artisan config:cache
```

## Health Checks

### Create Health Check Endpoint

Add to `routes/api.php`:
```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
    ]);
});
```

### Monitor with Uptime Robot or Pingdom

Set up monitoring for:
- `https://your-domain.com/api/health`
- Response time alerts
- Downtime notifications

## Post-Deployment

1. Test all functionality
2. Monitor logs for errors
3. Check performance metrics
4. Verify SSL certificate
5. Test from different devices
6. Review security headers

## Support and Maintenance

- Schedule regular security updates
- Monitor application logs
- Review database performance
- Update dependencies monthly
- Backup verification weekly

## Emergency Contacts

Maintain a list of:
- Server provider support
- Database administrator
- Development team
- Security team

## License

Ensure proper licensing for all components used in production.
