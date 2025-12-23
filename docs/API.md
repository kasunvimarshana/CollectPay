# CollectPay API Documentation

## Base URL
```
Production: https://api.yourdomain.com/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123",
  "role": "collector"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector",
    "permissions": [],
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {...},
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_in": 3600
}
```

### GET /auth/me
Get current authenticated user.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector",
    "permissions": [],
    "is_active": true
  }
}
```

### POST /auth/refresh
Refresh JWT token.

**Response (200):**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_in": 3600
}
```

### POST /auth/logout
Logout and invalidate token.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Synchronization

### POST /sync
Full bidirectional synchronization (push + pull).

**Request:**
```json
{
  "device_id": "550e8400-e29b-41d4-a716-446655440000",
  "last_sync_at": "2024-01-15T09:00:00Z",
  "entity_types": ["suppliers", "products", "rates", "collections", "payments"],
  "batch": [
    {
      "entity_type": "collections",
      "operation": "create",
      "data": {
        "uuid": "123e4567-e89b-12d3-a456-426614174000",
        "supplier_id": 1,
        "product_id": 1,
        "collection_date": "2024-01-15",
        "quantity": 10.5,
        "rate_applied": 5.00,
        "unit": "kg",
        "version": 1
      }
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Full sync completed",
  "push_results": {
    "success": [...],
    "conflicts": [...],
    "errors": [...]
  },
  "pull_changes": {
    "suppliers": [...],
    "products": [...],
    "rates": [...],
    "collections": [...],
    "payments": [...]
  },
  "sync_timestamp": "2024-01-15T10:00:00Z"
}
```

### POST /sync/push
Push local changes to server.

**Request:**
```json
{
  "device_id": "550e8400-e29b-41d4-a716-446655440000",
  "batch": [
    {
      "entity_type": "collections",
      "operation": "create",
      "data": {...}
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sync push completed",
  "results": {
    "success": [
      {
        "status": "success",
        "message": "Created successfully",
        "entity": {...}
      }
    ],
    "conflicts": [],
    "errors": []
  },
  "summary": {
    "total": 1,
    "success": 1,
    "conflicts": 0,
    "errors": 0
  }
}
```

### POST /sync/pull
Pull server changes to local.

**Request:**
```json
{
  "device_id": "550e8400-e29b-41d4-a716-446655440000",
  "last_sync_at": "2024-01-15T09:00:00Z",
  "entity_types": ["suppliers", "products", "collections"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sync pull completed",
  "changes": {
    "suppliers": [...],
    "products": [...],
    "collections": [...]
  },
  "sync_timestamp": "2024-01-15T10:00:00Z"
}
```

### GET /sync/status
Check sync status and server availability.

**Query Parameters:**
- `device_id` (required): Device identifier

**Response (200):**
```json
{
  "success": true,
  "server_time": "2024-01-15T10:00:00Z",
  "status": "online"
}
```

## Suppliers

### GET /suppliers
List all suppliers.

**Query Parameters:**
- `search` (optional): Search term for name, code, or phone
- `is_active` (optional): Filter by active status (1 or 0)
- `per_page` (optional): Items per page (default: 50)
- `page` (optional): Page number

**Response (200):**
```json
{
  "success": true,
  "suppliers": {
    "data": [
      {
        "id": 1,
        "code": "SUP001",
        "name": "ABC Suppliers",
        "address": "123 Main St",
        "phone": "+1234567890",
        "email": "abc@example.com",
        "credit_limit": 10000.00,
        "current_balance": 2500.50,
        "is_active": true,
        "version": 1,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "current_page": 1,
    "total": 100
  }
}
```

### POST /suppliers
Create a new supplier.

**Request:**
```json
{
  "code": "SUP002",
  "name": "XYZ Suppliers",
  "address": "456 Market St",
  "phone": "+0987654321",
  "email": "xyz@example.com",
  "credit_limit": 15000.00,
  "is_active": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "supplier": {...}
}
```

### GET /suppliers/{id}
Get supplier details.

**Response (200):**
```json
{
  "success": true,
  "supplier": {
    "id": 1,
    "code": "SUP001",
    "name": "ABC Suppliers",
    ...,
    "collections": [...],
    "payments": [...],
    "rates": [...]
  }
}
```

### PUT /suppliers/{id}
Update supplier.

**Request:**
```json
{
  "name": "ABC Suppliers Ltd",
  "phone": "+1234567891"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Supplier updated successfully",
  "supplier": {...}
}
```

### DELETE /suppliers/{id}
Delete supplier (soft delete).

**Response (200):**
```json
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

### GET /suppliers/{id}/balance
Get supplier balance calculation.

**Response (200):**
```json
{
  "success": true,
  "supplier_id": 1,
  "current_balance": 2500.50,
  "calculated_balance": 2500.50
}
```

## Products

### GET /products
List all products.

**Query Parameters:**
- `search` (optional): Search term
- `category` (optional): Filter by category
- `is_active` (optional): Filter by status
- `per_page` (optional): Items per page
- `page` (optional): Page number

**Response (200):**
```json
{
  "success": true,
  "products": {
    "data": [
      {
        "id": 1,
        "code": "MILK",
        "name": "Fresh Milk",
        "description": "Farm fresh milk",
        "unit": "liters",
        "category": "Dairy",
        "is_active": true,
        "version": 1
      }
    ]
  }
}
```

### POST /products
Create a new product.

**Request:**
```json
{
  "code": "MILK",
  "name": "Fresh Milk",
  "description": "Farm fresh milk",
  "unit": "liters",
  "category": "Dairy",
  "is_active": true
}
```

### GET /products/{id}/current-rate
Get current rate for product.

**Query Parameters:**
- `supplier_id` (optional): Supplier-specific rate
- `date` (optional): Date for rate lookup (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "product_id": 1,
  "rate": {
    "id": 10,
    "product_id": 1,
    "supplier_id": null,
    "rate": 5.50,
    "effective_from": "2024-01-01",
    "effective_to": null,
    "is_active": true
  }
}
```

## Collections

### GET /collections
List collections.

**Query Parameters:**
- `supplier_id` (optional): Filter by supplier
- `product_id` (optional): Filter by product
- `from_date` (optional): Start date
- `to_date` (optional): End date
- `collector_id` (optional): Filter by collector
- `sync_status` (optional): Filter by sync status
- `per_page` (optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "collections": {
    "data": [
      {
        "id": 1,
        "uuid": "123e4567-e89b-12d3-a456-426614174000",
        "supplier_id": 1,
        "product_id": 1,
        "rate_id": 10,
        "collection_date": "2024-01-15",
        "quantity": 10.5,
        "unit": "liters",
        "rate_applied": 5.50,
        "amount": 57.75,
        "notes": null,
        "sync_status": "synced",
        "version": 1,
        "supplier": {...},
        "product": {...}
      }
    ]
  }
}
```

### POST /collections
Create a new collection.

**Request:**
```json
{
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "supplier_id": 1,
  "product_id": 1,
  "collection_date": "2024-01-15",
  "quantity": 10.5,
  "notes": "Morning collection"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Collection created successfully",
  "collection": {
    "id": 1,
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "rate_applied": 5.50,
    "amount": 57.75,
    ...
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Bad request"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Account is inactive"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Sync endpoints**: 30 requests per minute
- **Resource endpoints**: 60 requests per minute

## Conflict Resolution

When a conflict is detected during sync:

```json
{
  "status": "conflict",
  "message": "Version conflict detected",
  "client_version": 5,
  "server_version": 6,
  "server_data": {...},
  "client_data": {...}
}
```

Default strategy: **Server wins**
- Server data takes precedence
- Client data is discarded
- User notified of conflict

## Webhooks (Future Enhancement)

Not yet implemented. Planned for real-time updates.

---

For more information, visit: https://github.com/yourusername/CollectPay
