# CollectPay API Documentation

Base URL: `http://localhost:8000/api` (development)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register
**POST** `/register`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "collector"
}
```

Response:
```json
{
  "user": { ... },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Login
**POST** `/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Logout
**POST** `/logout`

Requires authentication. Invalidates current token.

### Get Current User
**GET** `/me`

Returns authenticated user information.

## Suppliers

### List Suppliers
**GET** `/suppliers?is_active=true&search=keyword&page=1`

Query parameters:
- `is_active`: Filter by active status (boolean)
- `search`: Search by name or code
- `page`: Page number for pagination

Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Supplier A",
      "code": "SUP001",
      "phone": "+1234567890",
      "address": "123 Main St",
      "area": "District 1",
      "is_active": true
    }
  ],
  "meta": { ... },
  "links": { ... }
}
```

### Create Supplier
**POST** `/suppliers`

Requires: Admin or Supervisor role

Request:
```json
{
  "name": "New Supplier",
  "code": "SUP002",
  "phone": "+1234567890",
  "address": "456 Oak Ave",
  "area": "District 2",
  "is_active": true
}
```

### Update Supplier
**PUT** `/suppliers/{id}`

Requires: Admin or Supervisor role

### Delete Supplier
**DELETE** `/suppliers/{id}`

Requires: Admin role

## Products

### List Products
**GET** `/products?is_active=true&search=keyword`

Similar structure to suppliers.

### Create Product
**POST** `/products`

Requires: Admin or Supervisor role

Request:
```json
{
  "name": "Tea Leaves",
  "code": "PROD001",
  "unit": "kilogram",
  "description": "Premium tea leaves",
  "is_active": true
}
```

Available units: `gram`, `kilogram`, `liter`, `milliliter`

## Rates

### List Rates
**GET** `/rates?product_id=1&supplier_id=1&date=2024-01-15`

### Get Current Rate
**GET** `/rates/current?product_id=1&supplier_id=1&date=2024-01-15`

Returns the applicable rate for given product/supplier/date.

### Create Rate
**POST** `/rates`

Requires: Admin or Supervisor role

Request:
```json
{
  "product_id": 1,
  "supplier_id": 1,
  "rate": 150.50,
  "effective_from": "2024-01-01",
  "effective_to": "2024-12-31",
  "is_active": true
}
```

## Collections

### List Collections
**GET** `/collections?from_date=2024-01-01&to_date=2024-01-31&supplier_id=1`

Returns collections for authenticated user (collectors see only their own).

Response:
```json
{
  "data": [
    {
      "id": 1,
      "client_id": "uuid-here",
      "user_id": 1,
      "supplier_id": 1,
      "product_id": 1,
      "quantity": 100.5,
      "unit": "kilogram",
      "rate": 150.00,
      "amount": 15075.00,
      "collection_date": "2024-01-15T10:30:00Z",
      "notes": "Morning collection",
      "supplier": { ... },
      "product": { ... },
      "user": { ... }
    }
  ]
}
```

### Create Collection
**POST** `/collections`

Request:
```json
{
  "client_id": "uuid-generated-on-client",
  "supplier_id": 1,
  "product_id": 1,
  "quantity": 100.5,
  "unit": "kilogram",
  "rate": 150.00,
  "amount": 15075.00,
  "collection_date": "2024-01-15T10:30:00Z",
  "notes": "Morning collection"
}
```

### Update Collection
**PUT** `/collections/{id}`

Users can update their own collections. Admins/Supervisors can update any.

### Delete Collection
**DELETE** `/collections/{id}`

Users can delete their own. Admins can delete any.

## Payments

### List Payments
**GET** `/payments?from_date=2024-01-01&supplier_id=1&payment_type=advance`

Query parameters:
- `from_date`, `to_date`: Date range
- `supplier_id`: Filter by supplier
- `payment_type`: advance, partial, full

### Create Payment
**POST** `/payments`

Request:
```json
{
  "client_id": "uuid-generated-on-client",
  "supplier_id": 1,
  "collection_id": 1,
  "payment_type": "advance",
  "amount": 5000.00,
  "payment_date": "2024-01-15T14:00:00Z",
  "payment_method": "cash",
  "reference_number": "REF001",
  "notes": "Advance payment for January"
}
```

Payment types: `advance`, `partial`, `full`
Payment methods: `cash`, `bank_transfer`, `check`

### Get Payment Summary
**GET** `/payments/summary?supplier_id=1&from_date=2024-01-01&to_date=2024-01-31`

Response:
```json
{
  "total_amount": 50000.00,
  "advance_amount": 10000.00,
  "partial_amount": 20000.00,
  "full_amount": 20000.00,
  "payment_count": 15
}
```

## Sync

### Sync Collections
**POST** `/sync/collections`

Upload collections from mobile device:

Request:
```json
{
  "collections": [
    {
      "client_id": "uuid-1",
      "supplier_id": 1,
      "product_id": 1,
      "quantity": 100,
      "unit": "kilogram",
      "rate": 150,
      "amount": 15000,
      "collection_date": "2024-01-15T10:00:00Z",
      "version": 1
    }
  ]
}
```

Response:
```json
{
  "message": "Sync completed",
  "results": [
    {
      "client_id": "uuid-1",
      "status": "created",
      "id": 123
    }
  ]
}
```

Status values: `created`, `updated`, `conflict`

### Sync Payments
**POST** `/sync/payments`

Similar to sync collections.

### Get Updates
**POST** `/sync/updates`

Download changes from server:

Request:
```json
{
  "last_sync": "2024-01-15T10:00:00Z"
}
```

Response:
```json
{
  "collections": [ ... ],
  "payments": [ ... ],
  "sync_time": "2024-01-15T12:00:00Z"
}
```

## Error Responses

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)
```json
{
  "message": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "message": "No active rate found"
}
```

### Server Error (500)
```json
{
  "message": "Sync failed",
  "error": "Error details"
}
```

## Rate Limiting

API requests are limited to 60 requests per minute per user.

## Pagination

List endpoints support pagination:
- Default: 50 items per page
- Maximum: 100 items per page
- Use `?page=2&per_page=50` to control

## Filtering & Sorting

Most list endpoints support:
- Filtering by date ranges
- Search by keywords
- Sorting (where applicable)

Check individual endpoint documentation for available filters.
