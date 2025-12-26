# SyncLedger API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer {token}
```

### Login
```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "device_id": "uuid-device-identifier"
}

Response 200:
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "collector"
  },
  "token": "1|abcdef...",
  "permissions": []
}
```

### Register
```http
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "collector"
}

Response 201:
{
  "user": {...},
  "token": "1|abcdef..."
}
```

## Sync Endpoints

### Sync Data
```http
POST /sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "device_id": "uuid-device-identifier",
  "sync_data": [
    {
      "entity_type": "collection",
      "operation": "create",
      "data": {
        "uuid": "collection-uuid",
        "supplier_id": 1,
        "product_id": 2,
        "quantity": 10.5,
        "collection_date": "2024-01-15"
      },
      "version": 1
    }
  ]
}

Response 200:
{
  "status": "success",
  "results": {
    "success": [...],
    "conflicts": [],
    "failed": []
  },
  "server_timestamp": "2024-01-15T10:30:00Z"
}
```

### Pull Changes
```http
GET /sync/pull?since=2024-01-15T09:00:00Z
Authorization: Bearer {token}

Response 200:
{
  "status": "success",
  "changes": {
    "suppliers": [...],
    "products": [...],
    "rates": [...],
    "collections": [...],
    "payments": [...]
  },
  "server_timestamp": "2024-01-15T10:30:00Z"
}
```

### Full Sync
```http
GET /sync/full
Authorization: Bearer {token}

Response 200:
{
  "status": "success",
  "data": {
    "suppliers": [...],
    "products": [...],
    "rates": [...],
    "collections": [...],
    "payments": [...]
  },
  "server_timestamp": "2024-01-15T10:30:00Z"
}
```

## Suppliers

### List Suppliers
```http
GET /suppliers?status=active&search=john
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": 1,
      "code": "SUP001",
      "name": "John's Farm",
      "contact_person": "John Doe",
      "phone": "+1234567890",
      "email": "john@farm.com",
      "address": "123 Farm Road",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### Create Supplier
```http
POST /suppliers
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "SUP001",
  "name": "John's Farm",
  "contact_person": "John Doe",
  "phone": "+1234567890",
  "email": "john@farm.com",
  "address": "123 Farm Road",
  "status": "active"
}

Response 201:
{
  "id": 1,
  "code": "SUP001",
  ...
}
```

### Get Supplier
```http
GET /suppliers/1
Authorization: Bearer {token}

Response 200:
{
  "supplier": {...},
  "outstanding": {
    "supplier_id": 1,
    "supplier_name": "John's Farm",
    "total_collections": 1500.00,
    "total_payments": 1000.00,
    "outstanding_balance": 500.00,
    "calculated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Update Supplier
```http
PUT /suppliers/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John's Updated Farm",
  "status": "inactive"
}

Response 200:
{
  "id": 1,
  "name": "John's Updated Farm",
  ...
}
```

### Get Supplier Balance
```http
GET /suppliers/1/balance?from_date=2024-01-01&to_date=2024-01-31
Authorization: Bearer {token}

Response 200:
{
  "collections": [
    {
      "id": 1,
      "date": "2024-01-15",
      "product": "Milk",
      "quantity": 10.5,
      "rate": 50.00,
      "amount": 525.00
    }
  ],
  "payments": [
    {
      "id": 1,
      "date": "2024-01-20",
      "type": "partial",
      "amount": 300.00,
      "method": "cash"
    }
  ],
  "summary": {
    "total_collections": 525.00,
    "total_payments": 300.00,
    "outstanding_balance": 225.00
  }
}
```

## Products

### List Products
```http
GET /products?is_active=1&search=milk
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": 1,
      "code": "PROD001",
      "name": "Fresh Milk",
      "description": "Organic fresh milk",
      "unit": "liter",
      "category": "dairy",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
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
  "code": "PROD001",
  "name": "Fresh Milk",
  "description": "Organic fresh milk",
  "unit": "liter",
  "category": "dairy",
  "is_active": true
}

Response 201:
{
  "id": 1,
  ...
}
```

## Rates

### List Rates
```http
GET /rates?product_id=1&is_active=1&effective_date=2024-01-15
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "supplier_id": null,
      "rate": 50.00,
      "effective_from": "2024-01-01",
      "effective_to": null,
      "is_active": true,
      "applied_scope": "general",
      "product": {...},
      "supplier": null
    }
  ]
}
```

### Get Applicable Rate
```http
GET /rates/applicable?product_id=1&date=2024-01-15&supplier_id=1
Authorization: Bearer {token}

Response 200:
{
  "id": 1,
  "product_id": 1,
  "rate": 50.00,
  ...
}
```

### Create Rate
```http
POST /rates
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": 1,
  "supplier_id": null,
  "rate": 50.00,
  "effective_from": "2024-01-01",
  "effective_to": null,
  "is_active": true,
  "applied_scope": "general",
  "notes": "Standard rate for 2024"
}

Response 201:
{
  "id": 1,
  ...
}
```

## Collections

### List Collections
```http
GET /collections?supplier_id=1&from_date=2024-01-01&to_date=2024-01-31
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": 1,
      "uuid": "collection-uuid",
      "supplier_id": 1,
      "product_id": 1,
      "rate_id": 1,
      "quantity": 10.5,
      "rate_applied": 50.00,
      "total_amount": 525.00,
      "collection_date": "2024-01-15",
      "collection_time": "08:30:00",
      "notes": null,
      "supplier": {...},
      "product": {...},
      "rate": {...}
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
  "uuid": "collection-uuid",
  "supplier_id": 1,
  "product_id": 1,
  "quantity": 10.5,
  "collection_date": "2024-01-15",
  "collection_time": "08:30:00",
  "notes": "Morning collection"
}

Response 201:
{
  "id": 1,
  "uuid": "collection-uuid",
  "rate_applied": 50.00,
  "total_amount": 525.00,
  ...
}
```

### Get Collection Summary
```http
GET /collections/summary?supplier_id=1&from_date=2024-01-01&to_date=2024-01-31
Authorization: Bearer {token}

Response 200:
{
  "supplier_id": 1,
  "from_date": "2024-01-01",
  "to_date": "2024-01-31",
  "products": [
    {
      "product_id": 1,
      "product_name": "Fresh Milk",
      "product_unit": "liter",
      "total_quantity": 315.5,
      "total_amount": 15775.00,
      "collection_count": 30
    }
  ],
  "grand_total": 15775.00
}
```

## Payments

### List Payments
```http
GET /payments?supplier_id=1&from_date=2024-01-01&payment_type=partial
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": 1,
      "uuid": "payment-uuid",
      "supplier_id": 1,
      "payment_type": "partial",
      "amount": 500.00,
      "payment_date": "2024-01-20",
      "payment_method": "cash",
      "reference_number": "REF001",
      "outstanding_before": 1000.00,
      "outstanding_after": 500.00,
      "calculation_details": {...},
      "supplier": {...}
    }
  ]
}
```

### Create Payment
```http
POST /payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "uuid": "payment-uuid",
  "supplier_id": 1,
  "payment_type": "partial",
  "amount": 500.00,
  "payment_date": "2024-01-20",
  "payment_method": "cash",
  "reference_number": "REF001",
  "notes": "Partial payment"
}

Response 201:
{
  "id": 1,
  "outstanding_before": 1000.00,
  "outstanding_after": 500.00,
  ...
}
```

### Validate Payment Amount
```http
POST /payments/validate-amount
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplier_id": 1,
  "amount": 500.00
}

Response 200:
{
  "is_valid": true,
  "amount": 500.00,
  "outstanding": 1000.00,
  "message": "Payment amount is valid"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "amount": ["Payment amount exceeds outstanding balance"]
  }
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error",
  "error": "Error details..."
}
```

## Rate Limiting

- 60 requests per minute per IP for unauthenticated endpoints
- 120 requests per minute per user for authenticated endpoints

## Pagination

List endpoints support pagination:
```
?page=1&per_page=50
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 50,
    "total": 250
  }
}
```
