# Production Deployment Checklist

**Project:** Data Collection and Payment Management System  
**Date:** January 7, 2026  
**Version:** 1.0.0

---

## Pre-Deployment Checklist

### 1. Backend Configuration ✅

#### Environment Variables
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure `APP_URL` to production domain
- [ ] Generate new `APP_KEY` for production
- [ ] Generate new `JWT_SECRET` for production
- [ ] Configure database credentials
- [ ] Set up mail server configuration
- [ ] Configure cache driver (Redis recommended)
- [ ] Configure queue driver (Redis/SQS recommended)
- [ ] Configure session driver (Redis/database)
- [ ] Set up file storage (S3/local)
- [ ] Configure log channel (daily/slack)

#### Database
- [ ] Choose production database (MySQL/PostgreSQL)
- [ ] Create production database
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Run seeders if needed: `php artisan db:seed --class=RoleSeeder`
- [ ] Create database backups schedule
- [ ] Set up database indexing
- [ ] Configure database connection pooling
- [ ] Test database connectivity

#### Security
- [ ] Enable SSL/TLS certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable HTTPS redirect
- [ ] Configure secure headers
- [ ] Set up firewall rules
- [ ] Disable directory listing
- [ ] Remove .git folder from public access
- [ ] Secure .env file (chmod 600)
- [ ] Set up API authentication tokens

#### Performance
- [ ] Enable OPcache
- [ ] Configure Redis/Memcached
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan view:cache`
- [ ] Enable compression (gzip)
- [ ] Set up CDN for assets
- [ ] Configure query caching
- [ ] Optimize database indexes

### 2. Frontend Configuration ✅

#### Environment Variables
- [ ] Set `EXPO_PUBLIC_ENV=production`
- [ ] Configure `EXPO_PUBLIC_API_URL` to production API
- [ ] Update `EXPO_PUBLIC_APP_VERSION`
- [ ] Verify API endpoints
- [ ] Test API connectivity

#### Build
- [ ] Build production bundle
- [ ] Test on Android devices
- [ ] Test on iOS devices (if applicable)
- [ ] Verify app icons and splash screens
- [ ] Test offline functionality
- [ ] Test sync mechanisms
- [ ] Verify all screens work

#### App Store Deployment
- [ ] Create app store accounts
- [ ] Prepare app screenshots
- [ ] Write app description
- [ ] Set up app signing certificates
- [ ] Build release APK/IPA
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store (if applicable)

### 3. Infrastructure Setup ✅

#### Server Requirements
- [ ] PHP 8.3+ installed
- [ ] Composer 2.x installed
- [ ] Node.js 20.x installed (for assets)
- [ ] Database server (MySQL 8.0+/PostgreSQL 13+)
- [ ] Redis server (optional but recommended)
- [ ] Nginx/Apache web server
- [ ] SSL certificate installed
- [ ] Configure web server (nginx.conf/httpd.conf)

#### Server Configuration
```nginx
# Example Nginx Configuration
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;
    root /var/www/ledger/backend/public;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

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

#### Firewall Configuration
```bash
# UFW Firewall Rules
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 4. Monitoring & Logging ✅

#### Application Monitoring
- [ ] Set up error tracking (Sentry/Bugsnag)
- [ ] Configure uptime monitoring (UptimeRobot/Pingdom)
- [ ] Set up performance monitoring (New Relic/DataDog)
- [ ] Configure log aggregation (Loggly/Papertrail/ELK)
- [ ] Set up alert notifications (Slack/Email)
- [ ] Monitor disk space
- [ ] Monitor database performance
- [ ] Monitor API response times

#### Log Configuration
```env
# Production Logging
LOG_CHANNEL=stack
LOG_STACK=daily,slack
LOG_LEVEL=error
LOG_SLACK_WEBHOOK_URL=your-webhook-url
```

### 5. Backup Strategy ✅

#### Database Backups
- [ ] Set up automated daily backups
- [ ] Configure backup retention (30 days)
- [ ] Test backup restoration
- [ ] Store backups in remote location (S3/Backblaze)

```bash
# Daily Database Backup Cron Job
0 2 * * * /usr/bin/mysqldump -u user -p'password' database_name | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

#### File Backups
- [ ] Set up file storage backups
- [ ] Back up uploaded files
- [ ] Back up configuration files
- [ ] Test file restoration

### 6. Security Hardening ✅

#### Server Security
- [ ] Change default SSH port
- [ ] Disable root login
- [ ] Set up SSH key authentication
- [ ] Install fail2ban
- [ ] Configure ModSecurity (WAF)
- [ ] Enable automatic security updates
- [ ] Scan for vulnerabilities regularly
- [ ] Set up intrusion detection (OSSEC)

#### Application Security
- [ ] Run security audit: `composer audit`
- [ ] Run security audit: `npm audit --production`
- [ ] Enable CORS properly
- [ ] Set up rate limiting
- [ ] Implement API throttling
- [ ] Configure secure headers
- [ ] Enable CSRF protection
- [ ] Sanitize all inputs
- [ ] Validate all outputs

### 7. Testing in Production-Like Environment ✅

#### Functional Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test all CRUD operations
- [ ] Test reporting functionality
- [ ] Test PDF generation
- [ ] Test offline functionality
- [ ] Test sync mechanisms
- [ ] Test multi-device scenarios

#### Performance Testing
- [ ] Load test API endpoints
- [ ] Test database query performance
- [ ] Test with concurrent users
- [ ] Monitor response times
- [ ] Check memory usage
- [ ] Verify cache performance

#### Security Testing
- [ ] Penetration testing
- [ ] SQL injection testing
- [ ] XSS testing
- [ ] CSRF testing
- [ ] Authentication testing
- [ ] Authorization testing

### 8. Documentation ✅

- [ ] Update API documentation
- [ ] Create deployment documentation
- [ ] Document environment variables
- [ ] Create troubleshooting guide
- [ ] Document backup/restore procedures
- [ ] Create runbook for common issues
- [ ] Document monitoring alerts
- [ ] Create disaster recovery plan

### 9. Launch Day Checklist ✅

#### Final Checks
- [ ] All tests passing
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] SSL certificate active
- [ ] Monitoring active
- [ ] Backups configured
- [ ] DNS configured correctly
- [ ] CDN configured (if applicable)
- [ ] Email notifications working
- [ ] API documentation published

#### Go-Live Steps
1. [ ] Take final backup
2. [ ] Enable maintenance mode: `php artisan down`
3. [ ] Pull latest code: `git pull origin main`
4. [ ] Install dependencies: `composer install --no-dev --optimize-autoloader`
5. [ ] Run migrations: `php artisan migrate --force`
6. [ ] Clear and cache config: `php artisan config:cache`
7. [ ] Clear and cache routes: `php artisan route:cache`
8. [ ] Clear and cache views: `php artisan view:cache`
9. [ ] Restart queue workers: `php artisan queue:restart`
10. [ ] Disable maintenance mode: `php artisan up`
11. [ ] Verify application is running
12. [ ] Test critical functionality
13. [ ] Monitor logs for errors

#### Post-Launch Monitoring
- [ ] Monitor application logs
- [ ] Monitor error rates
- [ ] Monitor API response times
- [ ] Monitor database performance
- [ ] Monitor server resources (CPU, RAM, Disk)
- [ ] Check user feedback
- [ ] Monitor for security issues

### 10. Post-Deployment ✅

#### Immediate (First 24 Hours)
- [ ] Monitor all logs closely
- [ ] Watch for error spikes
- [ ] Check API performance
- [ ] Verify backups completed
- [ ] Monitor user activity
- [ ] Address urgent issues

#### Short-term (First Week)
- [ ] Analyze usage patterns
- [ ] Optimize based on metrics
- [ ] Address reported issues
- [ ] Update documentation
- [ ] Plan future enhancements
- [ ] Collect user feedback

#### Long-term (Ongoing)
- [ ] Regular security updates
- [ ] Performance optimization
- [ ] Feature enhancements
- [ ] Documentation updates
- [ ] Regular backups verification
- [ ] Disaster recovery drills

---

## Rollback Plan

In case of critical issues during deployment:

### Quick Rollback Steps
1. Enable maintenance mode: `php artisan down`
2. Restore previous code: `git checkout <previous-commit>`
3. Restore database if needed: `mysql database < backup.sql`
4. Clear all caches: `php artisan cache:clear`
5. Restart services: `sudo systemctl restart php8.3-fpm nginx`
6. Disable maintenance mode: `php artisan up`
7. Verify application is working
8. Investigate issues offline

---

## Emergency Contacts

- **DevOps Lead:** [Contact Info]
- **Backend Lead:** [Contact Info]
- **Frontend Lead:** [Contact Info]
- **Database Admin:** [Contact Info]
- **Security Officer:** [Contact Info]
- **Project Manager:** [Contact Info]

---

## Support Resources

- **Documentation:** https://github.com/kasunvimarshana/ledger
- **API Docs:** https://your-domain.com/api/documentation
- **Issue Tracker:** https://github.com/kasunvimarshana/ledger/issues
- **Monitoring Dashboard:** [URL]
- **Log Dashboard:** [URL]

---

## Success Criteria

The deployment is successful when:

- ✅ Application is accessible via HTTPS
- ✅ All API endpoints respond correctly
- ✅ Users can login and perform operations
- ✅ Database is properly connected
- ✅ Backups are running automatically
- ✅ Monitoring is active and reporting
- ✅ No critical errors in logs
- ✅ Performance metrics are within acceptable range
- ✅ Mobile app connects to API successfully
- ✅ Offline functionality works as expected

---

## Verification Commands

```bash
# Check PHP version
php -v

# Check Composer version
composer -V

# Check Laravel application status
cd /var/www/ledger/backend
php artisan about

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();

# Run tests
php artisan test

# Check queue workers
php artisan queue:monitor

# Check cache
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Check logs
tail -f storage/logs/laravel.log

# Check disk space
df -h

# Check memory usage
free -m

# Check running processes
ps aux | grep php
ps aux | grep nginx
```

---

**Last Updated:** January 7, 2026  
**Version:** 1.0.0  
**Status:** Ready for Production Deployment
