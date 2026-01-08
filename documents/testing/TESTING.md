# Testing Guide

## Comprehensive Testing Strategy for the Ledger System

This guide covers testing approaches for both backend and frontend components.

---

## Table of Contents

1. [Backend Testing](#backend-testing)
2. [Frontend Testing](#frontend-testing)
3. [Integration Testing](#integration-testing)
4. [Performance Testing](#performance-testing)
5. [Security Testing](#security-testing)

---

## Backend Testing

### Setup

```bash
cd backend

# Install dev dependencies
composer install

# Configure test environment
cp .env.testing.example .env.testing

# Create test database
php artisan migrate --env=testing
```

### Unit Tests

Create test files in `tests/Unit`:

```php
<?php
// tests/Unit/SupplierTest.php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    public function test_supplier_can_be_created()
    {
        $supplier = Supplier::create([
            'name' => 'Test Supplier',
            'code' => 'TEST001',
            'region' => 'Central',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('suppliers', [
            'code' => 'TEST001',
            'name' => 'Test Supplier',
        ]);
    }

    public function test_supplier_can_calculate_balance()
    {
        $supplier = Supplier::factory()->create();
        
        // Add collections
        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'total_amount' => 1000,
        ]);

        // Add payments
        Payment::factory()->create([
            'supplier_id' => $supplier->id,
            'amount' => 400,
        ]);

        $balance = $supplier->balance();
        
        $this->assertEquals(600, $balance);
    }
}
```

### Feature Tests

Create test files in `tests/Feature`:

```php
<?php
// tests/Feature/AuthenticationTest.php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'user',
                         'token',
                     ]
                 ]);
    }

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'user',
                         'token',
                     ]
                 ]);
    }

    public function test_authenticated_user_can_access_protected_route()
    {
        $user = User::factory()->create();
        $token = auth('api')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->getJson('/api/me');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ]);
    }
}
```

```php
<?php
// tests/Feature/SupplierApiTest.php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SupplierApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->token = auth('api')->login($this->user);
    }

    public function test_can_list_suppliers()
    {
        Supplier::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/suppliers');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                 ]);
    }

    public function test_can_create_supplier()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/suppliers', [
            'name' => 'New Supplier',
            'code' => 'NEW001',
            'region' => 'North',
            'is_active' => true,
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                 ]);

        $this->assertDatabaseHas('suppliers', [
            'code' => 'NEW001',
        ]);
    }

    public function test_can_update_supplier()
    {
        $supplier = Supplier::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_can_delete_supplier()
    {
        $supplier = Supplier::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->deleteJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(200);
        
        $this->assertSoftDeleted('suppliers', [
            'id' => $supplier->id,
        ]);
    }
}
```

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/AuthenticationTest.php

# Run specific test method
php artisan test --filter test_user_can_login

# Run with coverage
php artisan test --coverage

# Run tests in parallel
php artisan test --parallel
```

---

## Frontend Testing

### Setup

```bash
cd frontend

# Install testing libraries
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest

# Create jest configuration
npx jest --init
```

### Unit Tests

```typescript
// __tests__/services/AuthService.test.ts

import AuthService from '../src/application/services/AuthService';
import apiClient from '../src/infrastructure/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../src/infrastructure/api/apiClient');
jest.mock('@react-native-async-storage/async-storage');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@ledger_token',
        'mock-token'
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on login failure', async () => {
      const mockError = {
        success: false,
        message: 'Invalid credentials',
      };

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(
        AuthService.login({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toEqual(mockError);
    });
  });
});
```

### Component Tests

```typescript
// __tests__/screens/LoginScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../src/presentation/screens/LoginScreen';
import { useAuth } from '../src/presentation/contexts/AuthContext';

jest.mock('../src/presentation/contexts/AuthContext');

describe('LoginScreen', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('calls login on button press', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows alert when fields are empty', () => {
    const { getByText } = render(<LoginScreen />);
    const loginButton = getByText('Login');

    // Mock Alert
    jest.spyOn(require('react-native').Alert, 'alert');

    fireEvent.press(loginButton);

    expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please enter email and password'
    );
  });
});
```

### Running Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Run specific test file
npm test LoginScreen.test.tsx
```

---

## Integration Testing

### End-to-End Test Scenarios

#### Scenario 1: Complete Collection Workflow

```bash
# 1. Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ledger.com","password":"password"}' \
  -o /tmp/login.json

TOKEN=$(cat /tmp/login.json | jq -r '.data.token')

# 2. Create Supplier
curl -X POST http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Supplier",
    "code": "TEST001",
    "region": "Central"
  }' \
  -o /tmp/supplier.json

SUPPLIER_ID=$(cat /tmp/supplier.json | jq -r '.data.id')

# 3. Create Product
curl -X POST http://localhost:8000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tea Leaves",
    "code": "TEA001",
    "base_unit": "kg"
  }' \
  -o /tmp/product.json

PRODUCT_ID=$(cat /tmp/product.json | jq -r '.data.id')

# 4. Create Rate
curl -X POST http://localhost:8000/api/rates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": '$PRODUCT_ID',
    "rate": 150.00,
    "unit": "kg",
    "effective_from": "2025-01-01"
  }'

# 5. Create Collection
curl -X POST http://localhost:8000/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": '$SUPPLIER_ID',
    "product_id": '$PRODUCT_ID',
    "collection_date": "2025-01-15",
    "quantity": 10.5,
    "unit": "kg"
  }' \
  -o /tmp/collection.json

# 6. Create Payment
curl -X POST http://localhost:8000/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": '$SUPPLIER_ID',
    "payment_date": "2025-01-15",
    "amount": 500.00,
    "type": "advance"
  }'

# 7. Check Supplier Balance
curl -X GET "http://localhost:8000/api/suppliers/$SUPPLIER_ID/balance" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test login endpoint
ab -n 1000 -c 10 -T 'application/json' \
  -p /tmp/login_payload.json \
  http://localhost:8000/api/login

# Test protected endpoint
ab -n 1000 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/suppliers
```

### Database Query Optimization

```bash
# Enable query logging in .env
DB_LOG_QUERIES=true

# Check slow queries
php artisan db:show --counts --views

# Analyze specific queries
php artisan tinker
>>> DB::enableQueryLog();
>>> // Run your operations
>>> dd(DB::getQueryLog());
```

---

## Security Testing

### Common Security Checks

```bash
# 1. Test SQL Injection
curl -X GET 'http://localhost:8000/api/suppliers?search=1%27%20OR%20%271%27=%271' \
  -H "Authorization: Bearer $TOKEN"

# 2. Test XSS
curl -X POST http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>",
    "code": "XSS001"
  }'

# 3. Test CSRF (should fail without CSRF token)
curl -X POST http://localhost:8000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","code":"TEST"}'

# 4. Test Rate Limiting
for i in {1..100}; do
  curl -X POST http://localhost:8000/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' &
done
```

### Security Audit Tools

```bash
# PHP Security Checker
composer require --dev enlightn/security-checker
php artisan security-check

# NPM Audit
npm audit

# Dependency Check
composer audit
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
      
      - name: Install Dependencies
        run: cd backend && composer install
      
      - name: Run Tests
        run: cd backend && php artisan test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install Dependencies
        run: cd frontend && npm install
      
      - name: Run Tests
        run: cd frontend && npm test
```

---

## Test Coverage Goals

- **Backend**: Minimum 80% code coverage
- **Frontend**: Minimum 70% code coverage
- **Critical Paths**: 100% coverage (authentication, payments, calculations)

---

**Last Updated:** December 2025
