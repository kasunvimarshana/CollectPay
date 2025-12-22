# CollectPay Quick Start Guide

Get CollectPay up and running in minutes!

## 🚀 Quick Start (Docker)

The fastest way to get started is using Docker Compose:

### Prerequisites
- Docker
- Docker Compose

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/kasunvimarshana/CollectPay.git
cd CollectPay
```

2. **Configure backend environment**
```bash
cd backend
cp .env.example .env
```

3. **Start services**
```bash
cd ..
docker-compose up -d
```

4. **Initialize database**
```bash
docker exec -it collectpay-backend php artisan migrate
docker exec -it collectpay-backend php artisan db:seed
```

5. **Access the application**
- API: http://localhost:8000
- PhpMyAdmin: http://localhost:8080

6. **Test credentials**
```
Admin:
- Email: admin@collectpay.com
- Password: password

Collector:
- Email: collector@collectpay.com
- Password: password
```

## 📱 Mobile App Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start Expo**
```bash
npm start
```

3. **Run on device**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR with Expo Go on phone

## 🔧 Manual Setup (Without Docker)

### Backend Setup

1. **Install dependencies**
```bash
cd backend
composer install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Generate key**
```bash
php artisan key:generate
```

4. **Create database**
```bash
mysql -u root -p
CREATE DATABASE collectpay;
exit
```

5. **Run migrations**
```bash
php artisan migrate
php artisan db:seed
```

6. **Start server**
```bash
php artisan serve
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure API**
Edit `src/services/api.ts` if backend URL is different.

3. **Start app**
```bash
npm start
```

## 🧪 Testing the Application

### Backend API Tests

```bash
cd backend
php artisan test
```

### Test API Endpoints

Using curl:
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"collector@collectpay.com","password":"password"}'

# Get suppliers (requires token)
curl -X GET http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mobile App Testing

1. Login with test credentials
2. Create a new collection
3. Create a new payment
4. Test offline mode (airplane mode)
5. Test sync when back online

## 📊 Sample Data

After seeding, you'll have:
- 3 users (admin, supervisor, collector)
- 3 suppliers
- 3 products (tea leaves, green tea, milk)
- 4 rates

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
php artisan serve --port=8001
```

**Database connection error:**
- Check MySQL is running
- Verify credentials in .env
- Ensure database exists

**Permission errors:**
```bash
chmod -R 775 storage bootstrap/cache
```

### Frontend Issues

**Metro bundler error:**
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

**Expo Go not connecting:**
- Ensure phone and computer on same network
- Try tunnel connection: `npm start -- --tunnel`

## 📖 Next Steps

1. Read the [full README](README.md)
2. Check [API Documentation](API_DOCUMENTATION.md)
3. Review [Deployment Guide](DEPLOYMENT.md)
4. Explore the code!

## 💡 Key Features to Try

1. **Offline Collection**
   - Turn on airplane mode
   - Add a collection
   - Turn off airplane mode
   - Tap "Sync Data"

2. **Rate Calculation**
   - Create collection
   - Enter quantity and rate
   - See automatic amount calculation

3. **Payment Tracking**
   - Add advance payment
   - Add partial payment
   - View payment summary

4. **Multi-User**
   - Login as different users
   - See role-based permissions

## 🆘 Need Help?

- Check [Issues](https://github.com/kasunvimarshana/CollectPay/issues)
- Read [Contributing Guide](CONTRIBUTING.md)
- Review [Security Policy](SECURITY.md)

Happy collecting! 🎉
