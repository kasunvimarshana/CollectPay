# TrackVault - Setup and Development Guide

## Quick Start

### Prerequisites

- **Backend**: PHP 8.1+, Composer, SQLite/MySQL/PostgreSQL
- **Frontend**: Node.js 18+, npm, Expo CLI

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Generate application key**
   ```bash
   php artisan key:generate
   ```

5. **Generate JWT secret**
   ```bash
   php artisan jwt:secret
   ```

6. **Run database migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed database (optional)**
   ```bash
   php artisan db:seed
   ```

8. **Start development server**
   ```bash
   php artisan serve
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API configuration**
   Edit `src/shared/constants/index.ts` and update `API_BASE_URL` to point to your backend:
   ```typescript
   export const API_BASE_URL = 'http://localhost:8000/api';
   ```

4. **Start development server**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Press `i` for iOS simulator (macOS only)
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

### Backend (Laravel)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/  # API Controllers
│   │   ├── Middleware/       # Custom middleware
│   │   └── Requests/         # Form request validation
│   ├── Models/              # Eloquent models
│   └── Providers/          # Service providers
├── config/                 # Configuration files
├── database/
│   ├── migrations/        # Database migrations
│   └── seeders/          # Database seeders
└── routes/
    └── api.php           # API routes
```

### Frontend (React Native/Expo)

```
frontend/
├── src/
│   ├── application/
│   │   └── store/           # Context providers
│   ├── infrastructure/
│   │   ├── api/            # API client
│   │   ├── storage/        # Local storage/SQLite
│   │   └── sync/           # Sync mechanism
│   ├── presentation/
│   │   ├── screens/        # UI screens
│   │   ├── components/     # Reusable components
│   │   └── navigation/     # Navigation config
│   └── shared/
│       ├── types/         # TypeScript types
│       └── constants/     # App constants
└── App.tsx               # App entry point
```

## Key Features

### Backend Features

- ✅ JWT Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ RESTful API with 40+ endpoints
- ✅ Database migrations with versioning
- ✅ Comprehensive audit logging
- ✅ Multi-unit quantity tracking
- ✅ Historical rate management
- ✅ Automated payment calculations
- ✅ Transaction-based operations
- ✅ Soft deletes for data integrity

### Frontend Features

- ✅ Offline-first architecture
- ✅ Local SQLite database
- ✅ Automatic sync when online
- ✅ Conflict resolution
- ✅ React Navigation
- ✅ TypeScript support
- ✅ Context-based state management
- ✅ Secure token storage
- ✅ Network connectivity detection

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user
- `POST /api/refresh` - Refresh JWT token
- `POST /api/change-password` - Change password

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/{id}/collections` - Get supplier collections
- `GET /api/suppliers/{id}/payments` - Get supplier payments
- `GET /api/suppliers/{id}/balance` - Get supplier balance

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/{id}/rates` - Get product rates
- `POST /api/products/{id}/rates` - Add product rate
- `GET /api/products/{id}/current-rate` - Get current rate

### Collections
- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection
- `GET /api/collections/{id}` - Get collection
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment
- `POST /api/payments/calculate` - Calculate payment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-collections` - Get recent collections
- `GET /api/dashboard/recent-payments` - Get recent payments

## Testing

### Backend Testing

```bash
cd backend
php artisan test
```

### Frontend Testing

```bash
cd frontend
npm test
```

## Environment Variables

### Backend (.env)

```env
APP_NAME=TrackVault
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite

JWT_SECRET=your-secret-key
JWT_TTL=60
JWT_REFRESH_TTL=20160

CORS_ALLOWED_ORIGINS=*
```

### Frontend

Update `src/shared/constants/index.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:8000/api';
```

## Security Best Practices

1. **Never commit `.env` files**
2. **Use strong JWT secrets in production**
3. **Configure CORS properly for production**
4. **Enable HTTPS in production**
5. **Regularly update dependencies**
6. **Review audit logs**
7. **Implement rate limiting**
8. **Validate all inputs**

## Troubleshooting

### Backend Issues

**Issue**: "No application encryption key has been specified"
```bash
php artisan key:generate
```

**Issue**: Database errors
```bash
php artisan migrate:fresh
```

**Issue**: JWT token errors
```bash
php artisan jwt:secret
php artisan config:clear
php artisan cache:clear
```

### Frontend Issues

**Issue**: "Unable to resolve module"
```bash
npm install
npx expo start --clear
```

**Issue**: Network request failed
- Check API_BASE_URL in constants
- Ensure backend is running
- Check network connectivity

**Issue**: Expo Go not loading
```bash
npx expo start --tunnel
```

## Production Deployment

### Backend Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Configure production database
4. Set strong `JWT_SECRET`
5. Configure CORS origins
6. Run `php artisan config:cache`
7. Run `php artisan route:cache`
8. Set up SSL/TLS

### Frontend Deployment

1. Build for iOS: `npx expo build:ios`
2. Build for Android: `npx expo build:android`
3. Update API_BASE_URL to production URL
4. Submit to App Store / Play Store

## Support

For issues and questions:
- Check documentation in `/docs`
- Review API documentation
- Check existing issues on GitHub

## License

This project is proprietary software for TrackVault.
