# Quick Start Guide

This guide will help you get the Collection Payments Sync system up and running in minutes.

## Prerequisites

Make sure you have installed:
- PHP 8.2+ with Composer
- Node.js 20+ with npm
- Expo CLI: `npm install -g expo-cli`

## Step 1: Clone and Setup Backend

```bash
# Navigate to backend
cd backend

# Install PHP dependencies
composer install

# Setup environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Start the server
php artisan serve
```

The API will be running at `http://localhost:8000`

## Step 2: Setup Mobile App

```bash
# In a new terminal, navigate to mobile
cd mobile

# Install dependencies
npm install

# Update API endpoint
# Edit src/services/ApiService.ts and change API_BASE_URL to:
# const API_BASE_URL = 'http://localhost:8000/api/v1';
# OR for physical device:
# const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000/api/v1';

# Start Expo
npm start
```

## Step 3: Create Test User

You can create a user via the mobile app registration, or use Laravel Tinker:

```bash
cd backend
php artisan tinker

# Create a test user
$user = new App\Models\User();
$user->name = 'Test User';
$user->email = 'test@example.com';
$user->password = Hash::make('password');
$user->save();
```

## Step 4: Test the App

1. **Mobile App**: 
   - Press 'i' for iOS simulator or 'a' for Android emulator
   - Or scan the QR code with Expo Go on your phone

2. **Login**:
   - Email: `test@example.com`
   - Password: `password`

3. **Try Features**:
   - Create a collection
   - Add a payment
   - Try offline mode (turn off wifi)
   - Sync when back online

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

Save the token from the response.

### Create Collection
```bash
curl -X POST http://localhost:8000/api/v1/collections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Monthly Collections",
    "description": "Regular monthly collections"
  }'
```

### List Collections
```bash
curl -X GET http://localhost:8000/api/v1/collections \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Backend Issues

**Error: "No application encryption key"**
```bash
php artisan key:generate
```

**Database errors**
```bash
php artisan migrate:fresh
```

**Port 8000 already in use**
```bash
php artisan serve --port=8001
# Then update mobile API_BASE_URL accordingly
```

### Mobile Issues

**Metro bundler issues**
```bash
npm start -- --clear
```

**Can't connect to API from physical device**
- Make sure your computer and phone are on the same network
- Update API_BASE_URL to use your computer's IP address
- Check firewall settings

**Node modules issues**
```bash
rm -rf node_modules
npm install
```

## What's Next?

- Check out the [Architecture Documentation](ARCHITECTURE.md)
- Read the full [README](README.md)
- Explore the API endpoints
- Customize for your use case

## Common Development Tasks

### Add a new migration
```bash
cd backend
php artisan make:migration create_something_table
php artisan migrate
```

### Run tests
```bash
cd backend
php artisan test
```

### Clear cache
```bash
cd backend
php artisan cache:clear
php artisan config:clear
```

### View logs
```bash
cd backend
tail -f storage/logs/laravel.log
```

## Production Deployment Tips

1. **Backend**:
   - Set `APP_ENV=production` in `.env`
   - Set `APP_DEBUG=false`
   - Run `php artisan config:cache`
   - Use a real database (MySQL/PostgreSQL)
   - Set up queue workers
   - Enable HTTPS

2. **Mobile**:
   - Update API_BASE_URL to production URL
   - Build with `eas build`
   - Test thoroughly before release
   - Set up crash reporting

## Support

For issues or questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub
