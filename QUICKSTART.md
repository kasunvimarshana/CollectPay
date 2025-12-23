# Quick Start Guide

Get TransacTrack up and running in minutes!

## Prerequisites

Install the following before you begin:

- **Backend**: PHP 8.1+, Composer, MySQL
- **Mobile**: Node.js 18+, npm, Expo CLI

## Quick Setup (Development)

### 1. Clone the Repository

```bash
git clone https://github.com/kasunvimarshana/TransacTrack.git
cd TransacTrack
```

### 2. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env

# Edit .env with your database credentials
nano .env  # or use your preferred editor

# Generate application key
php artisan key:generate

# Create database
mysql -u root -p -e "CREATE DATABASE transactrack;"

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

Backend will be available at `http://localhost:8000`

### 3. Mobile App Setup (3 minutes)

```bash
# Navigate to mobile (in a new terminal)
cd mobile

# Install dependencies
npm install

# Start Expo
npm start
```

### 4. Test the Application

1. **Scan QR code** with Expo Go app (iOS/Android)
2. **Register a new user** in the app
3. **Login** with your credentials
4. **Explore** the features!

## Quick Test Data (Optional)

Create test data via API or directly in database:

### Create a Test User

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password",
    "password_confirmation": "password"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

Copy the token from the response and use it for authenticated requests.

## Configuration Tips

### Backend (.env)

Key settings to configure:

```env
# Application
APP_NAME=TransacTrack
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=transactrack
DB_USERNAME=root
DB_PASSWORD=your_password

# CORS (for mobile app)
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:19006
```

### Mobile (app.json)

Update API URL:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_LOCAL_IP:8000/api"
    }
  }
}
```

**Note**: Use your computer's local IP (e.g., 192.168.1.100) not localhost when testing on a physical device.

## Common Issues

### Backend Issues

**Issue**: `php artisan migrate` fails
- **Solution**: Check database credentials in `.env`
- **Solution**: Ensure MySQL is running: `sudo systemctl start mysql`

**Issue**: Permission denied errors
- **Solution**: Fix storage permissions:
  ```bash
  chmod -R 775 storage bootstrap/cache
  ```

### Mobile Issues

**Issue**: Cannot connect to API
- **Solution**: Use your local IP address, not localhost
- **Solution**: Ensure backend is running
- **Solution**: Check firewall settings

**Issue**: Expo app not loading
- **Solution**: Clear cache: `expo start -c`
- **Solution**: Delete node_modules and reinstall

## Next Steps

1. **Read the Documentation**
   - [README.md](README.md) - System overview
   - [API.md](API.md) - API endpoints
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

2. **Explore Features**
   - Create suppliers
   - Add products
   - Record collections
   - Process payments
   - Test offline sync

3. **Customize**
   - Modify user roles
   - Add custom fields
   - Extend API endpoints
   - Customize UI

4. **Deploy to Production**
   - See [DEPLOYMENT.md](DEPLOYMENT.md)

## Development Workflow

### Backend Development

```bash
# Watch for file changes (optional)
php artisan serve --watch

# Run tests
php artisan test

# Clear cache
php artisan cache:clear
```

### Mobile Development

```bash
# Development
npm start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator

# Lint code
npm run lint

# Run tests
npm test
```

## Default Credentials

After seeding (if you create a seeder):
- Email: admin@transactrack.com
- Password: password

**Important**: Change these in production!

## Getting Help

- **Documentation**: See docs in repository
- **Issues**: https://github.com/kasunvimarshana/TransacTrack/issues
- **API**: See [API.md](API.md)

## Quick Reference

### Useful Commands

```bash
# Backend
php artisan serve              # Start server
php artisan migrate           # Run migrations
php artisan migrate:fresh     # Fresh migration
php artisan db:seed          # Seed database
php artisan config:cache     # Cache config
php artisan route:list       # List routes

# Mobile
npm start                    # Start Expo
npm run ios                 # iOS simulator
npm run android            # Android emulator
expo start -c              # Clear cache
```

### File Structure

```
TransacTrack/
├── backend/            # Laravel API
│   ├── app/           # Application code
│   ├── config/        # Configuration
│   ├── database/      # Migrations, seeders
│   └── routes/        # API routes
├── mobile/            # React Native app
│   ├── src/          # Application code
│   ├── App.tsx       # Entry point
│   └── app.json      # Expo config
└── docs/             # Documentation
```

## Tips for Success

1. **Start Simple**: Test basic features first
2. **Check Logs**: Monitor backend logs for errors
3. **Use Postman**: Test API endpoints independently
4. **Read Errors**: Error messages are helpful!
5. **Ask Questions**: Use GitHub issues

## Ready for Production?

When you're ready to deploy:

1. Follow [DEPLOYMENT.md](DEPLOYMENT.md)
2. Review [SECURITY.md](SECURITY.md)
3. Update environment variables
4. Set up SSL/HTTPS
5. Configure backups
6. Set up monitoring

---

**Happy coding! 🚀**

For detailed information, see the main [README.md](README.md)
