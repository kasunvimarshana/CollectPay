# CollectPay Backend API

Laravel-based RESTful API for CollectPay data collection and payment management system.

## Features

- JWT Authentication with Laravel Sanctum
- RBAC and ABAC authorization
- Offline sync support with conflict resolution
- RESTful API design
- Comprehensive validation
- Database migrations

## Setup

1. Install dependencies:
```bash
composer install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Generate key:
```bash
php artisan key:generate
```

4. Run migrations:
```bash
php artisan migrate
```

5. Start server:
```bash
php artisan serve
```

## API Documentation

API is available at `/api` prefix. See main README for endpoint documentation.

## Testing

```bash
php artisan test
```
