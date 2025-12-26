# FieldSyncLedger - Quick Start Guide

This guide will help you get the FieldSyncLedger application up and running quickly for development and testing.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- Git installed
- Expo Go app (for mobile testing)

## Backend Setup (5 minutes)

### 1. Clone and Navigate

```bash
git clone https://github.com/kasunvimarshana/FieldSyncLedger.git
cd FieldSyncLedger
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` if needed (default settings work for Docker setup).

### 3. Start Services

```bash
# Start MySQL and backend services
docker-compose up -d

# Wait for MySQL to be ready (about 10 seconds)
sleep 10

# Run migrations
docker-compose exec backend php artisan migrate

# Generate application key
docker-compose exec backend php artisan key:generate

# Seed test data
docker-compose exec backend php artisan db:seed
```

### 4. Verify Backend

```bash
# Check if services are running
docker-compose ps

# Test API endpoint
curl http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fieldsyncledger.com","password":"password"}'
```

Backend is now running at: `http://localhost:8000`

## Frontend Setup (3 minutes)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
echo "EXPO_PUBLIC_API_URL=http://localhost:8000/api" > .env
```

**Note**: For physical devices, replace `localhost` with your computer's IP address:
```bash
echo "EXPO_PUBLIC_API_URL=http://192.168.1.x:8000/api" > .env
```

### 3. Start Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Display a QR code in the terminal
- Open Expo DevTools in your browser

### 4. Run on Device/Emulator

**Option A: Physical Device**
1. Install Expo Go app from App Store (iOS) or Play Store (Android)
2. Scan the QR code with your device camera
3. App will open in Expo Go

**Option B: Emulator**
- Press `a` for Android emulator (requires Android Studio)
- Press `i` for iOS simulator (requires Xcode on macOS)

## Test Credentials

After seeding the database, you can use these accounts:

### Admin Account
- **Email**: `admin@fieldsyncledger.com`
- **Password**: `password`
- **Permissions**: Full access to all features

### Collector Account
- **Email**: `john@fieldsyncledger.com`
- **Password**: `password`
- **Permissions**: Manage suppliers, collections, and payments

### Viewer Account
- **Email**: `viewer@fieldsyncledger.com`
- **Password**: `password`
- **Permissions**: Read-only access

## Test Data

The seeder creates:
- **8 Suppliers**: Tea estate suppliers from various districts
- **5 Products**: Different types of tea leaves
- **10 Rate Versions**: Historical and current rates for products
- **150 Collections**: 30 days of sample collections (5 suppliers)
- **10 Payments**: Advance and partial payments

## Testing API Endpoints

### 1. Login to Get Token

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fieldsyncledger.com",
    "password": "password"
  }'
```

Save the token from the response.

### 2. Get Suppliers

```bash
curl http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get Supplier Balance

```bash
curl http://localhost:8000/api/supplier-balances \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create Collection

```bash
curl -X POST http://localhost:8000/api/collections \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": "SUPPLIER_UUID",
    "product_id": "PRODUCT_UUID",
    "quantity": 100,
    "collection_date": "2024-01-15T10:00:00Z",
    "notes": "Test collection"
  }'
```

## Common Issues & Solutions

### Backend Issues

**Issue**: Cannot connect to MySQL
```bash
# Check if MySQL is running
docker-compose ps

# View MySQL logs
docker-compose logs mysql

# Restart services
docker-compose restart
```

**Issue**: Permission denied errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER backend/storage backend/bootstrap/cache
```

**Issue**: Migration errors
```bash
# Reset database (WARNING: Deletes all data)
docker-compose exec backend php artisan migrate:fresh --seed
```

### Frontend Issues

**Issue**: Cannot connect to API from device
- Ensure device is on the same network as your computer
- Use your computer's IP address instead of `localhost`
- Check firewall settings

**Issue**: Metro bundler errors
```bash
# Clear cache and restart
npx expo start -c
```

**Issue**: SQLite errors
```bash
# The app will auto-create tables on first run
# If issues persist, clear app data and reinstall
```

## Development Workflow

### Backend Development

```bash
# Watch logs
docker-compose logs -f backend

# Run artisan commands
docker-compose exec backend php artisan [command]

# Access MySQL
docker-compose exec mysql mysql -u root -p fieldsyncledger

# Run tests (when implemented)
docker-compose exec backend php artisan test
```

### Frontend Development

```bash
# Start with cache clear
npm start -- --clear

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Run tests (when implemented)
npm test
```

## Next Steps

1. **Explore the API**: Use Postman or curl to test all endpoints
2. **Review Documentation**: Check `/docs` folder for detailed guides
3. **Build UI**: Start implementing mobile app screens
4. **Test Offline**: Disconnect network and test local storage
5. **Test Sync**: Reconnect and verify synchronization

## Useful Commands

```bash
# View all containers
docker-compose ps

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# View backend logs
docker-compose logs -f backend

# Access backend shell
docker-compose exec backend bash

# Rebuild containers
docker-compose up -d --build

# Fresh database with seed data
docker-compose exec backend php artisan migrate:fresh --seed
```

## API Documentation

Full API documentation is available at:
- [docs/API.md](./API.md)

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/kasunvimarshana/FieldSyncLedger/issues)
- Documentation: Check `/docs` folder for detailed guides
- Architecture: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design

## Success Indicators

You're ready to develop when:
- ✅ Backend responds to API requests
- ✅ You can login with test credentials
- ✅ Suppliers and products are listed via API
- ✅ Frontend loads on device/emulator
- ✅ Database contains seed data

**Happy coding! 🚀**
