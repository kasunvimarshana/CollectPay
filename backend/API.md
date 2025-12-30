# FieldLedger Platform API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Currently, authentication is not required for testing purposes. In production, all API endpoints will require authentication using Laravel Sanctum bearer tokens.

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details (development only)"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

## Suppliers API

### List Suppliers

Retrieve a paginated list of suppliers with optional filtering.

**Endpoint:** `GET /api/v1/suppliers`

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Items per page (default: 15, max: 100)
- `active` (boolean, optional): Filter by active status
- `search` (string, optional): Search in name, code, or email

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/suppliers?page=1&per_page=15&active=true&search=test" \
  -H "Accept: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0be03ea7-f7a6-4468-beec-ac3b7318a2ef",
      "name": "Test Supplier Company",
      "code": "TEST001",
      "email": "supplier@example.com",
      "phone": "+1234567890",
      "address": "123 Test Street, Test City",
      "active": true,
      "version": 1,
      "created_at": "2025-12-27 15:31:57",
      "updated_at": "2025-12-27 15:31:57"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 15,
    "last_page": 1
  }
}
```

### Get Supplier

Retrieve a single supplier by ID.

**Endpoint:** `GET /api/v1/suppliers/{id}`

**URL Parameters:**
- `id` (UUID, required): Supplier unique identifier

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/suppliers/0be03ea7-f7a6-4468-beec-ac3b7318a2ef" \
  -H "Accept: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "0be03ea7-f7a6-4468-beec-ac3b7318a2ef",
    "name": "Test Supplier Company",
    "code": "TEST001",
    "email": "supplier@example.com",
    "phone": "+1234567890",
    "address": "123 Test Street, Test City",
    "active": true,
    "version": 1,
    "created_at": "2025-12-27 15:31:57",
    "updated_at": "2025-12-27 15:31:57"
  }
}
```

**Error Response (Not Found):**
```json
{
  "success": false,
  "message": "Supplier not found with ID: {id}"
}
```

### Create Supplier

Create a new supplier.

**Endpoint:** `POST /api/v1/suppliers`

**Request Body:**
```json
{
  "name": "Supplier Name",
  "code": "SUP001",
  "email": "supplier@example.com",
  "phone": "+1234567890",
  "address": "Full Address"
}
```

**Field Validation:**
- `name` (string, required, max: 255): Supplier name
- `code` (string, required, max: 50, unique): Alphanumeric code with hyphens/underscores
- `email` (string, optional, email): Valid email address
- `phone` (string, optional, max: 50): Phone number
- `address` (string, optional, max: 1000): Full address

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/suppliers" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test Supplier Company",
    "code": "TEST001",
    "email": "supplier@example.com",
    "phone": "+1234567890",
    "address": "123 Test Street, Test City"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "id": "0be03ea7-f7a6-4468-beec-ac3b7318a2ef",
    "name": "Test Supplier Company",
    "code": "TEST001",
    "email": "supplier@example.com",
    "phone": "+1234567890",
    "address": "123 Test Street, Test City",
    "active": true,
    "version": 1,
    "created_at": "2025-12-27 15:31:57",
    "updated_at": "2025-12-27 15:31:57"
  }
}
```

**Validation Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "code": ["This supplier code already exists"],
    "email": ["Please provide a valid email address"]
  }
}
```

### Update Supplier

Update an existing supplier.

**Endpoint:** `PUT /api/v1/suppliers/{id}` or `PATCH /api/v1/suppliers/{id}`

**URL Parameters:**
- `id` (UUID, required): Supplier unique identifier

**Request Body:**
```json
{
  "name": "Updated Supplier Name",
  "email": "updated@example.com",
  "phone": "+1987654321",
  "address": "New Address"
}
```

**Field Validation:**
- `name` (string, required, max: 255): Supplier name
- `email` (string, optional, email): Valid email address
- `phone` (string, optional, max: 50): Phone number
- `address` (string, optional, max: 1000): Full address

**Note:** Supplier code cannot be changed after creation.

**Example Request:**
```bash
curl -X PUT "http://localhost:8000/api/v1/suppliers/0be03ea7-f7a6-4468-beec-ac3b7318a2ef" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Updated Supplier Name",
    "email": "updated@example.com"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Supplier updated successfully",
  "data": {
    "id": "0be03ea7-f7a6-4468-beec-ac3b7318a2ef",
    "name": "Updated Supplier Name",
    "code": "TEST001",
    "email": "updated@example.com",
    "phone": null,
    "address": null,
    "active": true,
    "version": 2,
    "created_at": "2025-12-27 15:31:57",
    "updated_at": "2025-12-27 15:32:22"
  }
}
```

**Note:** The `version` field is automatically incremented for optimistic locking support.

### Delete Supplier

Delete a supplier.

**Endpoint:** `DELETE /api/v1/suppliers/{id}`

**URL Parameters:**
- `id` (UUID, required): Supplier unique identifier

**Example Request:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/suppliers/0be03ea7-f7a6-4468-beec-ac3b7318a2ef" \
  -H "Accept: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

**Error Response (Not Found):**
```json
{
  "success": false,
  "message": "Supplier not found with ID: {id}"
}
```

## Status Codes

The API uses standard HTTP status codes:

- `200 OK`: Successful GET, PUT, PATCH, or DELETE request
- `201 Created`: Successful POST request that created a resource
- `400 Bad Request`: Invalid request syntax
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Rate Limiting

_(To be implemented)_

In production, API endpoints will be rate-limited to:
- Authenticated users: 60 requests per minute
- Unauthenticated: 20 requests per minute

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Current page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

Pagination metadata is included in the response:

```json
{
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 15,
    "last_page": 7
  }
}
```

## Data Integrity Features

### Version Control
All entities include a `version` field that increments with each update. This supports optimistic locking to prevent conflicting updates in multi-user scenarios.

### Timestamps
All entities include:
- `created_at`: ISO 8601 datetime when the entity was created
- `updated_at`: ISO 8601 datetime when the entity was last modified

### UUID Identifiers
All entities use UUID v4 as primary identifiers instead of auto-incrementing integers, providing:
- Global uniqueness
- Better security (non-sequential)
- Easier distributed system support

## Future Endpoints

The following endpoints will be added as development progresses:

- `/api/v1/products` - Product management with versioned rates
- `/api/v1/collections` - Collection tracking with multi-unit support
- `/api/v1/payments` - Payment management with automated calculations
- `/api/v1/users` - User management with RBAC/ABAC
- `/api/v1/auth` - Authentication endpoints (login, register, logout)

## Support

For API support or bug reports, please contact the development team.
