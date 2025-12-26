# FieldSyncLedger - Developer Setup Guide

## Prerequisites

### Required Software
- **Docker Desktop** 4.x or higher ([Download](https://www.docker.com/products/docker-desktop))
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **Git** 2.x or higher
- **Code Editor**: VS Code (recommended) or your preferred IDE

### Optional Software
- **PHP** 8.1+ and **Composer** (for local backend development without Docker)
- **MySQL** 8.0+ (for local database development)
- **Expo Go** mobile app (for testing on physical devices)
- **Android Studio** or **Xcode** (for native development)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kasunvimarshana/FieldSyncLedger.git
cd FieldSyncLedger
```

### 2. Backend Setup

#### Option A: Using Docker (Recommended)

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Start Docker containers
docker-compose up -d

# Wait for MySQL to be ready (check logs)
docker-compose logs -f mysql

# Run database migrations
docker-compose exec backend php artisan migrate

# Generate application key
docker-compose exec backend php artisan key:generate

# Create a test user (optional)
docker-compose exec backend php artisan tinker
>>> \App\Models\User::create([
...   'id' => \Illuminate\Support\Str::uuid(),
...   'name' => 'Test User',
...   'email' => 'test@example.com',
...   'password' => bcrypt('password'),
...   'role' => 'admin',
...   'permissions' => []
... ]);
>>> exit
```

Backend API will be available at: `http://localhost:8000`

#### Option B: Local Development

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure database in .env
# DB_DATABASE=fieldsyncledger
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Start development server
php artisan serve
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file for API configuration
echo "EXPO_PUBLIC_API_URL=http://localhost:8000/api" > .env

# Start Expo development server
npm start
```

This will open Expo Dev Tools in your browser at `http://localhost:19002`

### 4. Running on Devices

#### On iOS Simulator (macOS only)
- Press `i` in the terminal where Expo is running
- Or click "Run on iOS Simulator" in Expo Dev Tools

#### On Android Emulator
- Start Android emulator from Android Studio
- Press `a` in the terminal where Expo is running
- Or click "Run on Android device/emulator" in Expo Dev Tools

#### On Physical Device
1. Install **Expo Go** app from App Store (iOS) or Google Play (Android)
2. Scan the QR code shown in terminal or Expo Dev Tools
3. Ensure your device is on the same network as your development machine

## Project Structure

```
FieldSyncLedger/
├── backend/                 # Laravel backend
│   ├── app/
│   │   ├── Domain/         # Core business logic
│   │   ├── Application/    # Application services
│   │   ├── Infrastructure/ # External integrations
│   │   ├── Http/           # Controllers and middleware
│   │   └── Models/         # Eloquent models
│   ├── config/             # Configuration files
│   ├── database/           # Migrations, seeders
│   ├── routes/             # API routes
│   └── tests/              # Backend tests
├── frontend/               # React Native frontend
│   ├── src/
│   │   ├── domain/         # Domain entities and interfaces
│   │   ├── application/    # Use cases and services
│   │   ├── infrastructure/ # API, database, sync
│   │   └── presentation/   # UI components and screens
│   ├── app/                # Expo Router screens
│   └── assets/             # Images, fonts, etc.
├── docs/                   # Documentation
├── docker-compose.yml      # Docker configuration
└── README.md              # Project overview
```

## Development Workflow

### Backend Development

#### Making Database Changes

```bash
# Create a new migration
docker-compose exec backend php artisan make:migration create_example_table

# Edit the migration file in backend/database/migrations/

# Run migrations
docker-compose exec backend php artisan migrate

# Rollback last migration
docker-compose exec backend php artisan migrate:rollback

# Refresh database (WARNING: destroys data)
docker-compose exec backend php artisan migrate:fresh
```

#### Creating New Controllers

```bash
# Create controller
docker-compose exec backend php artisan make:controller ExampleController

# Create API resource controller
docker-compose exec backend php artisan make:controller Api/ExampleController --api
```

#### Running Tests

```bash
# Run all tests
docker-compose exec backend php artisan test

# Run specific test file
docker-compose exec backend php artisan test tests/Feature/ExampleTest.php

# Run with coverage
docker-compose exec backend php artisan test --coverage
```

#### Code Quality

```bash
# Run PHP CS Fixer (code style)
docker-compose exec backend vendor/bin/pint

# Run PHPStan (static analysis)
docker-compose exec backend vendor/bin/phpstan analyse
```

### Frontend Development

#### Project Structure

```bash
# Create new screen
mkdir -p frontend/src/presentation/screens/ExampleScreen
touch frontend/src/presentation/screens/ExampleScreen/index.tsx

# Create new component
mkdir -p frontend/src/presentation/components/Example
touch frontend/src/presentation/components/Example/index.tsx
```

#### Running Tests

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

#### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix

# Run TypeScript type checking
npx tsc --noEmit
```

#### Building for Production

```bash
# iOS
npm run ios -- --configuration Release

# Android
npm run android -- --variant=release
```

## Common Tasks

### Adding a New Entity

1. **Backend**:
   - Create migration in `backend/database/migrations/`
   - Create Eloquent model in `backend/app/Models/`
   - Create domain entity in `backend/app/Domain/Entities/`
   - Create repository interface in `backend/app/Domain/Repositories/`
   - Create controller in `backend/app/Http/Controllers/`
   - Add routes in `backend/routes/api.php`

2. **Frontend**:
   - Add interface in `frontend/src/domain/entities/`
   - Create repository interface in `frontend/src/domain/repositories/`
   - Implement SQLite repository in `frontend/src/infrastructure/database/`
   - Update sync service in `frontend/src/infrastructure/sync/`
   - Create UI screens in `frontend/src/presentation/screens/`

### Testing the Sync Functionality

1. Start backend with Docker: `docker-compose up -d`
2. Start frontend: `cd frontend && npm start`
3. Open app on device/emulator
4. Login with test credentials
5. Create data offline (turn off network)
6. Turn network back on
7. Verify automatic sync occurs
8. Check sync logs in backend

### Debugging

#### Backend Debugging

```bash
# View application logs
docker-compose logs -f backend

# View MySQL logs
docker-compose logs -f mysql

# Access Laravel Tinker (REPL)
docker-compose exec backend php artisan tinker

# Enable query logging (add to controller)
\DB::enableQueryLog();
// your code here
dd(\DB::getQueryLog());
```

#### Frontend Debugging

- Use React DevTools browser extension
- Use `console.log()` statements (visible in terminal)
- Use React Native Debugger standalone app
- Use Flipper for advanced debugging

#### Database Debugging

```bash
# Access MySQL CLI
docker-compose exec mysql mysql -u laravel -p fieldsyncledger

# Show all tables
SHOW TABLES;

# Describe table structure
DESCRIBE suppliers;

# View recent sync logs
SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 10;
```

## Environment Variables

### Backend (.env)

Key variables to configure:

```env
APP_NAME=FieldSyncLedger
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:your-generated-key

DB_CONNECTION=mysql
DB_HOST=mysql  # or 127.0.0.1 for local
DB_PORT=3306
DB_DATABASE=fieldsyncledger
DB_USERNAME=laravel
DB_PASSWORD=laravelpassword

SYNC_BATCH_SIZE=100
SYNC_MAX_RETRY=3
```

### Frontend (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
# For physical device testing, use your computer's local IP:
# EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

## Troubleshooting

### Backend Issues

**Issue**: Port 8000 already in use
```bash
# Find process using port
lsof -i :8000

# Kill process or change port in docker-compose.yml
```

**Issue**: Database connection refused
```bash
# Ensure MySQL container is running
docker-compose ps

# Restart MySQL
docker-compose restart mysql

# Check MySQL logs
docker-compose logs mysql
```

**Issue**: Composer install fails
```bash
# Clear composer cache
docker-compose exec backend composer clear-cache

# Remove vendor directory and reinstall
docker-compose exec backend rm -rf vendor
docker-compose exec backend composer install
```

### Frontend Issues

**Issue**: Metro bundler crashes
```bash
# Clear Metro cache
npx expo start -c

# Or delete cache manually
rm -rf node_modules/.cache
```

**Issue**: Cannot connect to API from device
- Ensure device is on same WiFi network
- Use local IP address instead of localhost in EXPO_PUBLIC_API_URL
- Check firewall settings

**Issue**: SQLite database locked
```bash
# Clear app data on device
# Or in code:
await Database.close();
await Database.clearAllData();
```

## Best Practices

### Code Style

- **Backend**: Follow PSR-12 PHP coding standard
- **Frontend**: Follow TypeScript and React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch
git push origin feature/new-feature

# Create pull request on GitHub
```

### Testing

- Write tests for new features
- Ensure tests pass before committing
- Aim for >80% code coverage
- Test offline functionality thoroughly

### Security

- Never commit `.env` files
- Never commit API keys or secrets
- Always validate user input
- Use parameterized queries (automatically handled by Eloquent)
- Keep dependencies up to date

## Getting Help

- Read the [Architecture Documentation](./ARCHITECTURE.md)
- Check existing issues on GitHub
- Review code comments in the source
- Ask team members for guidance

## Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture Guide](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## Next Steps

1. Explore the codebase
2. Run the application locally
3. Try creating test data
4. Test offline functionality
5. Review the architecture documentation
6. Start contributing!
