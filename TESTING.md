# Testing Guide

## Overview

This guide covers testing strategies for both backend and mobile components of the TransacTrack application.

## Backend Testing (Laravel/PHPUnit)

### Setup

```bash
cd backend
composer install
php artisan test
```

### Test Structure

```
tests/
├── Feature/           # Integration/feature tests
│   ├── AuthTest.php
│   ├── SupplierTest.php
│   ├── ProductTest.php
│   ├── CollectionTest.php
│   ├── PaymentTest.php
│   └── SyncTest.php
└── Unit/              # Unit tests
    ├── PaymentCalculationServiceTest.php
    ├── AuthorizationServiceTest.php
    ├── EncryptionServiceTest.php
    └── ValidationServiceTest.php
```

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run specific test file
php artisan test tests/Unit/PaymentCalculationServiceTest.php

# Run with coverage
php artisan test --coverage
```

### Key Test Cases

#### Authentication Tests
- User registration with valid data
- User registration with invalid data
- User login with valid credentials
- User login with invalid credentials
- Token generation and validation
- Logout functionality

#### Authorization Tests
- RBAC permission checks for all roles
- ABAC attribute-based access control
- Resource ownership validation
- Context-based authorization

#### Payment Calculation Tests
- Supplier balance calculation
- Advance payment handling
- Partial payment calculation
- Full payment settlement
- Historical payment tracking
- Payment validation rules

#### Sync Tests
- Offline data synchronization
- Conflict detection
- Conflict resolution (server, client, merge)
- Multi-device concurrency
- Version tracking

## Mobile Testing (React Native/Jest)

### Setup

```bash
cd mobile
npm install
npm test
```

### Test Structure

```
mobile/__tests__/
├── components/
│   ├── ErrorBoundary.test.tsx
│   └── Loading.test.tsx
├── services/
│   ├── api.test.ts
│   └── sync.test.ts
├── store/
│   ├── authSlice.test.ts
│   ├── collectionsSlice.test.ts
│   └── paymentsSlice.test.ts
└── utils/
    ├── errorHandler.test.ts
    └── validator.test.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ErrorBoundary.test.tsx
```

### Key Test Cases

#### Component Tests
- ErrorBoundary catches and displays errors
- Loading component shows/hides correctly
- Screen components render without crashing
- Navigation between screens works

#### Service Tests
- API calls succeed with valid data
- API calls fail gracefully with invalid data
- Sync service validates data before sending
- Error handling works correctly

#### State Management Tests
- Redux actions dispatch correctly
- Reducers update state properly
- Selectors return correct data
- Persistence works as expected

#### Validation Tests
- Client-side validation catches errors
- Valid data passes validation
- Sanitization removes dangerous content
- Email and phone validation works

## Integration Testing

### Offline Scenarios

1. **Create data while offline**
   - Create collection/payment
   - Data stored locally
   - Marked as pending sync

2. **Go online and sync**
   - Connection restored
   - Auto-sync triggers
   - Data sent to server
   - Local data updated

3. **Handle sync conflicts**
   - Same resource modified on multiple devices
   - Conflict detected
   - User presented with resolution options
   - User selects resolution
   - Data reconciled

### Multi-Device Testing

1. **Setup two devices**
   - Device A and Device B
   - Same user account

2. **Create data on Device A**
   - Add collection
   - Sync to server

3. **Verify on Device B**
   - Sync Device B
   - Data appears on Device B

4. **Create conflict**
   - Modify same resource on both devices while offline
   - Bring both online
   - Sync both devices
   - Verify conflict detection
   - Resolve conflict

### Role-Based Access Testing

1. **Admin Role**
   - Can access all endpoints
   - Can manage all resources
   - Can view all data

2. **Manager Role**
   - Can view all data
   - Can manage suppliers/products
   - Cannot manage users
   - Cannot delete data

3. **Collector Role**
   - Can create collections/payments
   - Can view own data
   - Cannot manage suppliers/products
   - Cannot view other users' data

4. **Viewer Role**
   - Can view data
   - Cannot create/modify/delete

## Performance Testing

### Backend Performance

```bash
# Use Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/suppliers

# Use Laravel Telescope for profiling
php artisan telescope:install
```

### Mobile Performance

- Monitor app startup time
- Test offline-first performance
- Measure sync duration
- Check memory usage
- Profile Redux store size

## Security Testing

### Backend Security

1. **Authentication**
   - Expired token rejection
   - Invalid token rejection
   - Token refresh

2. **Authorization**
   - Role-based access enforcement
   - Resource ownership checks
   - Permission boundaries

3. **Input Validation**
   - SQL injection attempts blocked
   - XSS attempts blocked
   - Invalid input rejected

4. **Encryption**
   - Sensitive data encrypted at rest
   - HTTPS in transit
   - Token security

### Mobile Security

1. **Secure Storage**
   - Auth tokens in SecureStore
   - Sensitive data encrypted

2. **Network Security**
   - HTTPS only
   - Certificate pinning (production)
   - Timeout handling

3. **Data Validation**
   - Client-side validation
   - Sanitization before sync
   - Type checking

## Test Data

### Using Seeders

```bash
cd backend
php artisan db:seed
```

This creates:
- 5 users (admin, manager, 2 collectors, viewer)
- 3 suppliers
- 4 products
- Product rates (historical and current)

### Manual Test Data

Use Postman or curl to create test data:

```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "collector1@transactrack.com", "password": "password"}'

# Create collection
curl -X POST http://localhost:8000/api/collections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 1,
    "product_id": 1,
    "quantity": 10,
    "unit": "l",
    "rate": 2.75,
    "collection_date": "2024-12-23"
  }'
```

## Continuous Testing

### Pre-commit Hooks

```bash
# Install git hooks
composer install
npm install

# Tests run automatically before commit
git commit -m "Your changes"
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd backend
          composer install
          php artisan test

  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd mobile
          npm install
          npm test
```

## Best Practices

1. **Write tests first** (TDD)
2. **Test one thing at a time**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Keep tests fast**
6. **Maintain test coverage above 80%**
7. **Test edge cases and error conditions**
8. **Update tests when changing code**

## Troubleshooting

### Common Issues

1. **Tests fail after migration**
   - Run `php artisan migrate:fresh`
   - Re-seed database

2. **Mobile tests timeout**
   - Increase Jest timeout
   - Check for async issues

3. **Coverage reports incomplete**
   - Check ignored files
   - Update coverage configuration

## Resources

- [PHPUnit Documentation](https://phpunit.de)
- [Jest Documentation](https://jestjs.io)
- [Testing Library](https://testing-library.com)
- [Laravel Testing](https://laravel.com/docs/testing)
