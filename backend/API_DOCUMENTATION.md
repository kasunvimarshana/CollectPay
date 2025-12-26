# PayMaster API Documentation

## Base URL
```
Development: http://localhost:8000/api
Production: https://api.paymaster.com/api
```

## Authentication

All authenticated endpoints require an authentication token in the header:
```
Authorization: Bearer {token}
```

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "..."
  },
  "message": "User registered successfully"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "..."
  },
  "message": "Login successful"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["collector"],
    ...
  }
}
```

## Users

### List Users
```http
GET /users?page=1&per_page=20&search=john
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["collector"],
      "is_active": true,
      ...
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

### Get User
```http
GET /users/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

### Create User (Admin only)
```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "roles": ["collector"],
  "permissions": []
}

Response: 201 Created
{
  "success": true,
  "data": { ... },
  "message": "User created successfully"
}
```

### Update User
```http
PUT /users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "version": 1
}

Response: 200 OK
{
  "success": true,
  "data": { ... },
  "message": "User updated successfully"
}
```

### Delete User (Admin only)
```http
DELETE /users/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Suppliers

### List Suppliers
```http
GET /suppliers?page=1&region=Central&is_active=true
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Supplier A",
      "code": "SUP001",
      "phone": "+94771234567",
      "region": "Central",
      "is_active": true,
      ...
    }
  ],
  "meta": { ... }
}
```

### Get Supplier
```http
GET /suppliers/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

### Create Supplier
```http
POST /suppliers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Supplier",
  "code": "SUP005",
  "phone": "+94771111111",
  "address": "123 Street",
  "region": "Central",
  "notes": "Important supplier"
}

Response: 201 Created
{
  "success": true,
  "data": { ... },
  "message": "Supplier created successfully"
}
```

### Update Supplier
```http
PUT /suppliers/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Supplier",
  "phone": "+94772222222",
  "version": 1
}

Response: 200 OK
{
  "success": true,
  "data": { ... },
  "message": "Supplier updated successfully"
}
```

### Get Supplier Balance
```http
GET /suppliers/{id}/balance?up_to_date=2025-12-31
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "supplier_id": 1,
    "total_collected": 5000.00,
    "total_paid": 3000.00,
    "balance": 2000.00,
    "calculated_at": "2025-12-23 10:00:00"
  }
}
```

## Products

### List Products
```http
GET /products?is_active=true
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tea Leaves",
      "code": "PROD001",
      "unit": "kg",
      "is_active": true,
      "current_rate": {
        "rate": 55.00,
        "effective_from": "2025-02-01"
      },
      ...
    }
  ]
}
```

### Create Product
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Coffee Beans",
  "code": "PROD004",
  "unit": "kg",
  "description": "Premium coffee beans"
}

Response: 201 Created
```

### Update Product
```http
PUT /products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Product",
  "unit": "kg",
  "version": 1
}
```

## Product Rates

### Get Product Rates
```http
GET /products/{id}/rates
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "rate": 55.00,
      "effective_from": "2025-02-01",
      "effective_to": null,
      "is_active": true,
      ...
    }
  ]
}
```

### Get Current Rate
```http
GET /products/{id}/rates/current
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 2,
    "rate": 55.00,
    "effective_from": "2025-02-01",
    "is_active": true
  }
}
```

### Create New Rate (Admin/Manager only)
```http
POST /products/{id}/rates
Authorization: Bearer {token}
Content-Type: application/json

{
  "rate": 60.00,
  "effective_from": "2025-03-01"
}

Response: 201 Created
{
  "success": true,
  "data": { ... },
  "message": "Rate created successfully. Previous rates have been deactivated."
}
```

## Collections

### List Collections
```http
GET /collections?supplier_id=1&from_date=2025-02-01&to_date=2025-02-28
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "supplier_id": 1,
      "supplier_name": "Supplier A",
      "product_id": 1,
      "product_name": "Tea Leaves",
      "quantity": 25.500,
      "rate": 55.00,
      "amount": 1402.50,
      "collection_date": "2025-02-15",
      "collected_by": 3,
      "collector_name": "Collector User",
      "notes": "Morning collection",
      ...
    }
  ]
}
```

### Create Collection
```http
POST /collections
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplier_id": 1,
  "product_id": 1,
  "quantity": 30.5,
  "collection_date": "2025-02-20",
  "notes": "Evening collection"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 5,
    "quantity": 30.5,
    "rate": 55.00,
    "amount": 1677.50,
    "sync_id": "coll_...",
    ...
  },
  "message": "Collection created successfully"
}
```

### Batch Sync Collections (Offline sync)
```http
POST /collections/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "collections": [
    {
      "sync_id": "coll_offline_1",
      "supplier_id": 1,
      "product_id": 1,
      "quantity": 20.0,
      "collection_date": "2025-02-21",
      "version": 1
    },
    {
      "sync_id": "coll_offline_2",
      "supplier_id": 2,
      "product_id": 1,
      "quantity": 15.5,
      "collection_date": "2025-02-21",
      "version": 1
    }
  ]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "synced": 2,
    "conflicts": 0,
    "errors": 0,
    "results": [
      {
        "sync_id": "coll_offline_1",
        "status": "synced",
        "id": 10
      },
      {
        "sync_id": "coll_offline_2",
        "status": "synced",
        "id": 11
      }
    ]
  },
  "message": "Sync completed successfully"
}
```

## Payments

### List Payments
```http
GET /payments?supplier_id=1&type=advance
Authorization: Bearer {token}

Response: 200 OK
```

### Create Payment
```http
POST /payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplier_id": 1,
  "amount": 1500.00,
  "type": "partial",
  "payment_date": "2025-02-25",
  "notes": "Partial payment for February"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 5,
    "amount": 1500.00,
    "type": "partial",
    "reference": "PAY-20250225-XYZ123",
    ...
  },
  "message": "Payment created successfully"
}
```

### Batch Sync Payments
```http
POST /payments/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "payments": [
    {
      "sync_id": "pay_offline_1",
      "supplier_id": 1,
      "amount": 1000.00,
      "type": "advance",
      "payment_date": "2025-02-26",
      "version": 1
    }
  ]
}
```

## Reports

### Get Supplier Balance
```http
GET /reports/supplier-balance/{id}
Authorization: Bearer {token}

Response: 200 OK
```

### Get Supplier Summary
```http
GET /reports/supplier-summary/{id}?from_date=2025-02-01&to_date=2025-02-28
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "supplier": { ... },
    "collections": [
      {
        "date": "2025-02-15",
        "quantity": 25.5,
        "amount": 1402.50
      }
    ],
    "payments": [
      {
        "date": "2025-02-10",
        "amount": 1000.00,
        "type": "advance"
      }
    ],
    "summary": {
      "total_collected": 3066.25,
      "total_paid": 1000.00,
      "balance": 2066.25
    }
  }
}
```

### Get Period Summary
```http
GET /reports/period-summary?from_date=2025-02-01&to_date=2025-02-28
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-02-01",
      "to": "2025-02-28"
    },
    "suppliers": [
      {
        "id": 1,
        "name": "Supplier A",
        "total_collected": 3066.25,
        "total_paid": 1000.00,
        "balance": 2066.25
      }
    ],
    "totals": {
      "total_collected": 5035.00,
      "total_paid": 1900.00,
      "total_balance": 3135.00
    }
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": ["Validation error message"]
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Version conflict detected
- `SERVER_ERROR`: Internal server error

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse:
- Default: 60 requests per minute per user
- Auth endpoints: 5 requests per minute per IP

Headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1234567890
```

## Pagination

List endpoints support pagination:

Query Parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

Response Meta:
```json
{
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

## Filtering & Searching

Common filter parameters:
- `search`: Search by name/code
- `is_active`: Filter by status
- `from_date`: Date range start
- `to_date`: Date range end
- `region`: Filter by region

Example:
```
GET /suppliers?search=supplier&region=Central&is_active=true
```

## Versioning

All mutable resources include a `version` field for optimistic locking:

```json
{
  "id": 1,
  "name": "Updated Name",
  "version": 2
}
```

When updating, include the current version:
```json
PUT /suppliers/1
{
  "name": "New Name",
  "version": 2
}
```

If version mismatch (409 Conflict):
```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Resource has been modified by another user",
    "current_version": 3
  }
}
```
