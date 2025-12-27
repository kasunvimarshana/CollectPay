# TrackVault Testing Guide

## Overview

This document outlines the testing strategy and procedures for the TrackVault application.

## Test Pyramid

```
        /\
       /  \    E2E Tests (10%)
      /____\
     /      \  Integration Tests (30%)
    /________\
   /          \ Unit Tests (60%)
  /__________  \
```

## Backend Testing

### Unit Tests

Unit tests focus on individual components in isolation.

#### Domain Layer Tests

**Entities Tests** (`tests/Unit/Domain/Entities/`):
```php
<?php

namespace Tests\Unit\Domain\Entities;

use PHPUnit\Framework\TestCase;
use TrackVault\Domain\Entities\User;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Email;

class UserTest extends TestCase
{
    public function testUserCreation(): void
    {
        $user = new User(
            UserId::generate(),
            'John Doe',
            new Email('john@example.com'),
            'hashed_password',
            ['admin'],
            ['users:create']
        );

        $this->assertEquals('John Doe', $user->getName());
        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->hasPermission('users:create'));
    }

    public function testUserUpdate(): void
    {
        $user = new User(
            UserId::generate(),
            'John Doe',
            new Email('john@example.com'),
            'hashed_password'
        );

        $updatedUser = $user->updateName('Jane Doe');

        $this->assertEquals('Jane Doe', $updatedUser->getName());
        $this->assertEquals(2, $updatedUser->getVersion());
    }
}
```

**Value Objects Tests** (`tests/Unit/Domain/ValueObjects/`):
```php
<?php

namespace Tests\Unit\Domain\ValueObjects;

use PHPUnit\Framework\TestCase;
use TrackVault\Domain\ValueObjects\Money;

class MoneyTest extends TestCase
{
    public function testMoneyCreation(): void
    {
        $money = new Money(100.50, 'USD');
        $this->assertEquals(100.50, $money->getAmount());
        $this->assertEquals('USD', $money->getCurrency());
    }

    public function testMoneyAddition(): void
    {
        $money1 = new Money(100.00, 'USD');
        $money2 = new Money(50.00, 'USD');
        $result = $money1->add($money2);

        $this->assertEquals(150.00, $result->getAmount());
    }

    public function testMoneyWithDifferentCurrenciesThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        
        $money1 = new Money(100.00, 'USD');
        $money2 = new Money(50.00, 'EUR');
        $money1->add($money2);
    }
}
```

**Services Tests** (`tests/Unit/Domain/Services/`):
```php
<?php

namespace Tests\Unit\Domain\Services;

use PHPUnit\Framework\TestCase;
use TrackVault\Domain\Services\PaymentCalculationService;
use TrackVault\Domain\ValueObjects\Money;

class PaymentCalculationServiceTest extends TestCase
{
    private PaymentCalculationService $service;

    protected function setUp(): void
    {
        $this->service = new PaymentCalculationService();
    }

    public function testCalculateBalance(): void
    {
        $totalOwed = new Money(1000.00, 'USD');
        $totalPaid = new Money(400.00, 'USD');
        
        $balance = $this->service->calculateBalance($totalOwed, $totalPaid);
        
        $this->assertEquals(600.00, $balance->getAmount());
    }
}
```

### Integration Tests

Integration tests verify that components work together correctly.

**Repository Tests** (`tests/Integration/Infrastructure/Persistence/`):
```php
<?php

namespace Tests\Integration\Infrastructure\Persistence;

use PHPUnit\Framework\TestCase;
use TrackVault\Infrastructure\Persistence\MysqlUserRepository;
use TrackVault\Domain\Entities\User;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Email;

class MysqlUserRepositoryTest extends TestCase
{
    private MysqlUserRepository $repository;

    protected function setUp(): void
    {
        // Setup test database connection
        $this->repository = new MysqlUserRepository($testDatabase);
    }

    public function testSaveAndFindUser(): void
    {
        $user = new User(
            UserId::generate(),
            'Test User',
            new Email('test@example.com'),
            'hashed_password'
        );

        $this->repository->save($user);
        $foundUser = $this->repository->findById($user->getId());

        $this->assertNotNull($foundUser);
        $this->assertEquals($user->getName(), $foundUser->getName());
    }
}
```

### API Tests

**Controller Tests** (`tests/Integration/Presentation/`):
```php
<?php

namespace Tests\Integration\Presentation;

use PHPUnit\Framework\TestCase;

class UserControllerTest extends TestCase
{
    public function testCreateUser(): void
    {
        $response = $this->post('/api/users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'roles' => ['collector']
        ]);

        $this->assertEquals(201, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertTrue($data['success']);
        $this->assertArrayHasKey('id', $data['data']);
    }
}
```

### Running Backend Tests

```bash
cd backend

# Run all tests
composer test

# Run specific test suite
./vendor/bin/phpunit tests/Unit
./vendor/bin/phpunit tests/Integration

# Run with coverage
./vendor/bin/phpunit --coverage-html coverage
```

## Frontend Testing

### Unit Tests

**Entity Tests** (`__tests__/domain/entities/`):
```typescript
import { User, Supplier } from '@/domain/entities';

describe('User Entity', () => {
  it('should create user with valid data', () => {
    const user: User = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      roles: ['admin'],
      permissions: [],
      createdAt: '2025-12-27',
      updatedAt: '2025-12-27',
      version: 1
    };

    expect(user.name).toBe('John Doe');
    expect(user.roles).toContain('admin');
  });
});
```

**Service Tests** (`__tests__/application/services/`):
```typescript
import { ValidationService } from '@/application/validation';

describe('ValidationService', () => {
  it('should validate email format', () => {
    expect(ValidationService.isValidEmail('test@example.com')).toBe(true);
    expect(ValidationService.isValidEmail('invalid')).toBe(false);
  });
});
```

### Component Tests

**Screen Tests** (`__tests__/presentation/screens/`):
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '@/presentation/screens/LoginScreen';

describe('LoginScreen', () => {
  it('should render login form', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('should submit login form', () => {
    const mockLogin = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen onLogin={mockLogin} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Login'));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });
});
```

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test LoginScreen.test.tsx
```

## End-to-End Tests

E2E tests verify the complete application workflow.

### Example E2E Test Scenario

**Collection Workflow Test**:

1. Login as collector
2. Navigate to suppliers
3. Select a supplier
4. Navigate to collections
5. Create new collection
6. Verify collection appears in list
7. Navigate to payments
8. Verify balance calculation
9. Record payment
10. Verify updated balance

## Test Data Management

### Backend Test Data

Create test fixtures:

```php
<?php

namespace Tests\Fixtures;

class UserFixtures
{
    public static function validUser(): array
    {
        return [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'roles' => ['collector']
        ];
    }
}
```

### Frontend Test Data

Create mock data:

```typescript
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['admin'],
    permissions: [],
    createdAt: '2025-12-27',
    updatedAt: '2025-12-27',
    version: 1
  }
];
```

## Test Coverage Goals

- **Unit Tests**: > 80% code coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user workflows covered

### Generating Coverage Reports

**Backend**:
```bash
cd backend
./vendor/bin/phpunit --coverage-html coverage
# Open coverage/index.html in browser
```

**Frontend**:
```bash
cd frontend
npm test -- --coverage
# Open coverage/lcov-report/index.html in browser
```

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
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
          php-version: '8.2'
      - name: Install dependencies
        run: cd backend && composer install
      - name: Run tests
        run: cd backend && composer test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json http://localhost:8000/api/auth/login

# Test collections endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer {token}" http://localhost:8000/api/collections
```

### Stress Testing

Use tools like:
- JMeter
- K6
- Locust

## Security Testing

### SQL Injection Testing

Test all endpoints with malicious input:
```bash
curl -X POST http://localhost:8000/api/users \
  -d '{"email":"test@test.com","password":"pass' OR '1'='1"}'
```

### XSS Testing

Test with script injection:
```bash
curl -X POST http://localhost:8000/api/suppliers \
  -d '{"name":"<script>alert(1)</script>","contact_person":"Test"}'
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Arrange-Act-Assert**: Follow AAA pattern
3. **Descriptive Names**: Test names should describe what they test
4. **Mock External Dependencies**: Use mocks for external services
5. **Fast Tests**: Keep tests fast by using in-memory databases
6. **CI Integration**: Run tests on every commit
7. **Coverage Goals**: Maintain minimum 80% coverage
8. **Regression Tests**: Add test for every bug found

## Troubleshooting Tests

### Common Issues

1. **Database Connection**: Ensure test database is available
2. **Port Conflicts**: Stop services using test ports
3. **Stale Data**: Clear test database between runs
4. **Timeout**: Increase timeout for slow tests
5. **Environment**: Check environment variables

### Debug Mode

**Backend**:
```bash
./vendor/bin/phpunit --debug
```

**Frontend**:
```bash
npm test -- --verbose
```

## Test Maintenance

- Review and update tests regularly
- Remove obsolete tests
- Refactor duplicate test code
- Keep test data realistic
- Update tests when requirements change
