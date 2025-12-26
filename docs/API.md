# FieldSyncLedger - API Documentation

## Base URL

```
Production: https://api.yourdomain.com/api
Development: http://localhost:8000/api
```

## Authentication

The API uses token-based authentication with Laravel Sanctum. Include the token in the `Authorization` header:

```
Authorization: Bearer {token}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## Endpoints

### Authentication

#### Register User

```
POST /auth/register
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

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "1|abc123...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "collector",
      "permissions": []
    }
  },
  "message": "Registration successful"
}
```

#### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "1|abc123...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "collector",
      "permissions": []
    }
  },
  "message": "Login successful"
}
```

#### Get Current User

```
GET /auth/user
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector",
    "permissions": [],
    "version": 1
  }
}
```

#### Logout

```
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

### Suppliers

#### List Suppliers

```
GET /suppliers?page=1
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": "uuid",
        "name": "Supplier Name",
        "code": "SUP001",
        "address": "123 Main St",
        "phone": "+1234567890",
        "email": "supplier@example.com",
        "notes": "Notes about supplier",
        "user_id": "uuid",
        "version": 1,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "deleted_at": null
      }
    ],
    "per_page": 50,
    "total": 100
  }
}
```

#### Get Supplier

```
GET /suppliers/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Supplier Name",
    "code": "SUP001",
    "address": "123 Main St",
    "phone": "+1234567890",
    "email": "supplier@example.com",
    "notes": "Notes",
    "user_id": "uuid",
    "version": 1,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

#### Create Supplier

```
POST /suppliers
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Supplier Name",
  "code": "SUP001",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "supplier@example.com",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Supplier Name",
    "code": "SUP001",
    ...
  },
  "message": "Supplier created successfully"
}
```

#### Update Supplier

```
PUT /suppliers/{id}
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "version": 1
}
```

**Note:** `version` field is required for optimistic locking.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "version": 2,
    ...
  },
  "message": "Supplier updated successfully"
}
```

**Version Conflict Response (409):**
```json
{
  "success": false,
  "message": "Version conflict detected",
  "errors": {
    "version": ["Server version is 3"]
  }
}
```

#### Delete Supplier

```
DELETE /suppliers/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Supplier deleted successfully"
}
```

### Products

#### List Products

```
GET /products?page=1
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": "uuid",
        "name": "Tea Leaves",
        "code": "TEA001",
        "unit": "kg",
        "description": "Green tea leaves",
        "user_id": "uuid",
        "version": 1,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
      }
    ],
    "per_page": 50,
    "total": 20
  }
}
```

#### Get Product

```
GET /products/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Tea Leaves",
    "code": "TEA001",
    "unit": "kg",
    "description": "Green tea leaves",
    "user_id": "uuid",
    "version": 1,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

#### Create Product

```
POST /products
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tea Leaves",
  "code": "TEA001",
  "unit": "kg",
  "description": "Green tea leaves"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Tea Leaves",
    "code": "TEA001",
    "unit": "kg",
    ...
  },
  "message": "Product created successfully"
}
```

#### Update Product

```
PUT /products/{id}
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "version": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "version": 2,
    ...
  },
  "message": "Product updated successfully"
}
```

#### Delete Product

```
DELETE /products/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Product deleted successfully"
}
```

### Synchronization

#### Pull Changes

Retrieve all data updated since the last sync.

```
GET /sync/pull?since=2024-01-01T00:00:00Z
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `since` (required): ISO 8601 timestamp of last successful sync

**Response:**
```json
{
  "success": true,
  "data": {
    "suppliers": [...],
    "products": [...],
    "rateVersions": [...],
    "collections": [...],
    "payments": [...],
    "timestamp": "2024-01-01T12:00:00.000000Z"
  }
}
```

#### Push Changes

Send local changes to the server in batches.

```
POST /sync/push
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "changes": [
    {
      "entityType": "supplier",
      "operation": "create",
      "entityId": "uuid",
      "data": {
        "name": "New Supplier",
        "code": "SUP002",
        ...
      },
      "clientTimestamp": "2024-01-01T10:00:00Z"
    },
    {
      "entityType": "collection",
      "operation": "create",
      "entityId": "uuid",
      "data": {
        "supplier_id": "uuid",
        "product_id": "uuid",
        "quantity": 100,
        ...
      },
      "clientTimestamp": "2024-01-01T10:05:00Z",
      "idempotencyKey": "unique-key-123"
    }
  ]
}
```

**Entity Types:**
- `supplier`
- `product`
- `rate_version`
- `collection`
- `payment`

**Operations:**
- `create`: Create new entity
- `update`: Update existing entity
- `delete`: Soft delete entity

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "syncedCount": 2,
    "conflicts": [],
    "errors": [],
    "timestamp": "2024-01-01T12:00:00.000000Z"
  }
}
```

**Response with Conflicts:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "syncedCount": 1,
    "conflicts": [
      {
        "entityType": "supplier",
        "entityId": "uuid",
        "serverVersion": 3,
        "clientVersion": 2,
        "resolution": "server_wins"
      }
    ],
    "errors": [],
    "timestamp": "2024-01-01T12:00:00.000000Z"
  }
}
```

**Response with Errors:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "syncedCount": 1,
    "conflicts": [],
    "errors": [
      {
        "entityType": "collection",
        "entityId": "uuid",
        "message": "Invalid product_id"
      }
    ],
    "timestamp": "2024-01-01T12:00:00.000000Z"
  }
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (version mismatch)
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse:
- Authenticated requests: 60 per minute
- Unauthenticated requests: 10 per minute

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

## Versioning

The API uses URL-based versioning (future):
```
https://api.yourdomain.com/api/v1/...
```

Current version is considered v1 (implicit).

## Best Practices

### Pagination

Always use pagination for list endpoints:
```
GET /suppliers?page=1&per_page=50
```

### Optimistic Locking

Always include the `version` field when updating:
```json
{
  "name": "Updated Name",
  "version": 1
}
```

### Idempotency

Use idempotency keys for collections and payments:
```json
{
  "idempotencyKey": "client-generated-uuid"
}
```

### Batch Sync

Send changes in batches of up to 100 items:
```json
{
  "changes": [
    // Max 100 changes per request
  ]
}
```

### Error Handling

Always check the `success` field:
```javascript
if (!response.success) {
  // Handle error
  console.error(response.message);
  console.error(response.errors);
}
```

## Testing

Use tools like Postman or curl for testing:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get suppliers (use token from login)
curl -X GET http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer 1|abc123..."
```

## Support

For API issues or questions:
- Check logs: `docker-compose logs backend`
- Review error messages in response
- Contact support team

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial API release
- Authentication endpoints
- Supplier CRUD
- Product CRUD
- Sync endpoints (pull/push)
- Optimistic locking
- Idempotency support
