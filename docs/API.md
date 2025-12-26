# PayTrack API Documentation

## Base URL
```
Production: https://api.paytrack.com/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {your_token_here}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Error description"]
  }
}
```

### Conflict Response (409)
```json
{
  "success": false,
  "message": "Conflict detected",
  "conflict": true,
  "data": {
    "server_version": 5,
    "server_data": { ... }
  }
}
```

## Authentication Endpoints

### Register
```http
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "collector"
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "collector"
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

### Login
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "device_id": "optional-device-uuid"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

### Logout
```http
POST /logout
Authorization: Bearer {token}
```

**Response**: 200 OK

### Get Current User
```http
GET /me
Authorization: Bearer {token}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector"
  }
}
```

## Supplier Endpoints

### List Suppliers
```http
GET /suppliers
Authorization: Bearer {token}
Query Parameters:
  - is_active: boolean (optional)
  - search: string (optional)
  - per_page: number (default: 50, max: 100)
  - page: number (default: 1)
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "uuid": "...",
        "name": "Supplier Name",
        "contact_person": "Contact Person",
        "phone": "+1234567890",
        "email": "supplier@example.com",
        "is_active": true,
        "version": 1
      }
    ],
    "meta": {
      "current_page": 1,
      "per_page": 50,
      "total": 100,
      "last_page": 2
    }
  }
}
```

### Get Supplier
```http
GET /suppliers/{id}
Authorization: Bearer {token}
```

**Response**: 200 OK

### Create Supplier
```http
POST /suppliers
Authorization: Bearer {token}
Content-Type: application/json

{
  "uuid": "optional-uuid",
  "name": "Supplier Name",
  "contact_person": "Contact Person",
  "phone": "+1234567890",
  "email": "supplier@example.com",
  "address": "123 Main St",
  "registration_number": "REG123",
  "is_active": true,
  "version": 1
}
```

**Response**: 201 Created

### Update Supplier
```http
PUT /suppliers/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "version": 1
}
```

**Response**: 200 OK (or 409 Conflict if version mismatch)

### Delete Supplier
```http
DELETE /suppliers/{id}
Authorization: Bearer {token}
```

**Response**: 200 OK

### Get Supplier Balance
```http
GET /suppliers/{id}/balance
Authorization: Bearer {token}
Query Parameters:
  - start_date: date (optional)
  - end_date: date (optional)
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "supplier": { ... },
    "total_collections": 10000.00,
    "total_payments": 7000.00,
    "balance": 3000.00,
    "recent_collections": [ ... ],
    "recent_payments": [ ... ]
  }
}
```

## Product Endpoints

### List Products
```http
GET /products
Authorization: Bearer {token}
Query Parameters:
  - is_active: boolean
  - search: string
  - category: string
  - per_page: number
  - page: number
```

### Get Product
```http
GET /products/{id}
Authorization: Bearer {token}
```

### Create Product
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "uuid": "optional-uuid",
  "name": "Product Name",
  "code": "PROD001",
  "description": "Product description",
  "unit": "kg",
  "category": "Category Name",
  "is_active": true,
  "version": 1
}
```

### Update Product
```http
PUT /products/{id}
Authorization: Bearer {token}
```

### Delete Product
```http
DELETE /products/{id}
Authorization: Bearer {token}
```

### Get Current Rate
```http
GET /products/{id}/current-rate
Authorization: Bearer {token}
Query Parameters:
  - supplier_id: number (required)
  - date: date (optional, defaults to today)
```

## Rate Endpoints

### List Rates
```http
GET /rates
Authorization: Bearer {token}
Query Parameters:
  - supplier_id: number
  - product_id: number
  - is_active: boolean
  - current_only: boolean
  - date: date (for current_only)
```

### Create Rate
```http
POST /rates
Authorization: Bearer {token}
Content-Type: application/json

{
  "uuid": "optional-uuid",
  "supplier_id": 1,
  "product_id": 1,
  "rate": 25.50,
  "effective_from": "2024-01-01",
  "effective_to": "2024-12-31",
  "is_active": true,
  "notes": "Optional notes",
  "version": 1
}
```

### Get Rate History
```http
GET /rates/history
Authorization: Bearer {token}
Query Parameters:
  - supplier_id: number (required)
  - product_id: number (required)
```

## Collection Endpoints

### List Collections
```http
GET /collections
Authorization: Bearer {token}
Query Parameters:
  - supplier_id: number
  - product_id: number
  - is_synced: boolean
  - start_date: date
  - end_date: date
```

### Create Collection
```http
POST /collections
Authorization: Bearer {token}
Content-Type: application/json

{
  "uuid": "optional-uuid",
  "supplier_id": 1,
  "product_id": 1,
  "collection_date": "2024-01-15",
  "quantity": 50.5,
  "unit": "kg",
  "rate_applied": 25.00,
  "notes": "Optional notes",
  "version": 1
}
```

**Note**: If `rate_applied` is not provided, the system will automatically fetch the current rate for the supplier-product combination on the collection date.

### Get Collection Summary
```http
GET /collections/summary
Authorization: Bearer {token}
Query Parameters:
  - supplier_id: number
  - start_date: date
  - end_date: date
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "total_collections": 50,
    "total_amount": 125000.00,
    "synced_count": 45,
    "pending_count": 5,
    "by_product": [
      {
        "product_id": 1,
        "product": { "name": "Product Name", "unit": "kg" },
        "total_quantity": 500.5,
        "total_amount": 12512.50
      }
    ]
  }
}
```

## Payment Endpoints

### List Payments
```http
GET /payments
Authorization: Bearer {token}
Query Parameters:
  - supplier_id: number
  - payment_type: string (advance, partial, full, adjustment)
  - is_synced: boolean
  - start_date: date
  - end_date: date
```

### Create Payment
```http
POST /payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "uuid": "optional-uuid",
  "supplier_id": 1,
  "payment_date": "2024-01-15",
  "amount": 5000.00,
  "payment_type": "partial",
  "payment_method": "bank_transfer",
  "reference_number": "TXN12345",
  "notes": "Optional notes",
  "version": 1
}
```

### Calculate Allocation
```http
POST /payments/calculate-allocation
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplier_id": 1,
  "amount": 5000.00,
  "payment_date": "2024-01-15"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "supplier_id": 1,
    "supplier_name": "Supplier Name",
    "total_collected": 15000.00,
    "total_paid": 10000.00,
    "current_balance": 5000.00,
    "payment_amount": 5000.00,
    "remaining_balance": 0.00,
    "collections": [ ... ]
  }
}
```

### Get Payment Summary
```http
GET /payments/summary
Authorization: Bearer {token}
Query Parameters:
  - supplier_id: number
  - start_date: date
  - end_date: date
```

## Sync Endpoints

### Push Changes
```http
POST /sync/push
Authorization: Bearer {token}
Content-Type: application/json

{
  "device_id": "device-uuid",
  "changes": [
    {
      "entity_type": "collections",
      "operation": "create",
      "data": {
        "uuid": "collection-uuid",
        "supplier_id": 1,
        "product_id": 1,
        "collection_date": "2024-01-15",
        "quantity": 50.5,
        "unit": "kg",
        "rate_applied": 25.00,
        "version": 1
      }
    }
  ]
}
```

**Response**: 200 OK (or 207 Multi-Status with conflicts)
```json
{
  "success": true,
  "message": "Sync completed",
  "results": {
    "success": [
      {
        "status": "success",
        "operation": "created",
        "entity_type": "collections",
        "uuid": "collection-uuid",
        "data": { ... }
      }
    ],
    "conflicts": [],
    "errors": []
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### Pull Changes
```http
POST /sync/pull
Authorization: Bearer {token}
Content-Type: application/json

{
  "device_id": "device-uuid",
  "last_sync": "2024-01-01T00:00:00Z",
  "entities": ["suppliers", "products", "rates", "collections", "payments"]
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "suppliers": [ ... ],
    "products": [ ... ],
    "rates": [ ... ],
    "collections": [ ... ],
    "payments": [ ... ]
  },
  "timestamp": "2024-01-15T12:00:00Z",
  "has_more": false
}
```

### Get Sync Status
```http
GET /sync/status
Authorization: Bearer {token}
Query Parameters:
  - device_id: string (optional)
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "pending": 5,
    "failed": 1,
    "conflicts": 0,
    "last_sync": "2024-01-15T11:00:00Z",
    "recent_logs": [ ... ]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 207 | Multi-Status (partial sync success) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (version mismatch) |
| 422 | Validation Error |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

## Rate Limiting

- 60 requests per minute per user
- Rate limit headers included in response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Pagination

All list endpoints support pagination:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 50, max: 100)

## Filtering

Most endpoints support filtering via query parameters. Common filters:
- `is_active`: Filter by active status
- `search`: Text search across relevant fields
- `start_date` / `end_date`: Date range filtering

## Versioning

API uses version-based conflict detection:
- Include `version` field in create/update requests
- Server will return 409 Conflict if version mismatch
- Client should update with server data and retry

## WebSocket Support

Coming soon: Real-time updates via WebSocket connections.

## SDKs

Official SDKs:
- JavaScript/TypeScript (React Native)
- Coming soon: iOS (Swift), Android (Kotlin)

## Support

- Documentation: https://docs.paytrack.com
- API Status: https://status.paytrack.com
- Support: support@paytrack.com
