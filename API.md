# API Documentation

## TransacTrack REST API v1.0

Base URL: `https://api.transactrack.com/api`

## Authentication

All endpoints (except login and register) require authentication via Bearer token.

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+1234567890",
  "device_id": "abc-123-def-456"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "collector",
    "status": "active",
    "device_id": "abc-123-def-456",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "token": "1|abcdef123456..."
}
```

### Login

Authenticate a user and receive a token.

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "device_id": "abc-123-def-456"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector",
    "status": "active"
  },
  "token": "1|abcdef123456..."
}
```

**Error Response:** `422 Unprocessable Entity`
```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": ["The provided credentials are incorrect."]
  }
}
```

### Logout

Revoke the current authentication token.

**Endpoint:** `POST /logout`

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User

Get authenticated user details.

**Endpoint:** `GET /user`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "collector",
  "status": "active",
  "device_id": "abc-123-def-456"
}
```

## Supplier Endpoints

### List Suppliers

Get a paginated list of suppliers.

**Endpoint:** `GET /suppliers`

**Query Parameters:**
- `status` (optional): Filter by status (active, inactive, blocked)
- `search` (optional): Search by name, phone, or email
- `per_page` (optional): Results per page (default: 15, max: 100)
- `page` (optional): Page number

**Example:** `GET /suppliers?status=active&search=john&per_page=20&page=1`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "ABC Suppliers",
      "email": "abc@example.com",
      "phone": "+1234567890",
      "location": "123 Main St, City",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "metadata": {},
      "status": "active",
      "created_by": 1,
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "creator": {
        "id": 1,
        "name": "John Doe"
      }
    }
  ],
  "current_page": 1,
  "per_page": 15,
  "total": 50,
  "last_page": 4
}
```

### Get Supplier

Get details of a specific supplier.

**Endpoint:** `GET /suppliers/{id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "ABC Suppliers",
  "email": "abc@example.com",
  "phone": "+1234567890",
  "location": "123 Main St, City",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "metadata": {},
  "status": "active",
  "created_by": 1,
  "balance": 1500.00,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "creator": {...},
  "collections": [...],
  "payments": [...]
}
```

### Create Supplier

Create a new supplier.

**Endpoint:** `POST /suppliers`

**Request Body:**
```json
{
  "name": "ABC Suppliers",
  "email": "abc@example.com",
  "phone": "+1234567890",
  "location": "123 Main St, City",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "metadata": {
    "notes": "Preferred supplier"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "ABC Suppliers",
  ...
}
```

### Update Supplier

Update an existing supplier.

**Endpoint:** `PUT /suppliers/{id}`

**Request Body:**
```json
{
  "name": "ABC Suppliers Inc",
  "status": "active"
}
```

**Response:** `200 OK`

### Delete Supplier

Soft delete a supplier.

**Endpoint:** `DELETE /suppliers/{id}`

**Response:** `200 OK`
```json
{
  "message": "Supplier deleted successfully"
}
```

## Product Endpoints

### List Products

Get a paginated list of products.

**Endpoint:** `GET /products`

**Query Parameters:**
- `status` (optional): Filter by status
- `search` (optional): Search by name
- `per_page` (optional): Results per page

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Rubber",
      "description": "Natural rubber",
      "unit_type": "weight",
      "base_rate": 10.50,
      "metadata": {},
      "status": "active",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ],
  ...
}
```

### Get Product

**Endpoint:** `GET /products/{id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Rubber",
  "description": "Natural rubber",
  "unit_type": "weight",
  "base_rate": 10.50,
  "current_rate": 11.00,
  "metadata": {},
  "status": "active",
  "rates": [
    {
      "id": 1,
      "rate": 11.00,
      "effective_from": "2024-01-01T00:00:00Z",
      "effective_to": null
    }
  ]
}
```

### Create Product

**Endpoint:** `POST /products`

**Request Body:**
```json
{
  "name": "Rubber",
  "description": "Natural rubber",
  "unit_type": "weight",
  "base_rate": 10.50,
  "metadata": {}
}
```

**Response:** `201 Created`

### Update Product

**Endpoint:** `PUT /products/{id}`

### Delete Product

**Endpoint:** `DELETE /products/{id}`

## Collection Endpoints

### List Collections

Get a paginated list of collections.

**Endpoint:** `GET /collections`

**Query Parameters:**
- `supplier_id` (optional): Filter by supplier
- `product_id` (optional): Filter by product
- `user_id` (optional): Filter by user
- `sync_status` (optional): Filter by sync status
- `date_from` (optional): Filter by date range
- `date_to` (optional): Filter by date range
- `per_page` (optional): Results per page

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "supplier_id": 1,
      "product_id": 1,
      "user_id": 1,
      "quantity": 100.5,
      "unit": "kg",
      "rate": 10.50,
      "total_amount": 1055.25,
      "collection_date": "2024-01-01T10:00:00Z",
      "notes": "Morning collection",
      "device_id": "abc-123",
      "sync_status": "synced",
      "version": 1,
      "server_timestamp": "2024-01-01T10:05:00Z",
      "supplier": {...},
      "product": {...},
      "user": {...}
    }
  ],
  ...
}
```

### Create Collection

**Endpoint:** `POST /collections`

**Request Body:**
```json
{
  "supplier_id": 1,
  "product_id": 1,
  "quantity": 100.5,
  "unit": "kg",
  "rate": 10.50,
  "collection_date": "2024-01-01T10:00:00Z",
  "notes": "Morning collection",
  "device_id": "abc-123"
}
```

**Response:** `201 Created`

**Note:** If `rate` is not provided, the current product rate will be used automatically.

### Get Collection

**Endpoint:** `GET /collections/{id}`

### Update Collection

**Endpoint:** `PUT /collections/{id}`

### Delete Collection

**Endpoint:** `DELETE /collections/{id}`

## Payment Endpoints

### List Payments

**Endpoint:** `GET /payments`

**Query Parameters:**
- `supplier_id` (optional)
- `user_id` (optional)
- `payment_type` (optional): advance, partial, full
- `sync_status` (optional)
- `date_from` (optional)
- `date_to` (optional)
- `per_page` (optional)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "supplier_id": 1,
      "user_id": 1,
      "amount": 500.00,
      "payment_type": "partial",
      "payment_method": "cash",
      "reference_number": "PAY-001",
      "payment_date": "2024-01-01T14:00:00Z",
      "notes": "Partial payment",
      "device_id": "abc-123",
      "sync_status": "synced",
      "version": 1,
      "supplier": {...},
      "user": {...}
    }
  ],
  ...
}
```

### Create Payment

**Endpoint:** `POST /payments`

**Request Body:**
```json
{
  "supplier_id": 1,
  "amount": 500.00,
  "payment_type": "partial",
  "payment_method": "cash",
  "reference_number": "PAY-001",
  "payment_date": "2024-01-01T14:00:00Z",
  "notes": "Partial payment",
  "device_id": "abc-123"
}
```

**Response:** `201 Created`

### Get Payment

**Endpoint:** `GET /payments/{id}`

### Update Payment

**Endpoint:** `PUT /payments/{id}`

### Delete Payment

**Endpoint:** `DELETE /payments/{id}`

## Sync Endpoints

### Synchronize Data

Sync offline data with the server.

**Endpoint:** `POST /sync`

**Request Body:**
```json
{
  "device_id": "abc-123-def-456",
  "last_sync_timestamp": "2024-01-01T10:00:00Z",
  "collections": [
    {
      "id": null,
      "supplier_id": 1,
      "product_id": 1,
      "quantity": 50.0,
      "unit": "kg",
      "rate": 10.50,
      "collection_date": "2024-01-01T11:00:00Z",
      "version": 1
    }
  ],
  "payments": [
    {
      "id": null,
      "supplier_id": 1,
      "amount": 250.00,
      "payment_type": "partial",
      "payment_method": "cash",
      "payment_date": "2024-01-01T12:00:00Z",
      "version": 1
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "synced_collections": [...],
  "synced_payments": [...],
  "server_collections": [...],
  "server_payments": [...],
  "conflicts": [
    {
      "status": "conflict",
      "entity_type": "collection",
      "entity_id": 5,
      "server_data": {...}
    }
  ],
  "sync_timestamp": "2024-01-01T12:05:00Z"
}
```

### Resolve Conflict

Resolve a sync conflict.

**Endpoint:** `POST /sync/conflicts/{id}/resolve`

**Request Body:**
```json
{
  "resolution": "use_server",
  "resolved_data": null
}
```

**Options:**
- `use_server`: Accept server version
- `use_client`: Accept client version
- `merge`: Provide merged data in `resolved_data`

**Response:** `200 OK`
```json
{
  "success": true,
  "conflict": {...}
}
```

## Error Responses

### Standard Error Format

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

### Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

- **Default**: 60 requests per minute per IP
- **Authentication**: 5 attempts per minute per IP
- **Headers**: Rate limit info in response headers
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Pagination

List endpoints return paginated results:

```json
{
  "data": [...],
  "current_page": 1,
  "per_page": 15,
  "total": 100,
  "last_page": 7,
  "from": 1,
  "to": 15
}
```

## Filtering and Searching

Most list endpoints support:
- **Filtering**: `?status=active&payment_type=cash`
- **Searching**: `?search=keyword`
- **Sorting**: `?sort=created_at&order=desc`
- **Pagination**: `?page=2&per_page=20`

## Testing

### Using cURL

```bash
# Login
curl -X POST https://api.transactrack.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get suppliers (with token)
curl -X GET https://api.transactrack.com/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Using Postman

1. Import collection from repository
2. Set environment variables
3. Use variables for token management

## Versioning

API version included in URL: `/api/v1/...`

Current version: v1.0

## Support

- Documentation: https://docs.transactrack.com/api
- Issues: https://github.com/kasunvimarshana/TransacTrack/issues
- Email: api@transactrack.com
