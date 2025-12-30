# TrackVault API Documentation

## Base URL

```
Production: https://api.yourdomain.com/api
Development: http://localhost:8000/api
```

## Authentication

TrackVault uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

## Response Format

All API responses follow this structure:

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
    "field": ["validation error message"]
  }
}
```

## Authentication Endpoints

### Register User

```http
POST /register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "active",
      "created_at": "2025-12-27T10:00:00.000000Z"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### Login

```http
POST /login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### Get Current User

```http
GET /me
```

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "roles": [ ... ],
    "permissions": [ ... ]
  }
}
```

### Logout

```http
POST /logout
```

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### Refresh Token

```http
POST /refresh
```

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### Change Password

```http
POST /change-password
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword",
  "new_password_confirmation": "newpassword"
}
```

**Response:** `200 OK`

## Supplier Endpoints

### List Suppliers

```http
GET /suppliers
```

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page (max 100)
- `status` (string): Filter by status (active/inactive)
- `search` (string): Search by name or code

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Green Valley Farm",
      "code": "GVF001",
      "contact_person": "Jane Smith",
      "phone": "+1234567890",
      "email": "jane@greenvalley.com",
      "address": "123 Farm Road",
      "city": "Springfield",
      "status": "active",
      "created_at": "2025-12-27T10:00:00.000000Z",
      "updated_at": "2025-12-27T10:00:00.000000Z"
    }
  ]
}
```

### Get Supplier

```http
GET /suppliers/{id}
```

**Response:** `200 OK`

### Create Supplier

```http
POST /suppliers
```

**Request Body:**
```json
{
  "name": "Green Valley Farm",
  "code": "GVF001",
  "contact_person": "Jane Smith",
  "phone": "+1234567890",
  "email": "jane@greenvalley.com",
  "address": "123 Farm Road",
  "city": "Springfield",
  "state": "IL",
  "country": "USA",
  "postal_code": "62701",
  "status": "active"
}
```

**Response:** `201 Created`

### Update Supplier

```http
PUT /suppliers/{id}
```

**Request Body:** Same as Create Supplier

**Response:** `200 OK`

### Delete Supplier

```http
DELETE /suppliers/{id}
```

**Response:** `200 OK`

### Get Supplier Collections

```http
GET /suppliers/{id}/collections
```

**Response:** `200 OK`

### Get Supplier Payments

```http
GET /suppliers/{id}/payments
```

**Response:** `200 OK`

### Get Supplier Balance

```http
GET /suppliers/{id}/balance
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "supplier_id": 1,
    "total_collections": 15000.00,
    "total_payments": 10000.00,
    "outstanding_balance": 5000.00
  }
}
```

## Product Endpoints

### List Products

```http
GET /products
```

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page
- `status` (string): Filter by status
- `search` (string): Search by name or code

**Response:** `200 OK`

### Get Product

```http
GET /products/{id}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tea Leaves Grade A",
    "code": "TEA-A",
    "description": "Premium quality tea leaves",
    "base_unit": "kg",
    "allowed_units": ["kg", "g"],
    "status": "active",
    "created_at": "2025-12-27T10:00:00.000000Z"
  }
}
```

### Create Product

```http
POST /products
```

**Request Body:**
```json
{
  "name": "Tea Leaves Grade A",
  "code": "TEA-A",
  "description": "Premium quality tea leaves",
  "base_unit": "kg",
  "allowed_units": ["kg", "g"],
  "status": "active"
}
```

**Response:** `201 Created`

### Update Product

```http
PUT /products/{id}
```

**Response:** `200 OK`

### Delete Product

```http
DELETE /products/{id}
```

**Response:** `200 OK`

### Get Product Rates

```http
GET /products/{id}/rates
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "rate": 150.5000,
      "unit": "kg",
      "effective_from": "2025-01-01",
      "effective_to": null,
      "is_active": true,
      "notes": "New year rate",
      "created_at": "2025-12-27T10:00:00.000000Z"
    }
  ]
}
```

### Add Product Rate

```http
POST /products/{id}/rates
```

**Request Body:**
```json
{
  "rate": 150.50,
  "unit": "kg",
  "effective_from": "2025-01-01",
  "effective_to": "2025-12-31",
  "notes": "New year rate"
}
```

**Response:** `201 Created`

### Get Current Rate

```http
GET /products/{id}/current-rate?date=2025-12-27&unit=kg
```

**Response:** `200 OK`

## Collection Endpoints

### List Collections

```http
GET /collections
```

**Query Parameters:**
- `supplier_id` (integer): Filter by supplier
- `product_id` (integer): Filter by product
- `date_from` (date): Filter from date
- `date_to` (date): Filter to date
- `page` (integer): Page number
- `per_page` (integer): Items per page

**Response:** `200 OK`

### Get Collection

```http
GET /collections/{id}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "supplier_id": 1,
    "product_id": 1,
    "collected_by": 2,
    "quantity": 50.5000,
    "unit": "kg",
    "rate": 150.5000,
    "total_amount": 7600.2500,
    "collection_date": "2025-12-27",
    "collection_time": "14:30:00",
    "notes": "Morning collection",
    "created_at": "2025-12-27T10:00:00.000000Z",
    "supplier": { ... },
    "product": { ... },
    "collector": { ... }
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
  "product_id": 1,
  "quantity": 50.50,
  "unit": "kg",
  "collection_date": "2025-12-27",
  "collection_time": "14:30:00",
  "notes": "Morning collection"
}
```

**Response:** `201 Created`

*Note: Rate is automatically determined based on product and collection date*

### Update Collection

```http
PUT /collections/{id}
```

**Response:** `200 OK`

### Delete Collection

```http
DELETE /collections/{id}
```

**Response:** `200 OK`

## Payment Endpoints

### List Payments

```http
GET /payments
```

**Query Parameters:**
- `supplier_id` (integer): Filter by supplier
- `payment_type` (string): Filter by type
- `date_from` (date): Filter from date
- `date_to` (date): Filter to date
- `page` (integer): Page number
- `per_page` (integer): Items per page

**Response:** `200 OK`

### Get Payment

```http
GET /payments/{id}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "supplier_id": 1,
    "amount": 5000.0000,
    "payment_type": "advance",
    "payment_date": "2025-12-27",
    "payment_method": "bank_transfer",
    "reference_number": "TXN123456",
    "notes": "Advance payment",
    "created_at": "2025-12-27T10:00:00.000000Z",
    "supplier": { ... }
  }
}
```

### Create Payment

```http
POST /payments
```

**Request Body:**
```json
{
  "supplier_id": 1,
  "amount": 5000.00,
  "payment_type": "advance",
  "payment_date": "2025-12-27",
  "payment_method": "bank_transfer",
  "reference_number": "TXN123456",
  "notes": "Advance payment"
}
```

**Payment Types:**
- `advance`: Advance payment
- `partial`: Partial payment
- `final`: Final payment
- `adjustment`: Payment adjustment

**Response:** `201 Created`

### Update Payment

```http
PUT /payments/{id}
```

**Response:** `200 OK`

### Delete Payment

```http
DELETE /payments/{id}
```

**Response:** `200 OK`

### Calculate Payment

```http
POST /payments/calculate
```

**Request Body:**
```json
{
  "supplier_id": 1,
  "date_from": "2025-12-01",
  "date_to": "2025-12-31"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "supplier_id": 1,
    "period": {
      "from": "2025-12-01",
      "to": "2025-12-31"
    },
    "collections": {
      "count": 30,
      "total_amount": 150000.00
    },
    "payments": {
      "count": 3,
      "total_amount": 100000.00
    },
    "balance": 50000.00
  }
}
```

## Dashboard Endpoints

### Get Dashboard Stats

```http
GET /dashboard/stats
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_suppliers": 25,
    "total_products": 10,
    "total_collections": 1500,
    "total_payments": 500,
    "outstanding_balance": 250000.00,
    "recent_collections": [ ... ],
    "recent_payments": [ ... ]
  }
}
```

### Get Recent Collections

```http
GET /dashboard/recent-collections
```

**Response:** `200 OK`

### Get Recent Payments

```http
GET /dashboard/recent-payments
```

**Response:** `200 OK`

## Audit Log Endpoints

### List Audit Logs

```http
GET /audit-logs
```

**Query Parameters:**
- `user_id` (integer): Filter by user
- `entity_type` (string): Filter by entity type
- `action` (string): Filter by action
- `date_from` (date): Filter from date
- `date_to` (date): Filter to date
- `page` (integer): Page number
- `per_page` (integer): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "action": "create",
      "entity_type": "Collection",
      "entity_id": 123,
      "old_values": null,
      "new_values": { ... },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "description": "Created new collection",
      "created_at": "2025-12-27T10:00:00.000000Z"
    }
  ]
}
```

### Get Audit Log

```http
GET /audit-logs/{id}
```

**Response:** `200 OK`

## Error Codes

| HTTP Status | Error Code | Description |
|------------|------------|-------------|
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Rate Limiting

API requests are limited to:
- **Authenticated users**: 60 requests per minute
- **Unauthenticated users**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1703692800
```

## Versioning

API version is included in the URL:
```
/api/v1/...
```

Current version: **v1**

## Support

For API support:
- Email: api-support@yourdomain.com
- Documentation: https://docs.yourdomain.com
- Issues: https://github.com/yourusername/TrackVault/issues
