# API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

## Endpoints

### Authentication

#### Login
```
POST /auth/login

Request:
{
  "email": "admin@synccollect.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@synccollect.com",
      "role": "admin",
      "is_active": true
    },
    "token": "1|xyz..."
  },
  "message": "Login successful"
}
```

#### Register
```
POST /auth/register

Request:
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "user"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "2|abc..."
  },
  "message": "Registration successful"
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

#### Get Current User
```
GET /auth/user
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@synccollect.com",
    "role": "admin",
    "is_active": true
  }
}
```

#### Refresh Token
```
POST /auth/refresh
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "token": "3|def..."
  },
  "message": "Token refreshed successfully"
}
```

### Suppliers

#### List Suppliers
```
GET /suppliers
Authorization: Bearer {token}

Query Parameters:
- status: active|inactive
- search: Search term
- per_page: Items per page (default: 15, max: 100)
- page: Page number

Response:
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Fresh Farm Supplies",
        "contact_person": "John Doe",
        "phone": "+1234567890",
        "email": "contact@freshfarm.com",
        "address": "123 Farm Road, Agriculture City",
        "status": "active",
        "created_by": 1,
        "updated_by": null,
        "version": 1,
        "created_at": "2025-12-23T09:00:00.000000Z",
        "updated_at": "2025-12-23T09:00:00.000000Z"
      }
    ],
    "per_page": 15,
    "total": 2
  }
}
```

#### Get Supplier
```
GET /suppliers/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Fresh Farm Supplies",
    ...
    "products": [...],
    "payments": [...]
  }
}
```

#### Create Supplier
```
POST /suppliers
Authorization: Bearer {token}

Request:
{
  "name": "New Supplier",
  "contact_person": "Jane Doe",
  "phone": "+1234567890",
  "email": "supplier@example.com",
  "address": "123 Street, City",
  "status": "active"
}

Response:
{
  "success": true,
  "data": {...},
  "message": "Supplier created successfully"
}
```

#### Update Supplier
```
PUT /suppliers/{id}
Authorization: Bearer {token}

Request:
{
  "name": "Updated Supplier Name",
  "status": "inactive"
}

Response:
{
  "success": true,
  "data": {...},
  "message": "Supplier updated successfully"
}
```

#### Delete Supplier
```
DELETE /suppliers/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

### Products

#### List Products
```
GET /products
Authorization: Bearer {token}

Query Parameters:
- supplier_id: Filter by supplier
- status: active|inactive
- search: Search term
- per_page: Items per page
- page: Page number
```

#### Get Products by Supplier
```
GET /suppliers/{supplier_id}/products
Authorization: Bearer {token}
```

#### Get Product
```
GET /products/{id}
Authorization: Bearer {token}
```

#### Create Product
```
POST /products
Authorization: Bearer {token}

Request:
{
  "supplier_id": 1,
  "name": "New Product",
  "description": "Product description",
  "sku": "PRD001",
  "units": ["kg", "pound"],
  "default_unit": "kg",
  "status": "active"
}
```

#### Update Product
```
PUT /products/{id}
Authorization: Bearer {token}
```

#### Delete Product
```
DELETE /products/{id}
Authorization: Bearer {token}
```

### Product Rates

#### Get Product Rates
```
GET /products/{product_id}/rates
Authorization: Bearer {token}
```

#### Get Current Rate
```
GET /products/{product_id}/current-rate
Authorization: Bearer {token}

Query Parameters:
- unit: Unit type (optional, uses default unit if not provided)
```

#### Create Product Rate
```
POST /products/{product_id}/rates
Authorization: Bearer {token}

Request:
{
  "rate": 12.50,
  "unit": "kg",
  "effective_from": "2025-12-23",
  "effective_to": null,
  "is_active": true
}
```

#### Update Product Rate
```
PUT /rates/{id}
Authorization: Bearer {token}
```

### Payments

#### List Payments
```
GET /payments
Authorization: Bearer {token}

Query Parameters:
- supplier_id: Filter by supplier
- product_id: Filter by product
- payment_type: advance|partial|full
- from_date: Start date
- to_date: End date
- per_page: Items per page
- page: Page number
```

#### Get Payments by Supplier
```
GET /suppliers/{supplier_id}/payments
Authorization: Bearer {token}
```

#### Get Payment
```
GET /payments/{id}
Authorization: Bearer {token}
```

#### Create Payment
```
POST /payments
Authorization: Bearer {token}

Request:
{
  "supplier_id": 1,
  "product_id": 1,
  "amount": 500.00,
  "payment_type": "advance",
  "payment_method": "bank_transfer",
  "reference_number": "PAY123",
  "notes": "Advance payment for bulk order",
  "payment_date": "2025-12-23"
}
```

### Synchronization

#### Push Local Changes
```
POST /sync/push
Authorization: Bearer {token}

Request:
{
  "changes": [
    {
      "entity_type": "suppliers",
      "operation": "create|update|delete",
      "data": {...},
      "client_timestamp": "2025-12-23T10:00:00Z",
      "client_id": "device-123"
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "processed": 10,
    "conflicts": [
      {
        "entity_type": "suppliers",
        "entity_id": 1,
        "conflict_type": "version_mismatch",
        "server_data": {...},
        "client_data": {...}
      }
    ]
  }
}
```

#### Pull Server Changes
```
GET /sync/pull
Authorization: Bearer {token}

Query Parameters:
- since: ISO timestamp of last sync

Response:
{
  "success": true,
  "data": {
    "suppliers": [...],
    "products": [...],
    "rates": [...],
    "payments": [...],
    "sync_timestamp": "2025-12-23T10:05:00Z"
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Server Error

## Rate Limiting

API requests are limited to 60 requests per minute per user.

## Demo Credentials

```
Admin User:
Email: admin@synccollect.com
Password: password123

Regular User:
Email: user@synccollect.com
Password: password123
```
