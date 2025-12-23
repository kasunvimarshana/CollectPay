# TransacTrack Setup Guide

## Prerequisites

### Backend Requirements
- PHP 8.2 or higher
- Composer 2.x
- SQLite (for development) or MySQL/PostgreSQL (for production)

### Frontend Requirements
- Node.js 18.x or higher
- npm or yarn
- Expo CLI

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` and configure your environment:
```env
APP_NAME=TransacTrack
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Create Database
For SQLite:
```bash
touch database/database.sqlite
```

For MySQL/PostgreSQL, configure in `.env` and create the database.

### 6. Run Migrations
```bash
php artisan migrate
```

### 7. Seed Database (Optional)
```bash
php artisan db:seed
```

This creates sample users:
- Admin: admin@transactrack.com / password
- Manager: manager@transactrack.com / password
- Collector: collector@transactrack.com / password

### 8. Start Development Server
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Endpoint
Edit `src/utils/config.js` and update the API base URL if needed:
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 30000,
};
```

For physical devices, replace `localhost` with your computer's IP address:
```javascript
BASE_URL: 'http://192.168.1.100:8000/api',
```

### 4. Start Development Server
```bash
npm start
```

Or run specific platforms:
```bash
npm run android  # Android
npm run ios      # iOS (macOS only)
npm run web      # Web browser
```

### 5. Install Expo Go App
- Download Expo Go from App Store (iOS) or Play Store (Android)
- Scan the QR code displayed in terminal

## Testing the Application

### 1. Test Backend API
```bash
# Test health endpoint
curl http://localhost:8000/api

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@transactrack.com","password":"password","device_name":"Test"}'
```

### 2. Test Frontend
1. Open the app in Expo Go
2. Login with seeded credentials
3. Verify offline functionality by turning off network
4. Create some test collections
5. Re-enable network and verify sync

## Production Deployment

### Backend

#### Option 1: Traditional Server
1. Set up web server (Apache/Nginx)
2. Configure PHP-FPM
3. Point document root to `backend/public`
4. Configure database
5. Run migrations
6. Set appropriate permissions

#### Option 2: Docker
```dockerfile
FROM php:8.2-fpm
# Install dependencies and configure
```

### Frontend

#### Option 1: Expo EAS Build
```bash
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

#### Option 2: Bare React Native
```bash
npx expo prebuild
# Follow React Native deployment guides
```

## Security Considerations

### Backend
1. Set `APP_DEBUG=false` in production
2. Use strong `APP_KEY`
3. Configure HTTPS
4. Set up proper CORS policies
5. Use environment-specific `.env` files
6. Enable rate limiting
7. Configure firewall rules

### Frontend
1. Never commit API keys or secrets
2. Use environment variables for sensitive data
3. Implement certificate pinning for production
4. Enable ProGuard/R8 for Android
5. Use proper keystore management

## Troubleshooting

### Backend Issues

**Database connection error:**
- Check database credentials in `.env`
- Ensure database exists
- Verify file permissions for SQLite

**Migration errors:**
- Clear config cache: `php artisan config:clear`
- Reset migrations: `php artisan migrate:fresh`

### Frontend Issues

**API connection failed:**
- Verify backend is running
- Check API URL in config
- For physical devices, use IP address instead of localhost
- Ensure devices are on same network

**Database initialization error:**
- Clear app data and reinstall
- Check device storage space

**Sync not working:**
- Verify network connection
- Check authentication token
- Review sync queue status

## Support

For issues and questions:
- GitHub Issues: https://github.com/kasunvimarshana/TransacTrack/issues
- Email: support@transactrack.com

## License

MIT License - See LICENSE file for details
