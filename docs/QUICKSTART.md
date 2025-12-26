# FieldLedger - Quick Start Guide

## Getting Started in 5 Minutes

This guide will help you get FieldLedger running locally for development or testing.

## Prerequisites Check

Before starting, ensure you have:

### Backend
```bash
php --version    # Should be 8.2 or higher
composer --version
mysql --version  # Or mariadb --version
```

### Frontend
```bash
node --version   # Should be 18.x or higher
npm --version
```

## Backend Setup (3 minutes)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
composer install

# 3. Setup environment
cp .env.example .env
php artisan key:generate

# 4. Configure database (edit .env file)
# Set DB_DATABASE, DB_USERNAME, DB_PASSWORD

# 5. Create database
mysql -u root -p -e "CREATE DATABASE fieldledger CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 6. Run migrations
php artisan migrate

# 7. Start server
php artisan serve
```

Backend should now be running at `http://localhost:8000`

## Frontend Setup (2 minutes)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Configure API URL (edit .env)
# Set EXPO_PUBLIC_API_URL=http://localhost:8000/api
# For physical device, use your computer's IP: http://192.168.1.x:8000/api

# 5. Start Expo
npm start
```

## First Run

### 1. Access the App

- **iOS Simulator**: Press `i` in the Expo terminal
- **Android Emulator**: Press `a` in the Expo terminal
- **Physical Device**: Scan the QR code with Expo Go app

### 2. Create Test Account

**Option A: Via API**
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@fieldledger.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "admin"
  }'
```

**Option B: Via Tinker**
```bash
cd backend
php artisan tinker

# In tinker console:
\App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@fieldledger.com',
    'password' => bcrypt('password123'),
    'role' => 'admin',
    'is_active' => true
]);
```

### 3. Login

- Open the app
- Enter credentials:
  - Email: `admin@fieldledger.com`
  - Password: `password123`
- Click Login

## Verify Installation

### Backend Health Check

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01 12:00:00"
}
```

### Test Authentication

```bash
# Get token
TOKEN=$(curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fieldledger.com", "password": "password123"}' \
  | jq -r '.token')

# Test authenticated endpoint
curl http://localhost:8000/api/me \
  -H "Authorization: Bearer $TOKEN"
```

## Sample Data (Optional)

### Create Test Supplier

```bash
curl -X POST http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUP001",
    "name": "Test Supplier",
    "phone": "1234567890",
    "email": "supplier@test.com",
    "status": "active"
  }'
```

### Create Test Product

```bash
curl -X POST http://localhost:8000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD001",
    "name": "Test Product",
    "base_unit": "kg",
    "status": "active"
  }'
```

### Create Test Rate

```bash
curl -X POST http://localhost:8000/api/rates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "rate": 10.50,
    "unit": "kg",
    "valid_from": "2024-01-01",
    "is_default": true
  }'
```

## Common Issues

### Backend Issues

**Database Connection Error**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u your_user -p -e "SHOW DATABASES;"
```

**Permission Errors**
```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
```

**Port Already in Use**
```bash
# Use different port
php artisan serve --port=8001
```

### Frontend Issues

**Metro Bundler Cache**
```bash
# Clear cache
npm start -- --clear

# Or
npx expo start -c
```

**Network Connection**
```bash
# For physical device, use IP address instead of localhost
# Find your IP:
# Mac/Linux: ifconfig | grep "inet "
# Windows: ipconfig | findstr IPv4
```

**Dependencies Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Backend Development

```bash
# Watch for file changes (automatic restart)
php artisan serve --watch

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Create new migration
php artisan make:migration create_example_table

# Create new model
php artisan make:model Example -m

# Create new controller
php artisan make:controller ExampleController

# Run tests
php artisan test
```

### Frontend Development

```bash
# Start with specific platform
npm run ios
npm run android

# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Run tests
npm test
```

## Next Steps

Now that you have FieldLedger running:

1. **Explore the UI**: Navigate through different screens
2. **Test Offline Mode**: Enable airplane mode and create records
3. **Test Sync**: Re-enable network and watch automatic sync
4. **Read Documentation**: Check `/docs` folder for detailed guides
5. **Customize**: Modify code to fit your needs

## Useful Commands

### Backend

```bash
# Clear all caches
php artisan optimize:clear

# Seed database
php artisan db:seed

# Generate API documentation
php artisan route:list

# Check logs
tail -f storage/logs/laravel.log
```

### Frontend

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Build for production
eas build --platform all

# Publish OTA update
eas update --branch production
```

## Support

- **Documentation**: `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/kasunvimarshana/FieldLedger/issues)
- **Community**: [Discussions](https://github.com/kasunvimarshana/FieldLedger/discussions)

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [FieldLedger Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Offline Sync Guide](./OFFLINE_SYNC.md)

---

**Congratulations!** You now have FieldLedger running locally. Happy coding! 🎉
