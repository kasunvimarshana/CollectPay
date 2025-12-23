# Getting Started with SyncCollect

This guide will help you set up and run the SyncCollect application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** 8.3 or higher
- **Composer** 2.9 or higher
- **Node.js** 20 or higher
- **npm** 10 or higher
- **Git**

### Verify Installation

```bash
php --version
composer --version
node --version
npm --version
git --version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kasunvimarshana/SyncCollect.git
cd SyncCollect
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Seed demo data (optional but recommended)
php artisan db:seed --class=DemoDataSeeder

# Start the development server
php artisan serve
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Create environment file
echo "EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env

# Start the Expo development server
npm start
```

Follow the on-screen instructions to run the app on:
- Android emulator/device: Press `a`
- iOS simulator (macOS only): Press `i`
- Web browser: Press `w`

## Demo Credentials

Use these credentials to log in:

**Admin User:**
- Email: `admin@synccollect.com`
- Password: `password123`

**Regular User:**
- Email: `user@synccollect.com`
- Password: `password123`

## Testing the API

### Using cURL

#### 1. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "admin@synccollect.com",
    "password": "password123"
  }'
```

Response will include a token:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "1|abc123..."
  },
  "message": "Login successful"
}
```

#### 2. List Suppliers

```bash
curl -X GET http://localhost:8000/api/v1/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

#### 3. Create a Supplier

```bash
curl -X POST http://localhost:8000/api/v1/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "New Supplier",
    "contact_person": "John Smith",
    "phone": "+1234567890",
    "email": "supplier@example.com",
    "address": "123 Main St, City",
    "status": "active"
  }'
```

### Using Postman

1. Import the API endpoints from `/docs/API.md`
2. Set up an environment variable for the base URL: `http://localhost:8000/api/v1`
3. Add an environment variable for the token after login
4. Use `{{token}}` in the Authorization header

## Project Structure

```
SyncCollect/
├── backend/                  # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # API controllers
│   │   │   └── Requests/     # Validation requests
│   │   └── Models/           # Eloquent models
│   ├── database/
│   │   ├── migrations/       # Database migrations
│   │   └── seeders/          # Database seeders
│   ├── routes/
│   │   └── api.php          # API routes
│   └── tests/               # Backend tests
├── frontend/                # React Native/Expo frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── screens/         # App screens
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript types
│   │   └── navigation/      # Navigation setup
│   └── assets/              # Images and static files
└── docs/                    # Documentation
    ├── ARCHITECTURE.md      # System architecture
    ├── API.md              # API documentation
    ├── IMPLEMENTATION_SUMMARY.md
    └── FINAL_REPORT.md
```

## Common Tasks

### Reset Database

```bash
cd backend
php artisan migrate:fresh
php artisan db:seed --class=DemoDataSeeder
```

### Run Tests

```bash
cd backend
php artisan test
```

### Clear Cache

```bash
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### View API Routes

```bash
cd backend
php artisan route:list --path=api
```

### Code Formatting

Backend (Laravel Pint):
```bash
cd backend
./vendor/bin/pint
```

## Troubleshooting

### Backend Issues

#### Port 8000 Already in Use

```bash
# Use a different port
php artisan serve --port=8001

# Update frontend .env
echo "EXPO_PUBLIC_API_URL=http://localhost:8001/api/v1" > frontend/.env
```

#### Database Errors

```bash
# Check if migrations have run
cd backend
php artisan migrate:status

# Reset database
php artisan migrate:fresh
```

#### Permission Errors

```bash
cd backend
chmod -R 775 storage bootstrap/cache
```

### Frontend Issues

#### Metro Bundler Issues

```bash
cd frontend
# Clear cache
npm start -- --clear

# Or reset cache completely
watchman watch-del-all
rm -rf node_modules
npm install
```

#### Cannot Connect to Backend

1. Ensure backend server is running: `php artisan serve`
2. Check the API URL in `frontend/.env`
3. If using Android emulator, use `http://10.0.2.2:8000/api/v1` instead of `localhost`
4. If using physical device, use your computer's IP address

#### Package Installation Errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### 1. Start Backend Server

```bash
cd backend
php artisan serve
```

### 2. Start Frontend Development Server

```bash
cd frontend
npm start
```

### 3. Make Changes

- Backend: Edit files in `backend/app/`
- Frontend: Edit files in `frontend/src/`
- API Routes: Edit `backend/routes/api.php`
- Database: Create migrations in `backend/database/migrations/`

### 4. Test Changes

- Backend API: Use cURL or Postman
- Frontend: Use Expo Go app or simulator

## Next Steps

1. **Explore the API**: Check `/docs/API.md` for all available endpoints
2. **Read Architecture**: Review `/docs/ARCHITECTURE.md` to understand the system
3. **Check Implementation**: See `/docs/IMPLEMENTATION_SUMMARY.md` for feature status
4. **Build Features**: Start implementing remaining features

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation in `/docs/`
3. Create an issue on GitHub

## License

This project is open-source and available under the MIT License.
