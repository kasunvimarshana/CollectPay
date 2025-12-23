# FieldPay API Documentation

## Base URL
```
Production: https://api.fieldpay.com/api
Development: http://localhost:8000/api
```

## Authentication

All protected endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone_number": "+1234567890"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "is_active": true
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": [
      {
        "id": 1,
        "name": "Collector",
        "slug": "collector"
      }
    ]
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Get Current User
```http
GET /auth/me
```

**Response: 200 OK**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": [...],
    "permissions": [...]
  }
}
```

### Logout
```http
POST /auth/logout
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Response: 200 OK**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

## Suppliers

### List Suppliers
```http
GET /suppliers
```

**Query Parameters:**
- `page` (integer): Page number for pagination
- `per_page` (integer): Items per page (default: 15, max: 100)
- `search` (string): Search by name, email, or phone
- `is_active` (boolean): Filter by active status
- `since` (datetime): Get records updated since timestamp (for sync)

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Suppliers Ltd",
      "email": "contact@acme.com",
      "phone_number": "+1234567890",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, New York, NY",
      "is_active": true,
      "balance": 15000.00,
      "total_owed": 25000.00,
      "total_paid": 10000.00,
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-15T14:30:00Z",
      "synced_at": "2025-01-15T14:35:00Z",
      "version": 3
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 50,
    "last_page": 4
  }
}
```

### Get Supplier
```http
GET /suppliers/{id}
```

**Response: 200 OK**
```json
{
  "data": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Suppliers Ltd",
    "email": "contact@acme.com",
    "phone_number": "+1234567890",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY",
    "metadata": {
      "tax_id": "12-3456789",
      "business_type": "Corporation"
    },
    "is_active": true,
    "balance": 15000.00,
    "recent_collections": [...],
    "recent_payments": [...],
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

### Create Supplier
```http
POST /suppliers
```

**Request Body:**
```json
{
  "name": "Acme Suppliers Ltd",
  "email": "contact@acme.com",
  "phone_number": "+1234567890",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main St, New York, NY",
  "metadata": {
    "tax_id": "12-3456789"
  },
  "device_id": "device-uuid-here"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {...}
}
```

### Update Supplier
```http
PUT /suppliers/{id}
PATCH /suppliers/{id}
```

**Request Body:**
```json
{
  "name": "Acme Suppliers Ltd (Updated)",
  "phone_number": "+1234567891",
  "version": 3
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Supplier updated successfully",
  "data": {...}
}
```

**Conflict Response: 409 Conflict**
```json
{
  "success": false,
  "message": "Version conflict detected",
  "server_version": 5,
  "client_version": 3,
  "server_data": {...},
  "conflict_id": "conflict-uuid"
}
```

### Delete Supplier
```http
DELETE /suppliers/{id}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

### Get Supplier Balance
```http
GET /suppliers/{id}/balance
```

**Response: 200 OK**
```json
{
  "data": {
    "supplier_id": 1,
    "total_owed": 25000.00,
    "total_paid": 10000.00,
    "balance": 15000.00,
    "last_collection": "2025-01-15T10:00:00Z",
    "last_payment": "2025-01-10T14:30:00Z"
  }
}
```

## Products

### List Products
```http
GET /products
```

**Query Parameters:**
- `page`, `per_page`, `search`, `is_active`, `since` (same as suppliers)
- `category` (string): Filter by category

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Raw Milk",
      "code": "MILK-001",
      "description": "Fresh cow milk",
      "category": "Dairy",
      "units": ["liter", "gallon"],
      "default_unit": "liter",
      "is_active": true,
      "current_rate": {
        "liter": 1.50,
        "gallon": 5.50
      },
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-15T14:30:00Z"
    }
  ],
  "meta": {...}
}
```

### Get Product
```http
GET /products/{id}
```

### Create Product
```http
POST /products
```

**Request Body:**
```json
{
  "name": "Raw Milk",
  "code": "MILK-001",
  "description": "Fresh cow milk",
  "category": "Dairy",
  "units": ["liter", "gallon"],
  "default_unit": "liter",
  "device_id": "device-uuid-here"
}
```

### Update Product
```http
PUT /products/{id}
```

### Delete Product
```http
DELETE /products/{id}
```

## Product Rates

### List Product Rates
```http
GET /product-rates
```

### Get Product Rates
```http
GET /products/{product_id}/rates
```

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440002",
      "product_id": 1,
      "unit": "liter",
      "rate": 1.50,
      "valid_from": "2025-01-01T00:00:00Z",
      "valid_to": null,
      "version": 3,
      "is_active": true,
      "created_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

### Get Active Rate
```http
GET /products/{product_id}/active-rate?unit=liter&timestamp=2025-01-15T10:00:00Z
```

**Response: 200 OK**
```json
{
  "data": {
    "id": 1,
    "product_id": 1,
    "unit": "liter",
    "rate": 1.50,
    "valid_from": "2025-01-01T00:00:00Z",
    "valid_to": null,
    "version": 3
  }
}
```

### Create Product Rate
```http
POST /product-rates
```

**Request Body:**
```json
{
  "product_id": 1,
  "unit": "liter",
  "rate": 1.75,
  "valid_from": "2025-02-01T00:00:00Z",
  "min_quantity": null,
  "max_quantity": null,
  "device_id": "device-uuid-here"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "message": "Rate created successfully",
  "data": {
    "id": 2,
    "version": 4,
    "previous_rate": {
      "id": 1,
      "valid_to": "2025-02-01T00:00:00Z"
    },
    ...
  }
}
```

## Collections

### List Collections
```http
GET /collections
```

**Query Parameters:**
- `supplier_id` (integer): Filter by supplier
- `collector_id` (integer): Filter by collector
- `status` (string): pending, confirmed, cancelled
- `from_date`, `to_date` (datetime): Date range filter

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440003",
      "collection_number": "COL-20250115-00001",
      "supplier": {
        "id": 1,
        "name": "Acme Suppliers Ltd"
      },
      "collector": {
        "id": 2,
        "name": "Field Worker 1"
      },
      "collected_at": "2025-01-15T10:00:00Z",
      "status": "confirmed",
      "total_amount": 1500.00,
      "items_count": 3,
      "notes": "Morning collection",
      "created_at": "2025-01-15T10:05:00Z",
      "synced_at": "2025-01-15T10:10:00Z"
    }
  ],
  "meta": {...}
}
```

### Get Collection
```http
GET /collections/{id}
```

**Response: 200 OK**
```json
{
  "data": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440003",
    "collection_number": "COL-20250115-00001",
    "supplier": {...},
    "collector": {...},
    "collected_at": "2025-01-15T10:00:00Z",
    "status": "confirmed",
    "total_amount": 1500.00,
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Raw Milk"
        },
        "quantity": 100.00,
        "unit": "liter",
        "rate": 1.50,
        "amount": 150.00,
        "product_rate": {
          "id": 1,
          "version": 3
        }
      }
    ],
    "notes": "Morning collection",
    "created_at": "2025-01-15T10:05:00Z"
  }
}
```

### Create Collection
```http
POST /collections
```

**Request Body:**
```json
{
  "supplier_id": 1,
  "collected_at": "2025-01-15T10:00:00Z",
  "notes": "Morning collection",
  "items": [
    {
      "product_id": 1,
      "quantity": 100.00,
      "unit": "liter",
      "rate": 1.50,
      "notes": "Grade A"
    },
    {
      "product_id": 2,
      "quantity": 50.00,
      "unit": "kg"
    }
  ],
  "device_id": "device-uuid-here",
  "client_created_at": "2025-01-15T10:00:00Z"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "message": "Collection created successfully",
  "data": {...}
}
```

### Confirm Collection
```http
POST /collections/{id}/confirm
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Collection confirmed",
  "data": {
    "status": "confirmed",
    "transaction_created": true,
    "new_balance": 16500.00
  }
}
```

### Cancel Collection
```http
POST /collections/{id}/cancel
```

## Payments

### List Payments
```http
GET /payments
```

### Get Payment
```http
GET /payments/{id}
```

### Create Payment
```http
POST /payments
```

**Request Body:**
```json
{
  "supplier_id": 1,
  "collection_id": null,
  "type": "partial",
  "amount": 5000.00,
  "payment_date": "2025-01-15T14:00:00Z",
  "payment_method": "bank_transfer",
  "reference_number": "TXN123456",
  "notes": "Partial payment",
  "device_id": "device-uuid-here"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {...}
}
```

### Confirm Payment
```http
POST /payments/{id}/confirm
```

### Get Supplier Transactions
```http
GET /suppliers/{supplier_id}/transactions
```

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": 1,
      "type": "debit",
      "amount": 1500.00,
      "balance": 1500.00,
      "transaction_date": "2025-01-15T10:00:00Z",
      "description": "Collection #COL-20250115-00001",
      "collection": {...},
      "payment": null
    },
    {
      "id": 2,
      "type": "credit",
      "amount": 5000.00,
      "balance": -3500.00,
      "transaction_date": "2025-01-15T14:00:00Z",
      "description": "Payment #PAY-20250115-00001",
      "collection": null,
      "payment": {...}
    }
  ],
  "meta": {...}
}
```

## Sync

### Push Changes
```http
POST /sync/push
```

**Request Body:**
```json
{
  "device_id": "device-uuid-here",
  "last_sync_at": "2025-01-15T10:00:00Z",
  "changes": [
    {
      "entity_type": "suppliers",
      "entity_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "action": "update",
      "version": 3,
      "data": {...},
      "client_timestamp": "2025-01-15T10:05:00Z"
    },
    {
      "entity_type": "collections",
      "entity_uuid": "550e8400-e29b-41d4-a716-446655440003",
      "action": "create",
      "data": {...},
      "client_timestamp": "2025-01-15T10:10:00Z"
    }
  ]
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "results": [
    {
      "entity_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "status": "success",
      "server_id": 1,
      "server_version": 4
    },
    {
      "entity_uuid": "550e8400-e29b-41d4-a716-446655440003",
      "status": "conflict",
      "conflict_id": "conflict-uuid",
      "server_version": 5,
      "client_version": 3,
      "server_data": {...}
    }
  ]
}
```

### Pull Changes
```http
GET /sync/pull?device_id=device-uuid&since=2025-01-15T10:00:00Z
```

**Response: 200 OK**
```json
{
  "success": true,
  "timestamp": "2025-01-15T15:00:00Z",
  "changes": {
    "suppliers": [
      {
        "id": 1,
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "action": "update",
        "version": 5,
        "data": {...},
        "updated_at": "2025-01-15T14:30:00Z"
      }
    ],
    "products": [...],
    "collections": [...],
    "payments": [...],
    "product_rates": [...],
    "deleted": [
      {
        "entity_type": "suppliers",
        "entity_id": 2,
        "entity_uuid": "550e8400-e29b-41d4-a716-446655440010",
        "deleted_at": "2025-01-15T12:00:00Z"
      }
    ]
  }
}
```

### Get Sync Status
```http
GET /sync/status?device_id=device-uuid
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "device_id": "device-uuid",
    "last_sync_at": "2025-01-15T10:00:00Z",
    "pending_changes": 5,
    "conflicts": 1,
    "last_push_at": "2025-01-15T14:00:00Z",
    "last_pull_at": "2025-01-15T14:00:00Z"
  }
}
```

### Resolve Conflict
```http
POST /sync/resolve-conflict
```

**Request Body:**
```json
{
  "conflict_id": "conflict-uuid",
  "resolution_strategy": "accept_server",
  "resolved_data": {...}
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Conflict resolved",
  "data": {...}
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email must be a valid email address."]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Version conflict detected",
  "conflict_id": "conflict-uuid",
  "server_version": 5,
  "client_version": 3,
  "server_data": {...}
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "message": "The given data was invalid",
  "errors": {...}
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred while processing your request"
}
```

## Rate Limiting

- **Default**: 60 requests per minute per IP
- **Authenticated**: 120 requests per minute per user

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

**Response Meta:**
```json
{
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 150,
    "last_page": 10,
    "from": 1,
    "to": 15
  },
  "links": {
    "first": "https://api.fieldpay.com/api/suppliers?page=1",
    "last": "https://api.fieldpay.com/api/suppliers?page=10",
    "prev": null,
    "next": "https://api.fieldpay.com/api/suppliers?page=2"
  }
}
```

## Versioning

Current API version: `v1`

Future versions will be accessible via:
```
https://api.fieldpay.com/api/v2/...
```
