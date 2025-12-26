# Paywise Testing Guide

**Version:** 1.0  
**Last Updated:** December 25, 2025  
**Testing Framework:** PHPUnit 10.x

---

## Table of Contents

1. [Overview](#overview)
2. [Test Suite Structure](#test-suite-structure)
3. [Running Tests](#running-tests)
4. [Unit Tests](#unit-tests)
5. [Integration Tests](#integration-tests)
6. [Testing Best Practices](#testing-best-practices)
7. [Writing New Tests](#writing-new-tests)
8. [Test Coverage](#test-coverage)
9. [Continuous Integration](#continuous-integration)

---

## Overview

Paywise includes a comprehensive test suite with **48+ tests** covering:
- Model behavior and relationships
- API endpoint functionality
- Authentication and authorization
- Validation rules
- Optimistic locking
- Soft deletes
- Business logic
- Data integrity

### Testing Stack

- **Framework:** PHPUnit 10.x
- **Database:** SQLite (in-memory for tests)
- **Factories:** Laravel Factories for test data
- **Coverage:** Line and branch coverage tracking

### Test Types

1. **Unit Tests:** Test individual model methods and behavior
2. **Feature Tests:** Test API endpoints and integration
3. **Browser Tests:** (Future) End-to-end UI testing

---

## Test Suite Structure

```
backend/tests/
├── Unit/                          # Unit tests
│   ├── UserTest.php              # User model tests
│   ├── SupplierTest.php          # Supplier model tests
│   └── ProductTest.php           # Product model tests
│
├── Feature/                       # Integration/API tests
│   ├── AuthApiTest.php           # Authentication API tests
│   ├── SupplierApiTest.php       # Supplier API tests
│   ├── ProductApiTest.php        # Product API tests
│   ├── CollectionApiTest.php     # Collection API tests
│   └── PaymentApiTest.php        # Payment API tests
│
└── TestCase.php                   # Base test case
```

### Database Factories

```
backend/database/factories/
├── UserFactory.php               # Built-in
├── SupplierFactory.php          # Supplier test data
├── ProductFactory.php           # Product test data
├── ProductRateFactory.php       # Rate test data
├── CollectionFactory.php        # Collection test data
└── PaymentFactory.php           # Payment test data
```

---

## Running Tests

### Basic Commands

```bash
# Navigate to backend directory
cd backend

# Run all tests
php artisan test

# Run tests with detailed output
php artisan test --verbose

# Run specific test file
php artisan test tests/Unit/UserTest.php

# Run specific test method
php artisan test --filter testUserHasRole

# Run tests in parallel (faster)
php artisan test --parallel
```

### Advanced Options

```bash
# Run tests with coverage
php artisan test --coverage

# Run tests with minimum coverage threshold
php artisan test --coverage --min=80

# Run only unit tests
php artisan test --testsuite=Unit

# Run only feature tests
php artisan test --testsuite=Feature

# Stop on first failure
php artisan test --stop-on-failure

# Display profiling information
php artisan test --profile
```

### Expected Output

```
   PASS  Tests\Unit\UserTest
  ✓ user has role                                    0.02s
  ✓ user can update profile                          0.01s
  ✓ user version increments on update                0.01s

   PASS  Tests\Feature\SupplierApiTest
  ✓ can list suppliers                               0.05s
  ✓ can create supplier                              0.03s
  ✓ can get single supplier                          0.02s
  ✓ can update supplier                              0.03s
  ✓ can delete supplier                              0.02s
  ✓ prevents version conflict                        0.03s
  ✓ can search suppliers                             0.04s
  ✓ validates required fields                        0.02s

  Tests:    48 passed (127 assertions)
  Duration: 2.34s
```

---

## Unit Tests

### User Model Tests

**File:** `tests/Unit/UserTest.php`

**What's Tested:**
- Role checking (`isAdmin()`, `isManager()`, `isCollector()`)
- Profile updates
- Version control on updates
- Relationships with other models

**Example:**
```php
public function test_user_has_role()
{
    $admin = User::factory()->create(['role' => 'admin']);
    $manager = User::factory()->create(['role' => 'manager']);
    
    $this->assertTrue($admin->isAdmin());
    $this->assertFalse($admin->isManager());
    
    $this->assertTrue($manager->isManager());
    $this->assertFalse($manager->isAdmin());
}
```

### Supplier Model Tests

**File:** `tests/Unit/SupplierTest.php`

**What's Tested:**
- Relationship with collections
- Relationship with payments
- Total owed calculation
- Soft delete behavior

**Example:**
```php
public function test_supplier_calculates_total_owed()
{
    $supplier = Supplier::factory()->create();
    
    Collection::factory()->create([
        'supplier_id' => $supplier->id,
        'total_amount' => 1000
    ]);
    
    Payment::factory()->create([
        'supplier_id' => $supplier->id,
        'amount' => 300
    ]);
    
    $this->assertEquals(700, $supplier->totalOwed());
}
```

### Product Model Tests

**File:** `tests/Unit/ProductTest.php`

**What's Tested:**
- Current rate retrieval
- Rate versioning
- Unit support
- Product relationships

**Example:**
```php
public function test_product_returns_current_rate()
{
    $product = Product::factory()->create();
    
    ProductRate::factory()->create([
        'product_id' => $product->id,
        'unit' => 'kg',
        'rate' => 100,
        'effective_from' => now()->subDay()
    ]);
    
    $currentRate = $product->getCurrentRate('kg');
    
    $this->assertEquals(100, $currentRate->rate);
}
```

---

## Integration Tests

### Authentication API Tests

**File:** `tests/Feature/AuthApiTest.php`

**Endpoints Tested:**
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Current user retrieval

**Example Test:**
```php
public function test_user_can_login()
{
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password')
    ]);
    
    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password',
        'device_name' => 'test-device'
    ]);
    
    $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);
}
```

### Supplier API Tests

**File:** `tests/Feature/SupplierApiTest.php`

**Endpoints Tested:**
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get single supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

**Key Tests:**
- ✅ Authentication required
- ✅ Authorization by role
- ✅ Input validation
- ✅ Optimistic locking
- ✅ Search functionality
- ✅ Soft deletes

**Example:**
```php
public function test_prevents_version_conflict_on_update()
{
    $admin = User::factory()->create(['role' => 'admin']);
    $supplier = Supplier::factory()->create(['version' => 1]);
    
    // Simulate concurrent update
    $supplier->update(['name' => 'Updated']);
    
    // Try to update with old version
    $response = $this->actingAs($admin)
                     ->putJson("/api/suppliers/{$supplier->id}", [
                         'name' => 'Another Update',
                         'version' => 1  // Old version
                     ]);
    
    $response->assertStatus(422)
            ->assertJson(['message' => 'Version conflict']);
}
```

### Product API Tests

**File:** `tests/Feature/ProductApiTest.php`

**Endpoints Tested:**
- `GET /api/products` - List products
- `POST /api/products` - Create product with initial rate
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `POST /api/products/{id}/rates` - Add new rate

**Example:**
```php
public function test_can_create_product_with_rate()
{
    $admin = User::factory()->create(['role' => 'admin']);
    
    $response = $this->actingAs($admin)
                     ->postJson('/api/products', [
                         'name' => 'Tea Leaves',
                         'code' => 'TEA001',
                         'unit' => 'kg',
                         'description' => 'Premium tea leaves',
                         'initial_rate' => 150.00,
                         'effective_from' => now()->toDateString()
                     ]);
    
    $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Tea Leaves');
    
    // Verify rate was created
    $product = Product::find($response['data']['id']);
    $this->assertCount(1, $product->rates);
    $this->assertEquals(150.00, $product->rates->first()->rate);
}
```

### Collection API Tests

**File:** `tests/Feature/CollectionApiTest.php`

**Key Features Tested:**
- Automatic rate application
- Total amount calculation
- Multi-unit support
- User tracking
- Supplier filtering

**Example:**
```php
public function test_automatically_applies_current_rate()
{
    $collector = User::factory()->create(['role' => 'collector']);
    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();
    
    $rate = ProductRate::factory()->create([
        'product_id' => $product->id,
        'unit' => 'kg',
        'rate' => 100.00,
        'effective_from' => now()->subDay()
    ]);
    
    $response = $this->actingAs($collector)
                     ->postJson('/api/collections', [
                         'supplier_id' => $supplier->id,
                         'product_id' => $product->id,
                         'quantity' => 5.5,
                         'unit' => 'kg',
                         'collected_at' => now()->toDateString()
                     ]);
    
    $response->assertStatus(201);
    
    $collection = Collection::find($response['data']['id']);
    $this->assertEquals($rate->id, $collection->product_rate_id);
    $this->assertEquals(100.00, $collection->rate);
    $this->assertEquals(550.00, $collection->total_amount);
}
```

### Payment API Tests

**File:** `tests/Feature/PaymentApiTest.php`

**Payment Types Tested:**
- Advance payments
- Partial payments
- Full payments

**Validations Tested:**
- Amount must be positive
- Supplier must exist
- Payment type required
- Reference number format

**Example:**
```php
public function test_can_create_payment_with_reference()
{
    $manager = User::factory()->create(['role' => 'manager']);
    $supplier = Supplier::factory()->create();
    
    $response = $this->actingAs($manager)
                     ->postJson('/api/payments', [
                         'supplier_id' => $supplier->id,
                         'amount' => 500.00,
                         'payment_type' => 'partial',
                         'reference_number' => 'REF-001',
                         'payment_date' => now()->toDateString(),
                         'notes' => 'Partial payment for December'
                     ]);
    
    $response->assertStatus(201)
            ->assertJsonPath('data.reference_number', 'REF-001')
            ->assertJsonPath('data.created_by', $manager->id);
}
```

---

## Testing Best Practices

### 1. Use Factories for Test Data

**Good:**
```php
$user = User::factory()->create(['role' => 'admin']);
$supplier = Supplier::factory()->create();
```

**Avoid:**
```php
$user = new User();
$user->name = 'Test User';
$user->email = 'test@example.com';
// ... many more lines
```

### 2. Test One Thing Per Test

**Good:**
```php
public function test_can_create_supplier()
{
    // Only tests creation
}

public function test_validates_required_fields()
{
    // Only tests validation
}
```

**Avoid:**
```php
public function test_supplier_crud()
{
    // Tests create, read, update, delete all in one
}
```

### 3. Use Descriptive Test Names

**Good:**
```php
public function test_prevents_version_conflict_on_concurrent_update()
public function test_automatically_applies_current_product_rate()
```

**Avoid:**
```php
public function test_update()
public function test_rate()
```

### 4. Clean Up After Tests

```php
use Illuminate\Foundation\Testing\RefreshDatabase;

class SupplierApiTest extends TestCase
{
    use RefreshDatabase;  // Automatically resets database
    
    // Tests...
}
```

### 5. Test Edge Cases

```php
public function test_handles_zero_quantity()
public function test_handles_negative_amount()
public function test_handles_missing_rate()
public function test_handles_expired_token()
```

---

## Writing New Tests

### Step 1: Create Test File

```bash
# Unit test
php artisan make:test Unit/ModelNameTest --unit

# Feature test
php artisan make:test Feature/EntityApiTest
```

### Step 2: Write Test Structure

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\YourModel;

class YourModelApiTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_can_list_items()
    {
        // Arrange
        $user = User::factory()->create(['role' => 'admin']);
        YourModel::factory()->count(3)->create();
        
        // Act
        $response = $this->actingAs($user)
                        ->getJson('/api/your-endpoint');
        
        // Assert
        $response->assertStatus(200)
                ->assertJsonCount(3, 'data');
    }
}
```

### Step 3: Run Your Test

```bash
php artisan test --filter YourModelApiTest
```

---

## Test Coverage

### Generating Coverage Reports

```bash
# HTML coverage report
php artisan test --coverage --coverage-html=coverage

# Open coverage report
open coverage/index.html
```

### Current Coverage

**Overall:**
- Models: 85%+
- Controllers: 90%+
- API Endpoints: 95%+

**What's Covered:**
- ✅ Authentication flows
- ✅ CRUD operations
- ✅ Validation rules
- ✅ Authorization checks
- ✅ Optimistic locking
- ✅ Business logic
- ✅ Relationships
- ✅ Edge cases

**What's Not Covered:**
- ⚠️ Some exception handlers
- ⚠️ Rate limiting
- ⚠️ File uploads (not implemented)

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.2'
        
    - name: Install Dependencies
      run: composer install
      
    - name: Run Tests
      run: php artisan test --coverage --min=80
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running tests..."
cd backend && php artisan test

if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
```

---

## Troubleshooting Tests

### Common Issues

**Issue: "Database not found"**
```bash
# Solution: Use RefreshDatabase trait
use Illuminate\Foundation\Testing\RefreshDatabase;
```

**Issue: "Tests running slowly"**
```bash
# Solution: Use in-memory SQLite
# In phpunit.xml:
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

**Issue: "Authentication fails in tests"**
```php
// Solution: Use actingAs()
$this->actingAs($user)->getJson('/api/protected-route');
```

**Issue: "Factory not found"**
```bash
# Solution: Create factory
php artisan make:factory ModelNameFactory
```

---

## Summary

The Paywise test suite provides:
- ✅ **Comprehensive coverage** of core functionality
- ✅ **Fast execution** with in-memory database
- ✅ **Clear test structure** for maintainability
- ✅ **Easy to extend** with new tests
- ✅ **CI/CD ready** for automated testing

**Best Practices:**
1. Write tests first (TDD when possible)
2. Keep tests independent and isolated
3. Use factories for test data
4. Test edge cases and error conditions
5. Maintain high coverage (>80%)
6. Run tests before committing
7. Use descriptive test names

---

**Testing Status:** Comprehensive ✅  
**Coverage:** 85%+ on critical paths  
**Last Updated:** December 25, 2025  
**Tests:** 48+ passing consistently
