# LedgerFlow Collections - Setup Guide

## Prerequisites

- PHP 8.2 or higher
- Composer 2.x
- MySQL/PostgreSQL database
- Node.js 18+ and npm (for frontend)
- Expo CLI (for frontend)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
composer install
```

Note: If you encounter GitHub API rate limits during `composer install`, you may need to create a GitHub Personal Access Token:
1. Go to https://github.com/settings/tokens/new
2. Create a token with `repo` scope
3. Run: `composer config --global github-oauth.github.com YOUR_TOKEN`

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

Update the `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ledgerflow_collections
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 3. Install Laravel Sanctum (Authentication)

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. (Optional) Seed Database

```bash
php artisan db:seed
```

### 6. Start Development Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

### API Endpoints

All API endpoints are versioned under `/api/v1/`:

#### Suppliers
- `GET /api/v1/suppliers` - List all suppliers
- `POST /api/v1/suppliers` - Create supplier
- `GET /api/v1/suppliers/{id}` - Get supplier details
- `PUT /api/v1/suppliers/{id}` - Update supplier
- `DELETE /api/v1/suppliers/{id}` - Delete supplier

#### Products
- `GET /api/v1/products` - List all products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/{id}` - Get product details
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

#### Collections
- `GET /api/v1/collections` - List all collections
- `POST /api/v1/collections` - Create collection
- `GET /api/v1/collections/{id}` - Get collection details
- `PUT /api/v1/collections/{id}` - Update collection
- `DELETE /api/v1/collections/{id}` - Delete collection

#### Payments
- `GET /api/v1/payments` - List all payments
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments/{id}` - Get payment details
- `PUT /api/v1/payments/{id}` - Update payment
- `DELETE /api/v1/payments/{id}` - Delete payment
- `GET /api/v1/suppliers/{id}/payments/summary` - Get payment summary for supplier

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Install Required Packages

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack

# State Management
npm install @reduxjs/toolkit react-redux

# Local Storage
npm install expo-sqlite

# HTTP Client
npm install axios

# Forms
npm install react-hook-form yup

# Additional Expo packages
npx expo install react-native-screens react-native-safe-area-context
```

### 3. Configure API Endpoint

Create a `.env` file in the frontend directory:

```env
API_BASE_URL=http://localhost:8000/api/v1
```

### 4. Start Development Server

```bash
npx expo start
```

Use Expo Go app on your mobile device to scan the QR code, or press:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web

## Architecture Overview

This project follows **Clean Architecture** principles with clear separation of concerns:

### Backend Architecture

```
backend/
├── app/
│   ├── Domain/              # Business logic layer (framework-independent)
│   │   ├── Entities/        # Domain entities with business rules
│   │   ├── ValueObjects/    # Immutable value objects (Money, Quantity)
│   │   ├── Repositories/    # Repository interfaces (contracts)
│   │   └── Services/        # Domain services (PaymentCalculation)
│   │
│   ├── Application/         # Application business rules
│   │   ├── DTOs/           # Data Transfer Objects
│   │   ├── UseCases/       # Use cases (application logic)
│   │   └── Validators/     # Business validation logic
│   │
│   ├── Infrastructure/      # External integrations
│   │   ├── Repositories/   # Repository implementations (Eloquent)
│   │   └── Security/       # Security services
│   │
│   ├── Http/               # Presentation layer
│   │   ├── Controllers/    # API controllers
│   │   ├── Requests/       # Form request validators
│   │   └── Resources/      # API response transformers
│   │
│   └── Models/             # Eloquent ORM models
```

### Frontend Architecture (To be implemented)

```
frontend/
├── src/
│   ├── domain/             # Business logic (platform-independent)
│   │   ├── entities/       # Domain entities
│   │   ├── repositories/   # Repository interfaces
│   │   └── useCases/       # Use cases
│   │
│   ├── data/              # Data layer
│   │   ├── repositories/  # Repository implementations
│   │   ├── datasources/   # API and local data sources
│   │   └── models/        # Data models
│   │
│   ├── presentation/      # UI layer
│   │   ├── screens/       # Screen components
│   │   ├── components/    # Reusable components
│   │   ├── navigation/    # Navigation configuration
│   │   └── hooks/         # Custom React hooks
│   │
│   └── infrastructure/    # Platform-specific implementations
│       ├── api/           # API client
│       ├── storage/       # Local storage (SQLite)
│       └── sync/          # Offline sync mechanism
```

## Design Principles

### SOLID Principles
- **S**ingle Responsibility: Each class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable
- **I**nterface Segregation: Many specific interfaces > one general
- **D**ependency Inversion: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)
- Code reuse through well-defined abstractions
- Shared logic in domain services and value objects

### KISS (Keep It Simple, Stupid)
- Simple, readable code over clever solutions
- Clear naming conventions
- Minimal complexity

### Clean Architecture Benefits
- **Framework Independence**: Domain logic is independent of Laravel/React Native
- **Testability**: Business logic can be tested without UI or database
- **UI Independence**: Can change UI without affecting business logic
- **Database Independence**: Can swap databases without affecting business logic
- **External Agency Independence**: Business rules don't depend on external systems

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Development Workflow

### 1. Backend Development
1. Define domain entities in `app/Domain/Entities/`
2. Create DTOs in `app/Application/DTOs/`
3. Implement use cases in `app/Application/UseCases/`
4. Implement repositories in `app/Infrastructure/Repositories/`
5. Create controllers in `app/Http/Controllers/Api/V1/`
6. Add routes in `routes/api.php`
7. Write tests in `tests/`

### 2. Frontend Development
1. Define domain entities in `src/domain/entities/`
2. Create use cases in `src/domain/useCases/`
3. Implement repositories in `src/data/repositories/`
4. Create data sources in `src/data/datasources/`
5. Build UI components in `src/presentation/components/`
6. Create screens in `src/presentation/screens/`
7. Write tests in `__tests__/`

## Troubleshooting

### Composer GitHub Rate Limit
If you hit GitHub API rate limits, configure a personal access token:
```bash
composer config --global github-oauth.github.com YOUR_TOKEN
```

### Database Connection Issues
Ensure your MySQL/PostgreSQL service is running and credentials in `.env` are correct.

### Expo Connection Issues
Ensure your mobile device and development machine are on the same network.

## Production Deployment

### Backend
1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Run `php artisan config:cache`
4. Run `php artisan route:cache`
5. Run `php artisan view:cache`
6. Set up proper database backups
7. Configure web server (Nginx/Apache)
8. Set up SSL/TLS certificates
9. Configure queue workers for async jobs

### Frontend
1. Build production bundle: `expo build:android` or `expo build:ios`
2. Submit to app stores
3. Configure production API endpoint

## Security Considerations

- All API endpoints require authentication (Laravel Sanctum)
- RBAC (Role-Based Access Control) enforced
- Input validation on all requests
- SQL injection prevention via Eloquent ORM
- XSS prevention via output escaping
- CSRF protection enabled
- Rate limiting on API endpoints
- Audit logging for all data modifications

## Support

For issues or questions, please contact the development team or create an issue in the repository.

## License

[Your License Here]
