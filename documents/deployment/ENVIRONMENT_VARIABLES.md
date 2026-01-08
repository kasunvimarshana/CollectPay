# Environment Variables Documentation

## Data Collection and Payment Management System

Complete reference for all environment variables used in the backend and frontend applications.

---

## Table of Contents

1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Environment-Specific Configuration](#environment-specific-configuration)
4. [Security Best Practices](#security-best-practices)

---

## Backend Environment Variables

### Application Settings

#### APP_NAME
- **Type**: String
- **Default**: `Laravel`
- **Description**: The name of your application
- **Example**: `APP_NAME="Data Collection System"`
- **Required**: Yes

#### APP_ENV
- **Type**: String
- **Values**: `local`, `development`, `staging`, `production`
- **Default**: `production`
- **Description**: Application environment
- **Example**: `APP_ENV=production`
- **Required**: Yes

#### APP_KEY
- **Type**: String (Base64)
- **Default**: None
- **Description**: Application encryption key
- **Generation**: `php artisan key:generate`
- **Example**: `APP_KEY=base64:xxxxx...`
- **Required**: Yes
- **Security**: ⚠️ **NEVER** share or commit this value

#### APP_DEBUG
- **Type**: Boolean
- **Values**: `true`, `false`
- **Default**: `false`
- **Description**: Enable/disable debug mode
- **Example**: `APP_DEBUG=false`
- **Required**: Yes
- **Production**: ⚠️ **MUST** be `false` in production

#### APP_TIMEZONE
- **Type**: String
- **Default**: `UTC`
- **Description**: Application timezone
- **Example**: `APP_TIMEZONE=Asia/Colombo`
- **Required**: No

#### APP_URL
- **Type**: URL
- **Default**: `http://localhost`
- **Description**: Base URL of your application
- **Example**: `APP_URL=https://api.your-domain.com`
- **Required**: Yes

#### APP_LOCALE
- **Type**: String
- **Default**: `en`
- **Description**: Default application locale
- **Example**: `APP_LOCALE=en`
- **Required**: No

#### APP_FALLBACK_LOCALE
- **Type**: String
- **Default**: `en`
- **Description**: Fallback locale when current is not available
- **Example**: `APP_FALLBACK_LOCALE=en`
- **Required**: No

---

### Database Configuration

#### DB_CONNECTION
- **Type**: String
- **Values**: `mysql`, `pgsql`, `sqlite`, `sqlsrv`
- **Default**: `mysql`
- **Description**: Database driver
- **Example**: `DB_CONNECTION=mysql`
- **Required**: Yes

#### DB_HOST
- **Type**: String/IP
- **Default**: `127.0.0.1`
- **Description**: Database server host
- **Example**: `DB_HOST=localhost`
- **Required**: Yes (except for SQLite)

#### DB_PORT
- **Type**: Integer
- **Default**: `3306` (MySQL), `5432` (PostgreSQL)
- **Description**: Database server port
- **Example**: `DB_PORT=3306`
- **Required**: Yes (except for SQLite)

#### DB_DATABASE
- **Type**: String
- **Default**: `laravel`
- **Description**: Database name
- **Example**: `DB_DATABASE=ledger`
- **Required**: Yes

#### DB_USERNAME
- **Type**: String
- **Default**: `root`
- **Description**: Database username
- **Example**: `DB_USERNAME=ledger_user`
- **Required**: Yes (except for SQLite)
- **Security**: ⚠️ Use strong, unique usernames

#### DB_PASSWORD
- **Type**: String
- **Default**: Empty
- **Description**: Database password
- **Example**: `DB_PASSWORD=your_secure_password`
- **Required**: Yes (except for SQLite)
- **Security**: ⚠️ Use strong passwords (20+ characters)

---

### JWT Authentication

#### JWT_SECRET
- **Type**: String
- **Default**: None
- **Description**: Secret key for JWT token generation
- **Generation**: `php artisan jwt:secret`
- **Example**: `JWT_SECRET=your_jwt_secret_key`
- **Required**: Yes
- **Security**: ⚠️ **NEVER** share or commit this value

#### JWT_TTL
- **Type**: Integer (minutes)
- **Default**: `60`
- **Description**: JWT token time-to-live in minutes
- **Example**: `JWT_TTL=3600`
- **Required**: No
- **Recommended**: `3600` (1 hour) for production

#### JWT_REFRESH_TTL
- **Type**: Integer (minutes)
- **Default**: `20160`
- **Description**: JWT refresh token time-to-live
- **Example**: `JWT_REFRESH_TTL=43200`
- **Required**: No

---

### Cache Configuration

#### CACHE_DRIVER
- **Type**: String
- **Values**: `file`, `redis`, `memcached`, `database`, `array`
- **Default**: `file`
- **Description**: Cache storage driver
- **Example**: `CACHE_DRIVER=redis`
- **Required**: No
- **Production**: Recommended `redis` or `memcached`

#### CACHE_PREFIX
- **Type**: String
- **Default**: `laravel_cache`
- **Description**: Cache key prefix
- **Example**: `CACHE_PREFIX=ledger_cache`
- **Required**: No

---

### Session Configuration

#### SESSION_DRIVER
- **Type**: String
- **Values**: `file`, `cookie`, `database`, `redis`, `array`
- **Default**: `file`
- **Description**: Session storage driver
- **Example**: `SESSION_DRIVER=redis`
- **Required**: No
- **Production**: Recommended `redis` or `database`

#### SESSION_LIFETIME
- **Type**: Integer (minutes)
- **Default**: `120`
- **Description**: Session lifetime in minutes
- **Example**: `SESSION_LIFETIME=120`
- **Required**: No

---

### Queue Configuration

#### QUEUE_CONNECTION
- **Type**: String
- **Values**: `sync`, `database`, `redis`, `sqs`, `beanstalkd`
- **Default**: `sync`
- **Description**: Queue driver for jobs
- **Example**: `QUEUE_CONNECTION=redis`
- **Required**: No
- **Production**: Recommended `redis` or `database`

---

### Redis Configuration

#### REDIS_HOST
- **Type**: String/IP
- **Default**: `127.0.0.1`
- **Description**: Redis server host
- **Example**: `REDIS_HOST=localhost`
- **Required**: If using Redis

#### REDIS_PASSWORD
- **Type**: String
- **Default**: `null`
- **Description**: Redis server password
- **Example**: `REDIS_PASSWORD=your_redis_password`
- **Required**: If Redis requires authentication

#### REDIS_PORT
- **Type**: Integer
- **Default**: `6379`
- **Description**: Redis server port
- **Example**: `REDIS_PORT=6379`
- **Required**: If using Redis

#### REDIS_CLIENT
- **Type**: String
- **Values**: `phpredis`, `predis`
- **Default**: `phpredis`
- **Description**: Redis client library
- **Example**: `REDIS_CLIENT=phpredis`
- **Required**: No

---

### Mail Configuration

#### MAIL_MAILER
- **Type**: String
- **Values**: `smtp`, `sendmail`, `mailgun`, `ses`, `postmark`, `log`
- **Default**: `smtp`
- **Description**: Mail driver
- **Example**: `MAIL_MAILER=smtp`
- **Required**: No

#### MAIL_HOST
- **Type**: String
- **Default**: `mailhog`
- **Description**: Mail server host
- **Example**: `MAIL_HOST=smtp.gmail.com`
- **Required**: If using mail

#### MAIL_PORT
- **Type**: Integer
- **Default**: `1025`
- **Description**: Mail server port
- **Example**: `MAIL_PORT=587`
- **Required**: If using mail

#### MAIL_USERNAME
- **Type**: String
- **Default**: `null`
- **Description**: Mail server username
- **Example**: `MAIL_USERNAME=your_email@gmail.com`
- **Required**: If mail server requires authentication

#### MAIL_PASSWORD
- **Type**: String
- **Default**: `null`
- **Description**: Mail server password
- **Example**: `MAIL_PASSWORD=your_app_password`
- **Required**: If mail server requires authentication
- **Security**: ⚠️ Use app-specific passwords

#### MAIL_ENCRYPTION
- **Type**: String
- **Values**: `tls`, `ssl`, `null`
- **Default**: `null`
- **Description**: Mail encryption protocol
- **Example**: `MAIL_ENCRYPTION=tls`
- **Required**: No

#### MAIL_FROM_ADDRESS
- **Type**: Email
- **Default**: `hello@example.com`
- **Description**: Default sender email
- **Example**: `MAIL_FROM_ADDRESS=noreply@your-domain.com`
- **Required**: No

#### MAIL_FROM_NAME
- **Type**: String
- **Default**: `"${APP_NAME}"`
- **Description**: Default sender name
- **Example**: `MAIL_FROM_NAME="Ledger System"`
- **Required**: No

---

### Logging Configuration

#### LOG_CHANNEL
- **Type**: String
- **Values**: `stack`, `single`, `daily`, `slack`, `syslog`, `stderr`
- **Default**: `stack`
- **Description**: Logging channel
- **Example**: `LOG_CHANNEL=daily`
- **Required**: No

#### LOG_DEPRECATIONS_CHANNEL
- **Type**: String
- **Default**: `null`
- **Description**: Channel for deprecation warnings
- **Example**: `LOG_DEPRECATIONS_CHANNEL=null`
- **Required**: No

#### LOG_LEVEL
- **Type**: String
- **Values**: `debug`, `info`, `notice`, `warning`, `error`, `critical`, `alert`, `emergency`
- **Default**: `debug`
- **Description**: Minimum log level
- **Example**: `LOG_LEVEL=error`
- **Required**: No
- **Production**: Recommended `error` or `warning`

---

### Broadcasting Configuration

#### BROADCAST_DRIVER
- **Type**: String
- **Values**: `log`, `redis`, `pusher`, `null`
- **Default**: `log`
- **Description**: Broadcasting driver for real-time features
- **Example**: `BROADCAST_DRIVER=redis`
- **Required**: No

---

### Filesystem Configuration

#### FILESYSTEM_DISK
- **Type**: String
- **Values**: `local`, `public`, `s3`, `ftp`, `sftp`
- **Default**: `local`
- **Description**: Default filesystem disk
- **Example**: `FILESYSTEM_DISK=local`
- **Required**: No

---

### AWS Configuration (Optional)

#### AWS_ACCESS_KEY_ID
- **Type**: String
- **Description**: AWS access key
- **Example**: `AWS_ACCESS_KEY_ID=your_access_key`
- **Required**: If using AWS services
- **Security**: ⚠️ Keep confidential

#### AWS_SECRET_ACCESS_KEY
- **Type**: String
- **Description**: AWS secret key
- **Example**: `AWS_SECRET_ACCESS_KEY=your_secret_key`
- **Required**: If using AWS services
- **Security**: ⚠️ Keep confidential

#### AWS_DEFAULT_REGION
- **Type**: String
- **Default**: `us-east-1`
- **Description**: AWS region
- **Example**: `AWS_DEFAULT_REGION=us-east-1`
- **Required**: If using AWS services

#### AWS_BUCKET
- **Type**: String
- **Description**: S3 bucket name
- **Example**: `AWS_BUCKET=your-bucket-name`
- **Required**: If using S3

---

## Frontend Environment Variables

### API Configuration

#### EXPO_PUBLIC_API_URL
- **Type**: URL
- **Default**: None
- **Description**: Backend API base URL
- **Development**: `EXPO_PUBLIC_API_URL=http://localhost:8000/api`
- **Production**: `EXPO_PUBLIC_API_URL=https://api.your-domain.com/api`
- **Required**: Yes
- **Note**: Must include `/api` at the end

---

### App Configuration

#### EXPO_PUBLIC_APP_NAME
- **Type**: String
- **Default**: `Ledger`
- **Description**: Application display name
- **Example**: `EXPO_PUBLIC_APP_NAME=Ledger`
- **Required**: No

#### EXPO_PUBLIC_APP_VERSION
- **Type**: String (Semantic Version)
- **Default**: `1.0.0`
- **Description**: Application version
- **Example**: `EXPO_PUBLIC_APP_VERSION=1.0.0`
- **Required**: No

---

### Environment

#### EXPO_PUBLIC_ENV
- **Type**: String
- **Values**: `development`, `staging`, `production`
- **Default**: `development`
- **Description**: Application environment
- **Example**: `EXPO_PUBLIC_ENV=production`
- **Required**: No

---

## Environment-Specific Configuration

### Development Environment

```env
# Backend (.env)
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

LOG_LEVEL=debug
```

```env
# Frontend (.env)
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_ENV=development
```

---

### Staging Environment

```env
# Backend (.env)
APP_ENV=staging
APP_DEBUG=false
APP_URL=https://staging-api.your-domain.com

DB_CONNECTION=mysql
DB_HOST=staging-db.example.com
DB_PORT=3306
DB_DATABASE=ledger_staging
DB_USERNAME=ledger_staging
DB_PASSWORD=staging_secure_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

LOG_LEVEL=warning
```

```env
# Frontend (.env)
EXPO_PUBLIC_API_URL=https://staging-api.your-domain.com/api
EXPO_PUBLIC_ENV=staging
```

---

### Production Environment

```env
# Backend (.env)
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.your-domain.com

DB_CONNECTION=mysql
DB_HOST=production-db.example.com
DB_PORT=3306
DB_DATABASE=ledger
DB_USERNAME=ledger_prod
DB_PASSWORD=strong_production_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

LOG_LEVEL=error

# Additional production settings
REDIS_CLIENT=phpredis
REDIS_HOST=redis.example.com
REDIS_PASSWORD=redis_password
```

```env
# Frontend (.env)
EXPO_PUBLIC_API_URL=https://api.your-domain.com/api
EXPO_PUBLIC_ENV=production
```

---

## Security Best Practices

### 1. Never Commit Secrets

```gitignore
# .gitignore
.env
.env.backup
.env.production
.env.local
.env.*.local
```

### 2. Use Strong Passwords

- Minimum 20 characters
- Include uppercase, lowercase, numbers, symbols
- Use password generators
- Don't reuse passwords

### 3. Rotate Keys Regularly

- Change JWT_SECRET every 6 months
- Rotate database passwords quarterly
- Update API keys as needed

### 4. Limit Access

- Use least privilege principle
- Create separate DB users for different environments
- Restrict IP access to databases

### 5. Use Environment-Specific Files

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

### 6. Encrypt Sensitive Variables

Consider using:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Cloud Secret Manager

### 7. Audit Environment Variables

Regularly review:
- Which variables are in use
- Which credentials have access
- When passwords were last changed

---

## Troubleshooting

### Common Issues

**Issue: APP_KEY not set**
```bash
# Fix
php artisan key:generate
```

**Issue: JWT_SECRET not set**
```bash
# Fix
php artisan jwt:secret --force
```

**Issue: Database connection failed**
- Verify DB_HOST, DB_PORT, DB_DATABASE
- Test with: `php artisan tinker >>> DB::connection()->getPdo();`

**Issue: Redis connection failed**
- Verify REDIS_HOST, REDIS_PORT
- Check if Redis is running
- Test with: `redis-cli ping`

**Issue: Frontend can't reach API**
- Verify EXPO_PUBLIC_API_URL
- Check network connectivity
- Ensure CORS is configured on backend

---

## Environment Variable Checklist

### Backend Setup
- [ ] APP_KEY generated
- [ ] JWT_SECRET generated
- [ ] Database credentials configured
- [ ] Database created
- [ ] APP_DEBUG set to false (production)
- [ ] APP_ENV set correctly
- [ ] APP_URL points to correct domain
- [ ] Cache driver configured
- [ ] Queue driver configured
- [ ] Redis configured (if using)
- [ ] Mail settings configured (if using)
- [ ] Log level appropriate for environment

### Frontend Setup
- [ ] EXPO_PUBLIC_API_URL set correctly
- [ ] EXPO_PUBLIC_ENV set correctly
- [ ] API URL includes `/api` suffix
- [ ] Can reach backend from mobile device

---

**Documentation Version**: 1.0.0  
**Last Updated**: December 29, 2025  
**For Support**: support@your-domain.com
