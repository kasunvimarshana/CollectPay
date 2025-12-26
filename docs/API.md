# FieldLedger API Documentation

Complete REST API documentation for the FieldLedger backend.

## Base URL

```
Production: https://api.fieldledger.com/api
Development: http://localhost:8000/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header.

```http
Authorization: Bearer {your-token-here}
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message",
  "status": 200
}
```

### Error Response
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Validation error message"]
  },
  "status": 422
}
```

## Authentication Endpoints

### Register User
Creates a new user account.

```http
POST /register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "collector"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector",
    "is_active": true
  },
  "token": "1|abc123xyz..."
}
```

### Login
Authenticates a user and returns a token.

```http
POST /login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "device_uuid": "unique-device-id",
  "device_name": "iPhone 14",
  "device_type": "ios"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector"
  },
  "token": "1|abc123xyz...",
  "device": {
    "id": 1,
    "device_uuid": "unique-device-id",
    "device_name": "iPhone 14",
    "device_type": "ios"
  }
}
```

### Logout
Revokes the current access token.

```http
POST /logout
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User
Returns the authenticated user's information.

```http
GET /me
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector",
    "permissions": ["suppliers.create", "transactions.create"],
    "is_active": true
  }
}
```

## Supplier Endpoints

### List Suppliers
Get paginated list of suppliers.

```http
GET /suppliers?page=1&per_page=15&status=active&search=ABC
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 15)
- `status` (optional): Filter by status (active, inactive, suspended)
- `search` (optional): Search by name, code, or phone

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "code": "SUP001",
      "name": "ABC Suppliers",
      "address": "123 Main St",
      "phone": "+1234567890",
      "email": "abc@example.com",
      "contact_person": "Jane Smith",
      "status": "active",
      "notes": "Regular supplier",
      "created_by": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "current_page": 1,
  "total": 50,
  "per_page": 15,
  "last_page": 4
}
```

### Get Supplier Details
Get detailed information about a specific supplier.

```http
GET /suppliers/{id}
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "supplier": {
    "id": 1,
    "code": "SUP001",
    "name": "ABC Suppliers",
    "address": "123 Main St",
    "phone": "+1234567890",
    "email": "abc@example.com",
    "status": "active",
    "transactions": [
      {
        "id": 1,
        "amount": 5000.00,
        "transaction_date": "2024-01-15T10:30:00Z"
      }
    ],
    "payments": [
      {
        "id": 1,
        "amount": 2000.00,
        "payment_date": "2024-01-16T10:30:00Z"
      }
    ]
  },
  "balance": 3000.00
}
```

### Create Supplier
Create a new supplier.

```http
POST /suppliers
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "SUP001",
  "name": "ABC Suppliers",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "abc@example.com",
  "contact_person": "Jane Smith",
  "status": "active",
  "notes": "Regular supplier"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Suppliers",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Update Supplier
Update an existing supplier.

```http
PUT /suppliers/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "ABC Suppliers Updated",
  "phone": "+1234567899",
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Suppliers Updated",
  "updated_at": "2024-01-15T11:30:00Z"
}
```

### Delete Supplier
Soft delete a supplier.

```http
DELETE /suppliers/{id}
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "message": "Supplier deleted successfully"
}
```

### Get Supplier Balance
Get detailed balance information for a supplier.

```http
GET /suppliers/{id}/balance
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "supplier_id": 1,
  "supplier_name": "ABC Suppliers",
  "total_debit": 15000.00,
  "total_credit": 8000.00,
  "balance": 7000.00,
  "as_of": "2024-01-15T12:00:00Z"
}
```

## Synchronization Endpoints

### Sync Transactions
Synchronize offline transactions with the server.

```http
POST /sync/transactions
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "device_id": 1,
  "transactions": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "supplier_id": 1,
      "product_id": 1,
      "quantity": 100,
      "unit": "kg",
      "rate": 50.00,
      "amount": 5000.00,
      "transaction_date": "2024-01-15T10:30:00Z",
      "notes": "Morning collection",
      "created_by": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "synced": [
    {
      "status": "created",
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "id": 1
    }
  ],
  "conflicts": [],
  "errors": []
}
```

### Sync Payments
Synchronize offline payments with the server.

```http
POST /sync/payments
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "device_id": 1,
  "payments": [
    {
      "uuid": "660e8400-e29b-41d4-a716-446655440000",
      "supplier_id": 1,
      "amount": 2000.00,
      "payment_type": "partial",
      "payment_method": "cash",
      "payment_date": "2024-01-15T10:30:00Z",
      "reference_number": "PAY001",
      "notes": "Cash payment",
      "created_by": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "synced": [
    {
      "status": "created",
      "uuid": "660e8400-e29b-41d4-a716-446655440000",
      "id": 1
    }
  ],
  "conflicts": [],
  "errors": []
}
```

### Get Updates
Get updates from the server since last sync.

```http
GET /sync/updates?device_id=1&last_sync=2024-01-15T10:00:00Z
Authorization: Bearer {token}
```

**Query Parameters:**
- `device_id` (required): Device ID
- `last_sync` (optional): Last sync timestamp

**Response:** `200 OK`
```json
{
  "transactions": [...],
  "payments": [...],
  "suppliers": [...],
  "products": [...],
  "rates": [...],
  "sync_timestamp": "2024-01-15T12:00:00Z"
}
```

## Health Check

### API Health
Check API health and status.

```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limiting

API requests are rate limited to prevent abuse:
- Authenticated users: 60 requests per minute
- Unauthenticated: 20 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1610720400
```

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

Response includes pagination metadata:
```json
{
  "data": [...],
  "current_page": 1,
  "total": 100,
  "per_page": 15,
  "last_page": 7,
  "from": 1,
  "to": 15
}
```

## Filtering & Searching

Most list endpoints support filtering and searching:
- `search`: Full-text search across relevant fields
- `status`: Filter by status
- `date_from`: Filter by start date
- `date_to`: Filter by end date

Example:
```http
GET /suppliers?search=ABC&status=active
```

## Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **Store Tokens Securely**: Use secure storage for auth tokens
3. **Handle Errors**: Implement proper error handling
4. **Respect Rate Limits**: Implement exponential backoff
5. **Cache When Possible**: Cache responses to reduce API calls
6. **Sync Efficiently**: Batch sync operations when possible

## SDKs & Libraries

- JavaScript/TypeScript: Axios client (included in frontend)
- PHP: Guzzle HTTP client
- Python: Requests library

## Support

For API support:
- Documentation: https://docs.fieldledger.com
- Email: api@fieldledger.com
- GitHub Issues: https://github.com/yourusername/FieldLedger/issues

---

Last Updated: 2024-01-01
