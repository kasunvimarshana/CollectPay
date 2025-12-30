# API Reference Documentation

## Ledger API v1.0

Complete reference for all API endpoints.

---

## Base URL

```
Development: http://localhost:8000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Users](#users)
3. [Roles](#roles)
4. [Suppliers](#suppliers)
5. [Products](#products)
6. [Rates](#rates)
7. [Collections](#collections)
8. [Payments](#payments)

---

## Authentication Endpoints

### Register

Create a new user account.

**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role_id": 1,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

---

### Login

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": {
        "id": 1,
        "name": "administrator",
        "display_name": "Administrator"
      }
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

---

### Get Current User

Retrieve authenticated user information.

**Endpoint:** `GET /me`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "id": 1,
      "name": "administrator",
      "display_name": "Administrator",
      "permissions": ["create", "read", "update", "delete"]
    }
  }
}
```

---

### Logout

Invalidate the current JWT token.

**Endpoint:** `POST /logout`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Refresh Token

Get a new JWT token.

**Endpoint:** `POST /refresh`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

---

## Users

### List Users

Retrieve a paginated list of users.

**Endpoint:** `GET /users`

**Query Parameters:**
- `is_active` (optional): Filter by active status (0 or 1)
- `role_id` (optional): Filter by role ID
- `search` (optional): Search by name or email
- `per_page` (optional): Items per page (default: 15)
- `page` (optional): Page number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": {
          "id": 1,
          "name": "administrator"
        },
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000000Z"
      }
    ],
    "total": 50,
    "per_page": 15,
    "last_page": 4
  }
}
```

---

### Create User

Create a new user.

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role_id": 2,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": {
      "id": 2,
      "name": "collector"
    },
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000000Z"
  }
}
```

---

### Get User

Retrieve a specific user.

**Endpoint:** `GET /users/{id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "id": 1,
      "name": "administrator"
    },
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000000Z"
  }
}
```

---

### Update User

Update an existing user.

**Endpoint:** `PUT /users/{id}`

**Request Body:**
```json
{
  "name": "John Updated",
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john@example.com",
    "is_active": false
  }
}
```

---

### Delete User

Soft delete a user.

**Endpoint:** `DELETE /users/{id}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Suppliers

### List Suppliers

Retrieve a paginated list of suppliers.

**Endpoint:** `GET /suppliers`

**Query Parameters:**
- `is_active` (optional): Filter by active status
- `search` (optional): Search by name, code, or region
- `per_page` (optional): Items per page
- `page` (optional): Page number

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "ABC Tea Estate",
        "code": "ABC001",
        "contact_person": "John Manager",
        "phone": "+94771234567",
        "email": "abc@tea.com",
        "address": "123 Tea Road",
        "region": "Central",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000000Z"
      }
    ],
    "total": 25,
    "per_page": 15,
    "current_page": 1
  }
}
```

---

### Create Supplier

Create a new supplier.

**Endpoint:** `POST /suppliers`

**Request Body:**
```json
{
  "name": "XYZ Tea Estate",
  "code": "XYZ001",
  "contact_person": "Jane Manager",
  "phone": "+94777654321",
  "email": "xyz@tea.com",
  "address": "456 Tea Avenue",
  "region": "Southern",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "id": 2,
    "name": "XYZ Tea Estate",
    "code": "XYZ001",
    "region": "Southern",
    "is_active": true
  }
}
```

---

### Get Supplier

Retrieve a specific supplier.

**Endpoint:** `GET /suppliers/{id}`

---

### Update Supplier

Update an existing supplier.

**Endpoint:** `PUT /suppliers/{id}`

---

### Delete Supplier

Soft delete a supplier.

**Endpoint:** `DELETE /suppliers/{id}`

---

### Get Supplier Balance

Calculate supplier balance (collections minus payments).

**Endpoint:** `GET /suppliers/{id}/balance`

**Query Parameters:**
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "supplier": {
      "id": 1,
      "name": "ABC Tea Estate"
    },
    "total_collected": 15750.00,
    "total_paid": 10000.00,
    "balance": 5750.00,
    "period": {
      "start_date": "2025-01-01",
      "end_date": "2025-01-31"
    }
  }
}
```

---

### Get Supplier Collections

Retrieve collections for a supplier.

**Endpoint:** `GET /suppliers/{id}/collections`

**Query Parameters:**
- `start_date` (optional)
- `end_date` (optional)
- `per_page` (optional)

---

### Get Supplier Payments

Retrieve payments for a supplier.

**Endpoint:** `GET /suppliers/{id}/payments`

**Query Parameters:**
- `start_date` (optional)
- `end_date` (optional)
- `per_page` (optional)

---

## Products

### List Products

**Endpoint:** `GET /products`

**Query Parameters:**
- `is_active` (optional)
- `search` (optional)
- `per_page` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Tea Leaves",
        "code": "TEA001",
        "description": "Premium Ceylon Tea",
        "base_unit": "kg",
        "supported_units": ["kg", "g"],
        "is_active": true
      }
    ]
  }
}
```

---

### Create Product

**Endpoint:** `POST /products`

**Request Body:**
```json
{
  "name": "Tea Leaves",
  "code": "TEA001",
  "description": "Premium Ceylon Tea",
  "base_unit": "kg",
  "supported_units": ["kg", "g"],
  "is_active": true
}
```

---

### Get Product

**Endpoint:** `GET /products/{id}`

---

### Update Product

**Endpoint:** `PUT /products/{id}`

---

### Delete Product

**Endpoint:** `DELETE /products/{id}`

---

### Get Current Rate

Get the current rate for a product.

**Endpoint:** `GET /products/{id}/current-rate`

**Query Parameters:**
- `date` (optional): Date to check rate for (default: today)
- `unit` (optional): Unit to get rate for (default: base_unit)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Tea Leaves"
    },
    "rate": {
      "id": 5,
      "rate": 150.00,
      "unit": "kg",
      "effective_from": "2025-01-01",
      "effective_to": null
    },
    "date": "2025-01-15",
    "unit": "kg"
  }
}
```

---

### Get Rate History

Get historical rates for a product.

**Endpoint:** `GET /products/{id}/rate-history`

**Query Parameters:**
- `unit` (optional): Filter by unit

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Tea Leaves"
    },
    "unit": "kg",
    "rates": [
      {
        "id": 5,
        "rate": 150.00,
        "effective_from": "2025-01-01",
        "effective_to": null,
        "version": 3
      },
      {
        "id": 3,
        "rate": 140.00,
        "effective_from": "2024-07-01",
        "effective_to": "2024-12-31",
        "version": 2
      }
    ]
  }
}
```

---

## Rates

### List Rates

**Endpoint:** `GET /rates`

**Query Parameters:**
- `product_id` (optional)
- `unit` (optional)
- `is_active` (optional)
- `date` (optional): Filter by effective date
- `per_page` (optional)

---

### Create Rate

**Endpoint:** `POST /rates`

**Request Body:**
```json
{
  "product_id": 1,
  "rate": 150.00,
  "unit": "kg",
  "effective_from": "2025-01-01",
  "effective_to": null,
  "is_active": true
}
```

---

### Get Rate

**Endpoint:** `GET /rates/{id}`

---

### Update Rate

**Endpoint:** `PUT /rates/{id}`

---

### Delete Rate

**Endpoint:** `DELETE /rates/{id}`

**Note:** Cannot delete rates that are used in collections.

---

## Collections

### List Collections

**Endpoint:** `GET /collections`

**Query Parameters:**
- `supplier_id` (optional)
- `product_id` (optional)
- `user_id` (optional)
- `start_date` (optional)
- `end_date` (optional)
- `per_page` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "supplier": {
          "id": 1,
          "name": "ABC Tea Estate"
        },
        "product": {
          "id": 1,
          "name": "Tea Leaves"
        },
        "collection_date": "2025-01-15",
        "quantity": 10.5,
        "unit": "kg",
        "rate_applied": 150.00,
        "total_amount": 1575.00,
        "notes": "Morning collection",
        "user": {
          "id": 1,
          "name": "John Collector"
        },
        "created_at": "2025-01-15T08:30:00.000000Z"
      }
    ]
  }
}
```

---

### Create Collection

**Endpoint:** `POST /collections`

**Request Body:**
```json
{
  "supplier_id": 1,
  "product_id": 1,
  "collection_date": "2025-01-15",
  "quantity": 10.5,
  "unit": "kg",
  "notes": "Morning collection"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Collection created successfully",
  "data": {
    "id": 1,
    "supplier_id": 1,
    "product_id": 1,
    "collection_date": "2025-01-15",
    "quantity": 10.5,
    "unit": "kg",
    "rate_applied": 150.00,
    "total_amount": 1575.00,
    "version": 1
  }
}
```

---

### Get Collection

**Endpoint:** `GET /collections/{id}`

---

### Update Collection

**Endpoint:** `PUT /collections/{id}`

**Note:** Automatically recalculates rate and total amount based on current data.

---

### Delete Collection

**Endpoint:** `DELETE /collections/{id}`

---

## Payments

### List Payments

**Endpoint:** `GET /payments`

**Query Parameters:**
- `supplier_id` (optional)
- `user_id` (optional)
- `type` (optional): advance, partial, full, adjustment
- `start_date` (optional)
- `end_date` (optional)
- `per_page` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "supplier": {
          "id": 1,
          "name": "ABC Tea Estate"
        },
        "payment_date": "2025-01-20",
        "amount": 5000.00,
        "type": "partial",
        "reference_number": "PAY-2025-001",
        "payment_method": "Bank Transfer",
        "notes": "Partial payment for January",
        "user": {
          "id": 1,
          "name": "John Admin"
        },
        "created_at": "2025-01-20T10:00:00.000000Z"
      }
    ]
  }
}
```

---

### Create Payment

**Endpoint:** `POST /payments`

**Request Body:**
```json
{
  "supplier_id": 1,
  "payment_date": "2025-01-20",
  "amount": 5000.00,
  "type": "partial",
  "reference_number": "PAY-2025-001",
  "payment_method": "Bank Transfer",
  "notes": "Partial payment for January"
}
```

---

### Get Payment

**Endpoint:** `GET /payments/{id}`

---

### Update Payment

**Endpoint:** `PUT /payments/{id}`

---

### Delete Payment

**Endpoint:** `DELETE /payments/{id}`

---

## Error Responses

### Validation Error (422)

```json
{
  "success": false,
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

---

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

---

### Forbidden (403)

```json
{
  "success": false,
  "message": "This action is unauthorized."
}
```

---

### Not Found (404)

```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

### Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **Public endpoints**: 60 requests per minute
- **Authenticated endpoints**: 120 requests per minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 1672531200
```

---

## Pagination

Paginated responses include:

```json
{
  "current_page": 1,
  "data": [...],
  "first_page_url": "http://api.example.com/users?page=1",
  "from": 1,
  "last_page": 5,
  "last_page_url": "http://api.example.com/users?page=5",
  "next_page_url": "http://api.example.com/users?page=2",
  "path": "http://api.example.com/users",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15,
  "total": 75
}
```

---

## Versioning

Current API version: **v1.0**

Future versions will be accessible via:
```
/api/v2/...
```

---

**Last Updated:** December 2025
