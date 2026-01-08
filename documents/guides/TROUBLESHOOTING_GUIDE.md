# Troubleshooting Guide

**Project:** Data Collection and Payment Management System  
**Version:** 1.0.0  
**Last Updated:** January 7, 2026

---

## Table of Contents
1. [Backend Issues](#backend-issues)
2. [Frontend Issues](#frontend-issues)
3. [Database Issues](#database-issues)
4. [Authentication Issues](#authentication-issues)
5. [Sync & Offline Issues](#sync--offline-issues)
6. [Performance Issues](#performance-issues)
7. [Deployment Issues](#deployment-issues)
8. [Common Error Messages](#common-error-messages)

---

## Backend Issues

### Issue: 500 Internal Server Error

**Symptoms:**
- API returns 500 status code
- Generic error message

**Solutions:**
1. Check Laravel logs:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. Enable debug mode temporarily (development only):
   ```env
   APP_DEBUG=true
   ```

3. Check web server error logs:
   ```bash
   # Nginx
   tail -f /var/log/nginx/error.log
   
   # Apache
   tail -f /var/log/apache2/error.log
   ```

4. Common causes:
   - Missing environment variables
   - Database connection issues
   - Permission issues on storage/cache directories
   - Missing dependencies

### Issue: Database Connection Failed

**Symptoms:**
- "SQLSTATE[HY000]" errors
- Cannot connect to database

**Solutions:**
1. Verify database credentials in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

2. Test database connection:
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo();
   ```

3. Check if database server is running:
   ```bash
   # MySQL
   sudo systemctl status mysql
   
   # PostgreSQL
   sudo systemctl status postgresql
   ```

4. Verify database exists:
   ```sql
   SHOW DATABASES;
   ```

### Issue: JWT Token Invalid

**Symptoms:**
- "Token invalid" errors
- Authentication fails after login

**Solutions:**
1. Regenerate JWT secret:
   ```bash
   php artisan jwt:secret
   ```

2. Clear config cache:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

3. Verify JWT configuration in `config/jwt.php`

4. Check token expiration time:
   ```env
   JWT_TTL=60  # 60 minutes
   ```

### Issue: Permission Denied on Storage

**Symptoms:**
- Cannot write to logs
- Cannot cache files
- 500 error on file operations

**Solutions:**
1. Fix storage permissions:
   ```bash
   sudo chown -R www-data:www-data storage bootstrap/cache
   sudo chmod -R 775 storage bootstrap/cache
   ```

2. For development:
   ```bash
   chmod -R 777 storage bootstrap/cache
   ```

### Issue: Route Not Found (404)

**Symptoms:**
- API routes return 404
- Routes worked in development

**Solutions:**
1. Clear route cache:
   ```bash
   php artisan route:clear
   php artisan route:cache
   ```

2. Check web server configuration:
   ```nginx
   # Nginx - make sure this exists
   location / {
       try_files $uri $uri/ /index.php?$query_string;
   }
   ```

3. Verify API routes:
   ```bash
   php artisan route:list
   ```

---

## Frontend Issues

### Issue: Cannot Connect to API

**Symptoms:**
- Network request failed
- API connection errors
- Timeout errors

**Solutions:**
1. Verify API URL in `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://your-domain.com/api
   ```

2. Check if backend is running:
   ```bash
   curl http://your-domain.com/api/health
   ```

3. For development with device, use computer's IP:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
   ```

4. Check CORS configuration on backend

5. Verify network connectivity on device

### Issue: TypeScript Compilation Errors

**Symptoms:**
- Red squiggly lines in editor
- Build fails with type errors

**Solutions:**
1. Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

2. Clean node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Update TypeScript definitions:
   ```bash
   npm install --save-dev @types/react @types/react-native
   ```

### Issue: App Crashes on Launch

**Symptoms:**
- App opens and immediately closes
- White screen of death
- Red error screen

**Solutions:**
1. Check error logs:
   ```bash
   # Android
   adb logcat | grep ReactNativeJS
   
   # iOS
   # Check Xcode console
   ```

2. Clear Metro bundler cache:
   ```bash
   npm start -- --clear
   ```

3. Rebuild app:
   ```bash
   # Android
   cd android && ./gradlew clean && cd ..
   npm run android
   
   # iOS
   cd ios && pod install && cd ..
   npm run ios
   ```

4. Check for missing dependencies:
   ```bash
   npm install
   ```

### Issue: Images Not Loading

**Symptoms:**
- Broken image icons
- Images fail to render

**Solutions:**
1. Verify image path is correct
2. Use `require()` for local images:
   ```typescript
   <Image source={require('../assets/logo.png')} />
   ```

3. For remote images, verify URL is accessible
4. Clear cache and restart:
   ```bash
   npm start -- --clear
   ```

---

## Database Issues

### Issue: Migration Failed

**Symptoms:**
- "Migration not found" errors
- "Table already exists" errors

**Solutions:**
1. Reset migrations (development only):
   ```bash
   php artisan migrate:fresh --seed
   ```

2. Check migration status:
   ```bash
   php artisan migrate:status
   ```

3. Rollback specific migration:
   ```bash
   php artisan migrate:rollback --step=1
   ```

4. For production, create new migration to fix issues

### Issue: Slow Queries

**Symptoms:**
- API responses are slow
- Database queries take too long

**Solutions:**
1. Enable query logging:
   ```php
   DB::enableQueryLog();
   // Your query
   dd(DB::getQueryLog());
   ```

2. Add database indexes:
   ```php
   Schema::table('collections', function (Blueprint $table) {
       $table->index(['supplier_id', 'product_id']);
   });
   ```

3. Use eager loading to prevent N+1:
   ```php
   $collections = Collection::with(['supplier', 'product'])->get();
   ```

4. Analyze query performance:
   ```sql
   EXPLAIN SELECT * FROM collections WHERE supplier_id = 1;
   ```

### Issue: Database Connection Pool Exhausted

**Symptoms:**
- "Too many connections" error
- Cannot create new connections

**Solutions:**
1. Increase max connections in database:
   ```sql
   -- MySQL
   SET GLOBAL max_connections = 200;
   ```

2. Configure connection pooling:
   ```env
   DB_POOL_MIN=2
   DB_POOL_MAX=20
   ```

3. Check for connection leaks
4. Use queue workers for long-running tasks

---

## Authentication Issues

### Issue: Token Expired

**Symptoms:**
- 401 Unauthorized after some time
- "Token has expired" message

**Solutions:**
1. Implement token refresh:
   ```typescript
   const refreshToken = async () => {
       const response = await apiClient.post('/refresh');
       // Store new token
   };
   ```

2. Increase token TTL (development only):
   ```env
   JWT_TTL=1440  # 24 hours
   ```

3. Handle 401 globally and redirect to login

### Issue: Cannot Login

**Symptoms:**
- Valid credentials rejected
- "Invalid credentials" error

**Solutions:**
1. Verify user exists in database:
   ```sql
   SELECT * FROM users WHERE email = 'user@example.com';
   ```

2. Check password hashing:
   ```php
   Hash::check('password', $user->password);
   ```

3. Clear auth cache:
   ```bash
   php artisan cache:clear
   ```

4. Check JWT configuration
5. Verify email is correct (case-sensitive)

### Issue: Session Expired Constantly

**Symptoms:**
- Logged out frequently
- Session doesn't persist

**Solutions:**
1. Check session configuration:
   ```env
   SESSION_DRIVER=database
   SESSION_LIFETIME=120
   ```

2. Verify session table exists:
   ```bash
   php artisan session:table
   php artisan migrate
   ```

3. For mobile app, use AsyncStorage instead of sessions

---

## Sync & Offline Issues

### Issue: Data Not Syncing

**Symptoms:**
- Changes not reflected on server
- Sync queue not processing

**Solutions:**
1. Check sync queue:
   ```typescript
   const queue = await LocalStorageService.getSyncQueue();
   console.log('Queue items:', queue);
   ```

2. Manually trigger sync:
   ```typescript
   await syncService.processSyncQueue();
   ```

3. Check network connectivity:
   ```typescript
   import NetInfo from '@react-native-community/netinfo';
   const state = await NetInfo.fetch();
   console.log('Network:', state.isConnected);
   ```

4. Verify API endpoints are accessible
5. Check for version conflicts

### Issue: Version Conflict

**Symptoms:**
- HTTP 409 Conflict error
- "Version mismatch" message

**Solutions:**
1. Fetch latest data:
   ```typescript
   const latest = await apiClient.get(`/suppliers/${id}`);
   ```

2. Notify user and let them choose:
   - Keep local changes
   - Use server data
   - Merge manually

3. Implement conflict resolution strategy
4. Check version tracking is working

### Issue: Offline Data Not Loading

**Symptoms:**
- Blank screens when offline
- "No data" messages

**Solutions:**
1. Verify data is cached:
   ```typescript
   const cached = await LocalStorageService.getSuppliers();
   console.log('Cached suppliers:', cached);
   ```

2. Check cache expiration
3. Ensure data is being cached on fetch:
   ```typescript
   await LocalStorageService.cacheSuppliers(data);
   ```

4. Clear and refresh cache:
   ```typescript
   await LocalStorageService.clearCache();
   ```

---

## Performance Issues

### Issue: Slow API Responses

**Symptoms:**
- API takes long to respond
- Timeouts occurring

**Solutions:**
1. Enable query logging and optimize:
   ```php
   DB::enableQueryLog();
   ```

2. Add pagination to large result sets
3. Implement caching:
   ```php
   Cache::remember('suppliers', 3600, function () {
       return Supplier::all();
   });
   ```

4. Use database indexes
5. Enable OPcache for PHP
6. Use Redis for caching

### Issue: High Memory Usage

**Symptoms:**
- Out of memory errors
- Slow performance

**Solutions:**
1. Use chunking for large datasets:
   ```php
   Collection::chunk(200, function ($collections) {
       // Process chunk
   });
   ```

2. Unset large variables after use
3. Increase PHP memory limit (temporary):
   ```env
   memory_limit=256M
   ```

4. Use generators for large datasets
5. Optimize database queries

### Issue: App Lag/Freezing

**Symptoms:**
- UI freezes during operations
- Slow scrolling

**Solutions:**
1. Move heavy operations to background:
   ```typescript
   useEffect(() => {
       const fetchData = async () => {
           // Async operation
       };
       fetchData();
   }, []);
   ```

2. Implement pagination/infinite scroll
3. Optimize images (compress, resize)
4. Use React.memo for expensive components
5. Avoid unnecessary re-renders

---

## Deployment Issues

### Issue: 502 Bad Gateway

**Symptoms:**
- Nginx returns 502 error
- API is unreachable

**Solutions:**
1. Check PHP-FPM is running:
   ```bash
   sudo systemctl status php8.3-fpm
   sudo systemctl restart php8.3-fpm
   ```

2. Verify PHP-FPM socket:
   ```bash
   ls -la /var/run/php/php8.3-fpm.sock
   ```

3. Check Nginx error logs:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

4. Increase PHP-FPM resources:
   ```ini
   pm.max_children = 50
   pm.start_servers = 10
   pm.min_spare_servers = 5
   pm.max_spare_servers = 35
   ```

### Issue: Assets Not Loading

**Symptoms:**
- CSS/JS files 404
- Mixed content warnings

**Solutions:**
1. Run asset compilation:
   ```bash
   npm run build
   ```

2. Link storage:
   ```bash
   php artisan storage:link
   ```

3. Check asset paths in configuration
4. Verify CDN configuration if using one

### Issue: Queue Workers Not Processing

**Symptoms:**
- Jobs remain in queue
- Emails not sending

**Solutions:**
1. Start queue workers:
   ```bash
   php artisan queue:work
   ```

2. Use supervisor for production:
   ```ini
   [program:laravel-worker]
   process_name=%(program_name)s_%(process_num)02d
   command=php /var/www/ledger/backend/artisan queue:work --sleep=3 --tries=3
   autostart=true
   autorestart=true
   user=www-data
   numprocs=4
   redirect_stderr=true
   stdout_logfile=/var/www/ledger/backend/storage/logs/worker.log
   ```

3. Restart queue workers:
   ```bash
   php artisan queue:restart
   ```

---

## Common Error Messages

### "Class not found"

**Solutions:**
1. Run composer autoload:
   ```bash
   composer dump-autoload
   ```

2. Clear config cache:
   ```bash
   php artisan config:clear
   ```

### "Syntax error, unexpected ..."

**Solutions:**
1. Check PHP version (needs 8.2+):
   ```bash
   php -v
   ```

2. Fix syntax error in code
3. Clear OPcache:
   ```bash
   sudo systemctl restart php8.3-fpm
   ```

### "Cannot resolve module"

**Solutions:**
1. Install dependencies:
   ```bash
   npm install
   ```

2. Clear Metro cache:
   ```bash
   npm start -- --reset-cache
   ```

3. Check import path is correct

### "Network request failed"

**Solutions:**
1. Check API URL configuration
2. Verify backend is running
3. Check CORS settings
4. Verify network connectivity
5. Check firewall rules

---

## Getting Help

If you're still experiencing issues:

1. **Check Documentation:**
   - README.md
   - API_REFERENCE.md
   - User guides in repository

2. **Search Issue Tracker:**
   - https://github.com/kasunvimarshana/ledger/issues

3. **Enable Debug Mode (Development):**
   ```env
   APP_DEBUG=true
   LOG_LEVEL=debug
   ```

4. **Collect Information:**
   - Error messages (exact text)
   - Laravel logs
   - Browser console logs (F12)
   - Steps to reproduce
   - Environment details

5. **Create Issue:**
   - Include all collected information
   - Be specific about the problem
   - Include error messages
   - Describe expected vs actual behavior

---

## Quick Reference Commands

```bash
# Clear all caches
php artisan optimize:clear

# Rebuild all caches
php artisan optimize

# Run all tests
php artisan test

# Check application status
php artisan about

# Restart queue workers
php artisan queue:restart

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();

# View routes
php artisan route:list

# Generate API documentation
php artisan l5-swagger:generate

# Check TypeScript
npx tsc --noEmit

# Clear Metro cache
npm start -- --reset-cache

# Check network status
adb shell dumpsys connectivity
```

---

**Remember:** Always backup your data before making significant changes!

**Last Updated:** January 7, 2026
