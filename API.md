# Collection Payment System - API Documentation

## Base URL
```
Production: https://api.yourdomain.com/api
Development: http://localhost:8000/api
```

## Authentication

All API requests (except login/register) require JWT authentication.

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "timestamp": "2025-12-23T21:00:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": ["Error message"]
    }
  },
  "meta": {
    "timestamp": "2025-12-23T21:00:00Z"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 422 | Input validation failed |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Version conflict or duplicate |
| RATE_LIMIT | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Collector",
  "email": "john@example.com",
  "password": "securePassword123",
  "password_confirmation": "securePassword123",
  "role": "collector"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Collector",
      "email": "john@example.com",
      "role": "collector",
      "is_active": true
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "expires_in": 3600
  }
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
  "password": "securePassword123",
  "device_id": "device-12345"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "expires_in": 3600
  }
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "expires_in": 3600
  }
}
```

### Logout
```http
POST /auth/logout
```

### Get Current User
```http
GET /auth/me
```

---

## Suppliers

### List Suppliers
```http
GET /suppliers?page=1&per_page=20&search=tea&region=central
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by name, code, phone
- `region` (optional): Filter by region
- `is_active` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Tea Supplier Ltd",
      "code": "SUP001",
      "phone": "+1234567890",
      "email": "supplier@example.com",
      "address": "123 Main St, City",
      "region": "Central",
      "id_number": "ID123456",
      "credit_limit": 5000.00,
      "is_active": true,
      "version": 1,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "last_page": 3
  }
}
```

### Get Supplier
```http
GET /suppliers/{id}
```

### Create Supplier
```http
POST /suppliers
```

**Request Body:**
```json
{
  "name": "New Supplier",
  "code": "SUP002",
  "phone": "+1234567890",
  "email": "newsupplier@example.com",
  "address": "456 Oak Ave, Town",
  "region": "Northern",
  "id_number": "ID789012",
  "credit_limit": 3000.00,
  "is_active": true,
  "metadata": {
    "notes": "Preferred supplier"
  }
}
```

### Update Supplier
```http
PUT /suppliers/{id}
```

**Request Body:**
```json
{
  "name": "Updated Supplier Name",
  "phone": "+9876543210",
  "version": 1
}
```

### Delete Supplier
```http
DELETE /suppliers/{id}
```

### Get Supplier Balance
```http
GET /suppliers/{id}/balance?from=2025-01-01&to=2025-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "supplier": { ... },
    "total_collections": 15000.50,
    "total_payments": 12000.00,
    "balance": 3000.50,
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    }
  }
}
```

### Get Supplier Statement
```http
GET /suppliers/{id}/statement?from=2025-01-01&to=2025-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "supplier": { ... },
    "transactions": [
      {
        "date": "2025-01-05",
        "type": "collection",
        "product": "Tea Leaves",
        "quantity": 100.00,
        "unit": "kg",
        "rate": 5.50,
        "amount": 550.00,
        "balance": 550.00
      },
      {
        "date": "2025-01-10",
        "type": "payment",
        "payment_method": "cash",
        "amount": -200.00,
        "balance": 350.00
      }
    ],
    "summary": {
      "opening_balance": 0,
      "total_collections": 550.00,
      "total_payments": 200.00,
      "closing_balance": 350.00
    }
  }
}
```

---

## Products

### List Products
```http
GET /products?page=1&per_page=20&category=agricultural
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
  "name": "Tea Leaves",
  "code": "PROD001",
  "description": "Premium quality tea leaves",
  "default_unit": "kg",
  "available_units": ["kg", "g", "lb"],
  "category": "Agricultural",
  "is_active": true
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

---

## Rates

### List Rates
```http
GET /rates?product_id=1&supplier_id=2&effective_date=2025-01-15
```

**Query Parameters:**
- `product_id` (optional): Filter by product
- `supplier_id` (optional): Filter by supplier (null = global rates)
- `effective_date` (optional): Get rates effective on date
- `is_active` (optional): Filter by active status

### Get Rate
```http
GET /rates/{id}
```

### Create Rate
```http
POST /rates
```

**Request Body:**
```json
{
  "product_id": 1,
  "supplier_id": 2,
  "rate_value": 5.50,
  "unit": "kg",
  "effective_from": "2025-01-01T00:00:00Z",
  "effective_to": null,
  "is_active": true
}
```

### Update Rate
```http
PUT /rates/{id}
```

**Note**: Updating a rate typically creates a new rate version and sets effective_to on the old rate.

### Get Current Rate
```http
GET /rates/current?product_id=1&supplier_id=2&date=2025-01-15
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "product_id": 1,
    "supplier_id": 2,
    "rate_value": 5.50,
    "unit": "kg",
    "effective_from": "2025-01-01T00:00:00Z",
    "effective_to": null,
    "is_active": true
  }
}
```

---

## Collections

### List Collections
```http
GET /collections?supplier_id=1&product_id=2&from=2025-01-01&to=2025-01-31
```

**Query Parameters:**
- `supplier_id` (optional): Filter by supplier
- `product_id` (optional): Filter by product
- `from` (optional): Start date
- `to` (optional): End date
- `sync_status` (optional): Filter by sync status

### Get Collection
```http
GET /collections/{id}
```

### Create Collection
```http
POST /collections
```

**Request Body:**
```json
{
  "supplier_id": 1,
  "product_id": 2,
  "quantity": 150.00,
  "unit": "kg",
  "collected_at": "2025-01-15T10:30:00Z",
  "notes": "Morning collection",
  "metadata": {
    "location": "Field A",
    "weather": "sunny"
  }
}
```

**Note**: The system automatically:
- Fetches current rate for the product/supplier
- Sets `rate_at_collection` (immutable)
- Calculates `total_value` (quantity * rate)
- Links to `rate_id` for reference

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "uuid": "550e8400-e29b-41d4-a716-446655440010",
    "supplier_id": 1,
    "product_id": 2,
    "rate_id": 5,
    "quantity": 150.00,
    "unit": "kg",
    "rate_at_collection": 5.50,
    "total_value": 825.00,
    "collected_at": "2025-01-15T10:30:00Z",
    "notes": "Morning collection",
    "sync_status": "synced",
    "version": 1,
    "created_at": "2025-01-15T10:31:00Z"
  }
}
```

### Update Collection
```http
PUT /collections/{id}
```

**Note**: `rate_at_collection` is immutable and cannot be updated.

### Delete Collection
```http
DELETE /collections/{id}
```

---

## Payments

### List Payments
```http
GET /payments?supplier_id=1&from=2025-01-01&to=2025-01-31
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
  "amount": 500.00,
  "payment_type": "advance",
  "payment_method": "cash",
  "reference_number": "PMT001",
  "payment_date": "2025-01-15T14:00:00Z",
  "notes": "Advance payment for January",
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "uuid": "550e8400-e29b-41d4-a716-446655440008",
    "supplier_id": 1,
    "amount": 500.00,
    "payment_type": "advance",
    "payment_method": "cash",
    "reference_number": "PMT001",
    "payment_date": "2025-01-15T14:00:00Z",
    "notes": "Advance payment for January",
    "status": "completed",
    "sync_status": "synced",
    "version": 1,
    "created_at": "2025-01-15T14:01:00Z"
  }
}
```

### Update Payment
```http
PUT /payments/{id}
```

### Delete Payment
```http
DELETE /payments/{id}
```

### Calculate Payment Due
```http
POST /payments/calculate
```

**Request Body:**
```json
{
  "supplier_id": 1,
  "from": "2025-01-01",
  "to": "2025-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "supplier_id": 1,
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    },
    "total_collections_value": 15000.50,
    "total_payments": 12000.00,
    "amount_due": 3000.50,
    "breakdown": {
      "collections": [
        {
          "date": "2025-01-05",
          "product": "Tea Leaves",
          "quantity": 100.00,
          "rate": 5.50,
          "value": 550.00
        }
      ],
      "payments": [
        {
          "date": "2025-01-10",
          "type": "advance",
          "amount": 200.00
        }
      ]
    }
  }
}
```

---

## Synchronization

### Push Changes
```http
POST /sync/push
```

**Request Body:**
```json
{
  "device_id": "device-12345",
  "operations": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440020",
      "entity_type": "collection",
      "entity_uuid": "550e8400-e29b-41d4-a716-446655440010",
      "operation": "create",
      "client_version": 1,
      "payload": {
        "supplier_id": 1,
        "product_id": 2,
        "quantity": 150.00,
        "unit": "kg",
        "collected_at": "2025-01-15T10:30:00Z"
      },
      "payload_signature": "hmac-sha256-signature-here"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 1,
    "successful": 1,
    "failed": 0,
    "results": [
      {
        "uuid": "550e8400-e29b-41d4-a716-446655440020",
        "status": "success",
        "server_version": 1,
        "entity_id": 10
      }
    ]
  }
}
```

### Pull Changes
```http
GET /sync/pull?since_version=0&entity_types=collection,payment
```

**Query Parameters:**
- `since_version`: Client's last known version
- `entity_types` (optional): Comma-separated list of entity types

**Response:**
```json
{
  "success": true,
  "data": {
    "latest_version": 150,
    "changes": {
      "collections": [
        {
          "operation": "create",
          "data": { ... },
          "version": 145
        }
      ],
      "payments": [
        {
          "operation": "update",
          "data": { ... },
          "version": 148
        }
      ]
    }
  }
}
```

### Get Sync Status
```http
GET /sync/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pending_operations": 5,
    "last_sync_at": "2025-01-15T10:00:00Z",
    "server_version": 150,
    "client_version": 145
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
  "entity_type": "collection",
  "entity_uuid": "550e8400-e29b-41d4-a716-446655440010",
  "resolution": "accept_server",
  "client_version": 2,
  "server_version": 3
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Anonymous**: 60 requests per minute
- **Authenticated**: 120 requests per minute
- **Admin**: 300 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 1640000000
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Response Meta:**
```json
{
  "meta": {
    "current_page": 1,
    "from": 1,
    "to": 20,
    "per_page": 20,
    "total": 45,
    "last_page": 3
  }
}
```

---

## Filtering & Sorting

Most list endpoints support filtering and sorting:

**Query Parameters:**
- `sort_by`: Field to sort by
- `sort_order`: `asc` or `desc`
- `filter[field]`: Filter by field value

**Example:**
```http
GET /collections?sort_by=collected_at&sort_order=desc&filter[supplier_id]=1
```

---

## Versioning

API uses header-based versioning:

```
Accept: application/vnd.collection-payment.v1+json
```

Current version: `v1`

---

## Testing

### Test Authentication
```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Test Authenticated Request
```bash
curl -X GET https://api.yourdomain.com/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## Webhook Events (Future Enhancement)

Planned webhook support for real-time notifications:

- `collection.created`
- `payment.created`
- `rate.updated`
- `sync.completed`
- `conflict.detected`

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.yourdomain.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Set token
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// List suppliers
const suppliers = await api.get('/suppliers');

// Create collection
const collection = await api.post('/collections', {
  supplier_id: 1,
  product_id: 2,
  quantity: 150.00,
  unit: 'kg',
  collected_at: new Date().toISOString()
});
```

### PHP
```php
use GuzzleHttp\Client;

$client = new Client([
    'base_uri' => 'https://api.yourdomain.com/api',
    'headers' => [
        'Accept' => 'application/json',
        'Authorization' => 'Bearer ' . $token
    ]
]);

// List suppliers
$response = $client->get('/suppliers');
$suppliers = json_decode($response->getBody());

// Create collection
$response = $client->post('/collections', [
    'json' => [
        'supplier_id' => 1,
        'product_id' => 2,
        'quantity' => 150.00,
        'unit' => 'kg',
        'collected_at' => date('c')
    ]
]);
```

---

## Support

For API issues or questions:
- Email: api-support@yourdomain.com
- Documentation: https://docs.yourdomain.com
- Status Page: https://status.yourdomain.com
