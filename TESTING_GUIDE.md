# TrackVault - Testing Guide

## Overview

This document provides comprehensive testing procedures for TrackVault to ensure the application meets all requirements and functions correctly.

## Manual Testing Checklist

### Backend API Testing

#### 1. Health Check
```bash
curl http://localhost:8000/api/health
```
Expected: `{"status":"ok","timestamp":"...","version":"1.0.0"}`

#### 2. User Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "roles": ["admin"]
  }'
```
Expected: Success response with user data

#### 3. User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```
Expected: Success response with JWT token and user data
Save the token for subsequent requests.

#### 4. Supplier CRUD Operations

**Create Supplier:**
```bash
curl -X POST http://localhost:8000/api/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Tea Supplier Ltd",
    "contact_person": "John Doe",
    "phone": "+1234567890",
    "email": "supplier@example.com",
    "address": "123 Tea Lane, City, Country",
    "bank_account": "1234567890",
    "tax_id": "TAX123"
  }'
```

**List Suppliers:**
```bash
curl http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Supplier:**
```bash
curl http://localhost:8000/api/suppliers/{SUPPLIER_ID} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Supplier:**
```bash
curl -X PUT http://localhost:8000/api/suppliers/{SUPPLIER_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Updated Supplier Name"
  }'
```

**Delete Supplier:**
```bash
curl -X DELETE http://localhost:8000/api/suppliers/{SUPPLIER_ID} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Product CRUD Operations

**Create Product:**
```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Green Tea Leaves",
    "description": "Premium quality green tea leaves",
    "unit": "kg",
    "rates": [
      {
        "amount": 5.50,
        "currency": "USD",
        "effectiveFrom": "2025-01-01",
        "effectiveTo": null
      }
    ]
  }'
```

**List Products:**
```bash
curl http://localhost:8000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 6. Collection CRUD Operations

**Create Collection:**
```bash
curl -X POST http://localhost:8000/api/collections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "supplier_id": "{SUPPLIER_ID}",
    "product_id": "{PRODUCT_ID}",
    "collector_id": "{USER_ID}",
    "quantity": 100.5,
    "unit": "kg",
    "rate": 5.50,
    "currency": "USD",
    "collection_date": "2025-12-27"
  }'
```

**List Collections:**
```bash
curl http://localhost:8000/api/collections \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Collections by Supplier:**
```bash
curl http://localhost:8000/api/collections/supplier/{SUPPLIER_ID} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 7. Payment CRUD Operations

**Create Payment:**
```bash
curl -X POST http://localhost:8000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "supplier_id": "{SUPPLIER_ID}",
    "processed_by": "{USER_ID}",
    "amount": 250.00,
    "currency": "USD",
    "type": "advance",
    "payment_method": "bank_transfer",
    "reference": "TXN123456",
    "payment_date": "2025-12-27"
  }'
```

**List Payments:**
```bash
curl http://localhost:8000/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Payments by Supplier:**
```bash
curl http://localhost:8000/api/payments/supplier/{SUPPLIER_ID} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Mobile App Testing

#### 1. Login Flow
1. Launch the app
2. Enter email: `test@example.com`
3. Enter password: `SecurePassword123!`
4. Tap Login
5. Verify successful login and navigation to Home screen

#### 2. Home Screen
1. Verify user name and email are displayed
2. Verify all menu items are visible: Suppliers, Products, Collections, Payments
3. Test navigation to each section

#### 3. Suppliers Management
1. Navigate to Suppliers
2. Verify list of suppliers loads
3. Tap "+" to create new supplier
4. Fill in all required fields
5. Tap "Create Supplier"
6. Verify success message
7. Verify supplier appears in list
8. Tap on supplier to view/edit
9. Update supplier details
10. Verify update success

#### 4. Products Management
1. Navigate to Products
2. Verify list loads
3. Create new product
4. Verify product appears in list

#### 5. Collections Management
1. Navigate to Collections
2. Verify list loads
3. Test collection creation (when implemented)

#### 6. Payments Management
1. Navigate to Payments
2. Verify list loads
3. Test payment creation (when implemented)

#### 7. Logout
1. Return to Home screen
2. Tap Logout
3. Verify return to Login screen
4. Verify token is cleared (cannot access protected routes)

### Data Integrity Tests

#### Multi-Unit Support
1. Create products with different units (kg, g, liters, ml)
2. Create collections with various quantities and units
3. Verify calculations are correct

#### Versioned Rates
1. Create product with initial rate
2. Add new rate with different effective date
3. Create collections before and after rate change
4. Verify correct rate is applied to each collection

#### Payment Calculations
1. Create multiple collections for a supplier
2. Create partial payments
3. Verify total owed = sum(collections) - sum(payments)

#### Multi-User Concurrency
1. Login from two different devices/browsers
2. Create/update same entities simultaneously
3. Verify version conflicts are handled (if optimistic locking is enforced)
4. Verify no data loss or corruption

### Security Tests

#### Authentication
1. Attempt to access protected endpoints without token
   - Expected: 401 Unauthorized
2. Use expired token
   - Expected: 401 Unauthorized
3. Use invalid token
   - Expected: 401 Unauthorized

#### Authorization
1. Create user with limited roles
2. Attempt to access admin-only functions
   - Expected: 403 Forbidden (when RBAC is enforced)

#### Input Validation
1. Submit empty required fields
   - Expected: Validation error
2. Submit invalid email format
   - Expected: Validation error
3. Submit negative quantities
   - Expected: Validation error
4. Submit SQL injection attempts
   - Expected: Safely handled by prepared statements
5. Submit XSS attempts
   - Expected: Safely escaped

#### Data Encryption
1. Check database for sensitive data
   - Passwords should be hashed
   - Sensitive fields should be encrypted (if configured)

### Performance Tests

#### API Response Times
1. Measure response times for:
   - Health check: < 50ms
   - Login: < 200ms
   - List operations: < 500ms
   - Create operations: < 300ms
   - Update operations: < 300ms

#### Load Testing
1. Simulate 10 concurrent users
2. Perform CRUD operations
3. Verify no errors or timeouts
4. Check server resource usage

### Audit Trail Tests

#### Audit Logging
1. Perform various operations (create, update, delete)
2. Check audit_logs table
3. Verify all operations are logged with:
   - User ID
   - Entity type and ID
   - Action performed
   - Changes made
   - Timestamp
   - IP address and user agent

## Automated Testing (Future)

### Backend Unit Tests
```bash
cd backend
vendor/bin/phpunit tests/Unit
```

### Backend Integration Tests
```bash
cd backend
vendor/bin/phpunit tests/Integration
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Test Coverage Goals

- Backend: 80% code coverage
- Frontend: 70% code coverage
- Critical paths: 100% coverage

## Bug Reporting

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment (OS, PHP version, Node version, etc.)
5. Screenshots/logs if applicable

## Test Results Documentation

Document test results in a spreadsheet or test management tool:
- Test case ID
- Description
- Status (Pass/Fail)
- Notes
- Date tested
- Tester name

## Sign-Off

After completing all tests:
1. Review test results
2. Document any issues
3. Verify all critical issues are resolved
4. Obtain stakeholder approval for production deployment
