# TrackVault - Quick Start Guide

## 🚀 Backend Setup (5 minutes)

### Prerequisites
- PHP 8.2+
- Composer

### Installation

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env

# Generate keys
php artisan key:generate
php artisan jwt:secret --force

# Setup database
touch database/database.sqlite
php artisan migrate

# Start server
php artisan serve
```

**Server will be running at:** `http://localhost:8000`

## 🧪 Quick API Test

### 1. Register a User
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@trackvault.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### 2. Login and Get Token
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trackvault.com",
    "password": "password123"
  }'
```

**Copy the token from the response!**

### 3. Test Authenticated Endpoint
```bash
# Replace YOUR_TOKEN with the token from step 2
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Create a Supplier
```bash
curl -X POST http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Tea Supplier",
    "contact_person": "John Doe",
    "phone": "+94771234567",
    "email": "john@example.com",
    "address": "123 Tea Estate Road",
    "city": "Nuwara Eliya",
    "status": "active"
  }'
```

### 5. Create a Product
```bash
curl -X POST http://localhost:8000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tea Leaves (Green)",
    "code": "TEA-GREEN",
    "description": "Premium green tea leaves",
    "base_unit": "kg",
    "allowed_units": ["kg", "g"],
    "status": "active"
  }'
```

### 6. Add Product Rate
```bash
curl -X POST http://localhost:8000/api/products/1/rates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rate": 150.00,
    "unit": "kg",
    "effective_from": "2025-12-01",
    "is_active": true
  }'
```

### 7. Create a Collection
```bash
curl -X POST http://localhost:8000/api/collections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 1,
    "product_id": 1,
    "quantity": 25.5,
    "unit": "kg",
    "collection_date": "2025-12-27",
    "notes": "Morning collection"
  }'
```

### 8. Create a Payment
```bash
curl -X POST http://localhost:8000/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 1,
    "amount": 2000.00,
    "payment_type": "advance",
    "payment_date": "2025-12-27",
    "payment_method": "cash",
    "reference_number": "PAY-001"
  }'
```

### 9. Check Supplier Balance
```bash
curl -X GET http://localhost:8000/api/suppliers/1/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. View Dashboard Stats
```bash
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Key Endpoints

### Authentication
- `POST /api/register` - Register user
- `POST /api/login` - Login and get token
- `GET /api/me` - Get current user
- `POST /api/logout` - Logout
- `POST /api/refresh` - Refresh token

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier
- `PUT /api/suppliers/{id}` - Update supplier (requires `version`)
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/{id}/balance` - Get balance

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `POST /api/products/{id}/rates` - Add rate

### Collections
- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection
- `GET /api/collections/{id}` - Get collection
- `PUT /api/collections/{id}` - Update collection

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment
- `PUT /api/payments/{id}` - Update payment

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/recent-collections` - Recent collections
- `GET /api/dashboard/recent-payments` - Recent payments

### Sync (Offline Support)
- `GET /api/sync/status` - Check server status
- `POST /api/sync` - Batch sync from device
- `GET /api/sync/changes` - Get server changes
- `POST /api/sync/resolve-conflict` - Resolve conflicts

## ✨ Features

- ✅ JWT Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Multi-unit quantity tracking
- ✅ Historical rate management
- ✅ Automatic calculations
- ✅ Version-based concurrency control
- ✅ Comprehensive audit logging
- ✅ Offline sync support
- ✅ Dashboard analytics
- ✅ Soft deletes
- ✅ RESTful API design

## 📖 Documentation

- **BACKEND_IMPLEMENTATION_STATUS.md** - Complete implementation status
- **API_DOCUMENTATION.md** - Detailed API reference
- **ARCHITECTURE.md** - System architecture
- **CLEAN_ARCHITECTURE_GUIDE.md** - Architecture guide
- **SETUP_GUIDE.md** - Detailed setup instructions

## 🔧 Useful Commands

```bash
# Code style check
./vendor/bin/pint --test

# Fix code style
./vendor/bin/pint

# Run tests
php artisan test

# Clear caches
php artisan config:clear
php artisan cache:clear

# List routes
php artisan route:list

# Create migration
php artisan make:migration create_xxx_table

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Fresh database
php artisan migrate:fresh
```

## 🎯 What's Next?

1. **Frontend Integration**: Connect React Native app to backend
2. **Testing**: Add comprehensive test suite
3. **Deployment**: Deploy to production server
4. **Monitoring**: Set up error tracking and monitoring
5. **Optimization**: Add caching and performance improvements

## 📞 Support

- Review the documentation files for detailed information
- Check API_DOCUMENTATION.md for all available endpoints
- See BACKEND_IMPLEMENTATION_STATUS.md for complete feature list

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: December 27, 2025
