# Quick Start Guide - Collection Payment System

## 🚀 Get Started in 5 Minutes

### Prerequisites
- PHP 8.3+
- Composer 2.x
- Node.js 20.x
- MySQL/SQLite

### Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env

# Generate keys
php artisan key:generate
php artisan jwt:secret

# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed --class=InitialDataSeeder

# Start server
php artisan serve
```

**Server running at: http://localhost:8000**

### Test Authentication (30 seconds)

```bash
# Login as admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "expires_in": 3600
  },
  "message": "Login successful"
}
```

### Frontend Setup (2 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Expo
npm start

# Or run on specific platform
npm run android  # For Android
npm run ios      # For iOS (macOS only)
npm run web      # For Web
```

## 🔐 Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | admin |
| collector@example.com | password | collector |

## 📊 Sample Data Available

### Products
- **Tea Leaves** (TEA001) - Rate: 5.50/kg
- **Coffee Beans** (COF001) - Rate: 12.00/kg

### Suppliers
- **Green Valley Farm** (SUP001) - Central region
- **Sunrise Plantation** (SUP002) - Northern region

### Rates
- Global rate for Tea Leaves: 5.50/kg
- Supplier-specific rate for Green Valley Farm: 6.00/kg (premium)
- Global rate for Coffee Beans: 12.00/kg

## 🧪 Testing the API

### 1. Health Check
```bash
curl http://localhost:8000/api/health
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 3. Get Current User (with token)
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### 4. Register New User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Collector",
    "email": "newcollector@example.com",
    "password": "password",
    "password_confirmation": "password",
    "role": "collector"
  }'
```

## 📱 Using the API

### Authentication Flow
1. **Login** → Get JWT token
2. **Use token** in Authorization header for all requests
3. **Refresh token** when needed (before expiry)
4. **Logout** to invalidate token

### Example: Creating a Collection (Coming Soon)
```bash
TOKEN="your_token_here"

curl -X POST http://localhost:8000/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 1,
    "product_id": 1,
    "quantity": 150.00,
    "unit": "kg",
    "collected_at": "2025-12-23T10:30:00Z",
    "notes": "Morning collection"
  }'
```

## 📚 Documentation

- **[README.md](./README.md)** - Overview and features
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture (10+ pages)
- **[API.md](./API.md)** - Complete API reference (15+ pages)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment (13+ pages)
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Development guide (11+ pages)
- **[SUMMARY.md](./SUMMARY.md)** - Project summary (10+ pages)

## 🔧 Common Commands

### Backend
```bash
# Run migrations
php artisan migrate

# Fresh migration (reset DB)
php artisan migrate:fresh

# Seed database
php artisan db:seed --class=InitialDataSeeder

# Clear cache
php artisan cache:clear
php artisan config:clear

# Run tests
php artisan test

# Start server
php artisan serve
```

### Frontend
```bash
# Install dependencies
npm install

# Start development
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Type checking
npx tsc --noEmit
```

## 🐛 Troubleshooting

### Backend Issues

**"Target class does not exist"**
```bash
composer dump-autoload
php artisan config:clear
```

**"Database connection failed"**
- Check .env database settings
- Ensure MySQL/SQLite is running
- Verify database exists

**"JWT secret not set"**
```bash
php artisan jwt:secret
```

### Frontend Issues

**"Module not found"**
```bash
rm -rf node_modules
npm install
```

**"Expo start failed"**
```bash
npx expo start -c  # Clear cache
```

## 🎯 What's Working Right Now

✅ Backend API server  
✅ JWT authentication (login, register, refresh, logout)  
✅ Database with sample data  
✅ Health check endpoint  
✅ All models with business logic  
✅ API route structure  

## 🚧 Coming Next

- Supplier, Product, Rate controllers
- Collection and Payment controllers
- Sync controller
- Frontend authentication screens
- Offline storage
- Synchronization service

## 💡 Tips

1. **Use Postman/Insomnia** to test API endpoints
2. **Check Laravel logs** at `storage/logs/laravel.log`
3. **Review API docs** for complete endpoint reference
4. **Use sample data** for testing before creating new records
5. **Test with both users** (admin and collector) to see role differences

## 📞 Need Help?

- Check the comprehensive documentation in the `/docs` folder
- Review the API documentation for endpoint details
- See ARCHITECTURE.md for system design
- Check IMPLEMENTATION.md for development guidance

## ⚡ Performance Tips

1. Use database indexing (already configured)
2. Enable Redis caching in production
3. Use Eloquent eager loading for relationships
4. Implement pagination on list endpoints
5. Cache configuration in production

## 🔐 Security Checklist

- ✅ JWT authentication configured
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control ready
- ✅ Input validation (to be added)
- ✅ HTTPS-ready (for production)
- ✅ CORS configured
- ✅ SQL injection protected (Eloquent ORM)

## 🎉 Success!

If you can login and get a JWT token, your backend is working perfectly!

```bash
# Quick test
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

If you see a success response with a token, you're all set! 🚀

---

**Next Steps**: 
1. Explore the API documentation
2. Test all authentication endpoints
3. Review the architecture documentation
4. Start implementing frontend screens
5. Build the offline synchronization system

Happy coding! 💻✨
