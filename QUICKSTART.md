# PayMaster Quick Start Guide

This guide will help you get the PayMaster application running in 10 minutes.

## Prerequisites

- PHP 8.1+ installed
- MySQL 8.0+ installed and running
- Node.js 18+ and npm installed
- Expo CLI (`npm install -g expo-cli`)
- A smartphone with Expo Go app (iOS/Android) OR an emulator

## Step 1: Clone and Setup Database (3 minutes)

```bash
# Clone the repository
git clone https://github.com/kasunvimarshana/PayMaster.git
cd PayMaster

# Create database
mysql -u root -p -e "CREATE DATABASE paymaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# Run migrations in order
cd backend/database/migrations
mysql -u root -p paymaster < 001_create_users_table.sql
mysql -u root -p paymaster < 002_create_suppliers_table.sql
mysql -u root -p paymaster < 003_create_products_table.sql
mysql -u root -p paymaster < 004_create_product_rates_table.sql
mysql -u root -p paymaster < 005_create_collections_table.sql
mysql -u root -p paymaster < 006_create_payments_table.sql
mysql -u root -p paymaster < 007_create_sync_logs_table.sql

# Optional: Load sample data
cd ../seeds
mysql -u root -p paymaster < sample_data.sql
```

## Step 2: Configure Backend (1 minute)

```bash
# Go to backend directory
cd ../../..
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Update these lines:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=paymaster
# DB_USERNAME=root
# DB_PASSWORD=your_password
```

## Step 3: Start Backend Server (1 minute)

```bash
# Start PHP built-in server
php -S localhost:8000 -t public

# You should see:
# PHP 8.x Development Server (http://localhost:8000) started
```

Leave this terminal running and open a new terminal.

## Step 4: Test Backend API (1 minute)

```bash
# Test health endpoint
curl http://localhost:8000/health

# Should return:
# {"success":true,"message":"PayMaster API is running","version":"1.0.0","timestamp":"..."}

# Test registration
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Should return success with token
```

## Step 5: Setup Frontend (2 minutes)

```bash
# Open new terminal
cd frontend

# Install dependencies (this takes ~2 minutes)
npm install
```

## Step 6: Configure Frontend API Endpoint (30 seconds)

```bash
# Edit src/config/app.config.ts
# Update API_BASE_URL if your backend is not on localhost:8000
```

If using your phone with Expo Go:
- Find your computer's local IP address
- Update `API_BASE_URL` to `http://YOUR_LOCAL_IP:8000`

Example:
```typescript
export const API_BASE_URL = 'http://192.168.1.100:8000';
```

## Step 7: Start Frontend (1 minute)

```bash
# Start Expo development server
npm start

# You should see a QR code in the terminal
```

## Step 8: Run on Device/Emulator (1 minute)

### Option A: Physical Device
1. Install Expo Go app from App Store (iOS) or Play Store (Android)
2. Open Expo Go app
3. Scan the QR code from terminal
4. Wait for app to load

### Option B: Emulator/Simulator
- Press `a` in terminal for Android emulator
- Press `i` in terminal for iOS simulator

## Step 9: Login and Test (1 minute)

1. App should open to login screen
2. Use one of these credentials:
   - Email: `admin@paymaster.com`
   - Password: `password123`
   
   OR
   
   - Email: `john@example.com` (if you registered in Step 4)
   - Password: `password123`

3. After successful login, you should see the dashboard

## Troubleshooting

### Backend Issues

**Database connection failed:**
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `.env` file
- Ensure database exists: `SHOW DATABASES;`

**Port 8000 already in use:**
- Use different port: `php -S localhost:8080 -t public`
- Update frontend API_BASE_URL accordingly

**404 errors:**
- Ensure you're in the `backend` directory
- Verify `public/index.php` exists

### Frontend Issues

**Cannot connect to API:**
- Check backend is running on `http://localhost:8000/health`
- If using phone: Update API_BASE_URL to your computer's IP
- Disable firewall temporarily to test

**Expo won't start:**
- Clear cache: `npx expo start -c`
- Delete node_modules: `rm -rf node_modules && npm install`

**App shows white screen:**
- Check Metro bundler is running
- Look for errors in terminal
- Reload app: Shake device and press "Reload"

## What Works Now?

✅ **Backend:**
- User authentication (register, login, logout)
- User management (get user info)
- Supplier CRUD operations
- Health check endpoint

✅ **Frontend:**
- Login screen
- User authentication flow
- Dashboard with user info
- Token management
- Error handling

## What's Next?

To continue development:

1. **Test the API with curl:**
```bash
# Login to get token
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paymaster.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Create a supplier
curl -X POST http://localhost:8000/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Tea Supplier A","code":"SUP001","region":"North","phone":"+1234567890"}'

# List suppliers
curl -X GET http://localhost:8000/suppliers \
  -H "Authorization: Bearer $TOKEN"
```

2. **Explore the code:**
- Backend: `backend/src/`
- Frontend: `frontend/src/`
- Documentation: `*.md` files in root

3. **Read implementation status:**
- See `IMPLEMENTATION_STATUS.md` for detailed status

## Development Tips

### Backend Development

```bash
# Watch for PHP errors in terminal where server is running
# Errors are displayed in real-time

# Test endpoints with curl or Postman
# API documentation: backend/API_DOCUMENTATION.md
```

### Frontend Development

```bash
# Enable hot reload (automatic)
# Changes to code reload app automatically

# Debug with React Native Debugger
# Shake device -> "Debug"

# View console logs in terminal
```

### Database Management

```bash
# Access MySQL
mysql -u root -p paymaster

# View tables
SHOW TABLES;

# Check users
SELECT id, name, email, roles FROM users;

# Check suppliers
SELECT id, name, code, region FROM suppliers;
```

## Getting Help

- **Documentation:** Check all `*.md` files in repository
- **Architecture:** Read `ARCHITECTURE.md`
- **Implementation:** Check `IMPLEMENTATION_STATUS.md`
- **API Reference:** See `backend/API_DOCUMENTATION.md`
- **Security:** Read `SECURITY.md`

## Demo Credentials

The sample data includes these test users:

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@paymaster.com | password123 | admin | Full access |
| manager@paymaster.com | password123 | manager | Manage operations |
| collector@paymaster.com | password123 | collector | Data collection only |

## Success Checklist

- [ ] Backend server running on http://localhost:8000
- [ ] Health endpoint returns success
- [ ] Can register new user via API
- [ ] Can login via API
- [ ] Frontend app loads on device/emulator
- [ ] Can login through mobile app
- [ ] Dashboard displays user information

If all items are checked, you're ready to develop! 🎉

## Next Steps

1. Read `IMPLEMENTATION_STATUS.md` to see what's implemented
2. Check `ARCHITECTURE.md` to understand the system design
3. Explore the codebase in `backend/src` and `frontend/src`
4. Start implementing missing features
5. Follow Clean Architecture principles

---

**Estimated Time to Complete:** 10 minutes
**Difficulty:** Easy
**Prerequisites Met?** Yes | No
**Status:** Ready to develop ✅
