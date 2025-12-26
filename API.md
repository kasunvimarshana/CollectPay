# Collectix API Documentation

Version: 1.0  
Base URL: `http://localhost:8000/api`  
Authentication: Bearer Token (Laravel Sanctum)

## Table of Contents

1. [Authentication](#authentication)
2. [Suppliers](#suppliers)
3. [Products](#products)
4. [Collections](#collections)
5. [Payments](#payments)
6. [Error Handling](#error-handling)

---

## Authentication

### Register User

**Endpoint:** `POST /register`

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

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector",
    "is_active": true
  },
  "token": "1|abc123def456..."
}
```

### Login

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector"
  },
  "token": "1|abc123def456..."
}
```

### Logout

**Endpoint:** `POST /logout`  
**Authentication:** Required

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User

**Endpoint:** `GET /user`  
**Authentication:** Required

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector",
    "permissions": ["collections.create", "collections.read"]
  }
}
```

---

## Suppliers

### List Suppliers

**Endpoint:** `GET /suppliers`  
**Authentication:** Required

**Query Parameters:**
- `is_active` (boolean): Filter by active status
- `search` (string): Search by name or code
- `region` (string): Filter by region
- `per_page` (integer): Results per page (default: 15)
- `page` (integer): Page number

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "code": "SUP001",
      "name": "ABC Suppliers",
      "phone": "+94771234567",
      "email": "abc@example.com",
      "address": "123 Main St, City",
      "region": "Western",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 75
}
```

### Get Supplier

**Endpoint:** `GET /suppliers/{id}`  
**Authentication:** Required

**Response (200):**
```json
{
  "id": 1,
  "code": "SUP001",
  "name": "ABC Suppliers",
  "phone": "+94771234567",
  "email": "abc@example.com",
  "address": "123 Main St, City",
  "region": "Western",
  "is_active": true,
  "total_collections": 15000.00,
  "total_payments": 12000.00,
  "outstanding_balance": 3000.00,
  "collections": [],
  "payments": []
}
```

### Create Supplier

**Endpoint:** `POST /suppliers`  
**Authentication:** Required

**Request Body:**
```json
{
  "code": "SUP001",
  "name": "ABC Suppliers",
  "phone": "+94771234567",
  "email": "abc@example.com",
  "address": "123 Main St, City",
  "region": "Western",
  "metadata": {
    "notes": "Premium supplier"
  },
  "is_active": true
}
```

**Response (201):** Same as Get Supplier

### Update Supplier

**Endpoint:** `PUT /suppliers/{id}`  
**Authentication:** Required

**Request Body:** Same as Create Supplier (all fields optional)

**Response (200):** Same as Get Supplier

### Delete Supplier

**Endpoint:** `DELETE /suppliers/{id}`  
**Authentication:** Required

**Response (200):**
```json
{
  "message": "Supplier deleted successfully"
}
```

### Get Supplier Balance

**Endpoint:** `GET /suppliers/{id}/balance`  
**Authentication:** Required

**Query Parameters:**
- `start_date` (date): Start date for calculation
- `end_date` (date): End date for calculation

**Response (200):**
```json
{
  "supplier": {...},
  "total_collections": 15000.00,
  "total_payments": 12000.00,
  "outstanding_balance": 3000.00
}
```

---

## Products

### List Products

**Endpoint:** `GET /products`  
**Authentication:** Required

**Query Parameters:**
- `is_active` (boolean): Filter by active status
- `search` (string): Search by name or code
- `per_page` (integer): Results per page

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "code": "PROD001",
      "name": "Tea Leaves",
      "description": "Premium tea leaves",
      "base_unit": "kg",
      "supported_units": ["kg", "g"],
      "is_active": true,
      "active_rates": [
        {
          "id": 1,
          "unit": "kg",
          "rate": 250.00,
          "effective_from": "2024-01-01",
          "effective_to": null,
          "is_active": true
        }
      ]
    }
  ]
}
```

### Get Product

**Endpoint:** `GET /products/{id}`  
**Authentication:** Required

**Response (200):**
```json
{
  "id": 1,
  "code": "PROD001",
  "name": "Tea Leaves",
  "description": "Premium tea leaves",
  "base_unit": "kg",
  "supported_units": ["kg", "g"],
  "is_active": true,
  "rates": [
    {
      "id": 1,
      "unit": "kg",
      "rate": 250.00,
      "effective_from": "2024-01-01",
      "effective_to": "2024-06-30",
      "is_active": false
    },
    {
      "id": 2,
      "unit": "kg",
      "rate": 275.00,
      "effective_from": "2024-07-01",
      "effective_to": null,
      "is_active": true
    }
  ]
}
```

### Create Product

**Endpoint:** `POST /products`  
**Authentication:** Required

**Request Body:**
```json
{
  "code": "PROD001",
  "name": "Tea Leaves",
  "description": "Premium tea leaves",
  "base_unit": "kg",
  "supported_units": ["kg", "g"],
  "is_active": true
}
```

**Response (201):** Same as Get Product

### Get Current Rates

**Endpoint:** `GET /products/{id}/current-rates`  
**Authentication:** Required

**Query Parameters:**
- `date` (date): Date for rate lookup (default: today)

**Response (200):**
```json
[
  {
    "id": 2,
    "unit": "kg",
    "rate": 275.00,
    "effective_from": "2024-07-01",
    "effective_to": null,
    "is_active": true
  }
]
```

### Add Product Rate

**Endpoint:** `POST /products/{id}/rates`  
**Authentication:** Required

**Request Body:**
```json
{
  "unit": "kg",
  "rate": 275.00,
  "effective_from": "2024-07-01",
  "effective_to": null
}
```

**Response (201):**
```json
{
  "id": 2,
  "product_id": 1,
  "unit": "kg",
  "rate": 275.00,
  "effective_from": "2024-07-01",
  "effective_to": null,
  "is_active": true
}
```

---

## Collections

### List Collections

**Endpoint:** `GET /collections`  
**Authentication:** Required

**Query Parameters:**
- `supplier_id` (integer): Filter by supplier
- `product_id` (integer): Filter by product
- `collector_id` (integer): Filter by collector
- `start_date` (date): Start date range
- `end_date` (date): End date range
- `per_page` (integer): Results per page

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "collection_number": "COL-20240101-00001",
      "supplier": {
        "id": 1,
        "name": "ABC Suppliers"
      },
      "product": {
        "id": 1,
        "name": "Tea Leaves"
      },
      "collector": {
        "id": 1,
        "name": "John Doe"
      },
      "collection_date": "2024-01-15",
      "quantity": 50.500,
      "unit": "kg",
      "rate_applied": 250.00,
      "total_amount": 12625.00,
      "version": 1
    }
  ]
}
```

### Create Collection

**Endpoint:** `POST /collections`  
**Authentication:** Required

**Request Body:**
```json
{
  "supplier_id": 1,
  "product_id": 1,
  "collection_date": "2024-01-15",
  "quantity": 50.5,
  "unit": "kg",
  "notes": "First collection of the month"
}
```

**Response (201):** Same as List Collections item

**Note:** Rate is automatically applied based on collection_date

### Update Collection

**Endpoint:** `PUT /collections/{id}`  
**Authentication:** Required

**Request Body:**
```json
{
  "quantity": 55.0,
  "notes": "Updated quantity",
  "version": 1
}
```

**Response (200):** Updated collection

**Note:** Version field is required for optimistic locking

---

## Payments

### List Payments

**Endpoint:** `GET /payments`  
**Authentication:** Required

**Query Parameters:**
- `supplier_id` (integer): Filter by supplier
- `payment_type` (string): advance, partial, final
- `start_date` (date): Start date range
- `end_date` (date): End date range

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "payment_number": "PAY-20240115-00001",
      "supplier": {
        "id": 1,
        "name": "ABC Suppliers"
      },
      "payment_type": "advance",
      "amount": 5000.00,
      "payment_date": "2024-01-15",
      "payment_method": "bank_transfer",
      "reference_number": "TXN123456"
    }
  ]
}
```

### Create Payment

**Endpoint:** `POST /payments`  
**Authentication:** Required

**Request Body:**
```json
{
  "supplier_id": 1,
  "payment_type": "partial",
  "amount": 5000.00,
  "payment_date": "2024-01-15",
  "payment_method": "bank_transfer",
  "reference_number": "TXN123456",
  "notes": "Partial payment",
  "collection_allocations": [
    {
      "collection_id": 1,
      "amount": 3000.00
    },
    {
      "collection_id": 2,
      "amount": 2000.00
    }
  ]
}
```

**Response (201):** Payment with collections

### Approve Payment

**Endpoint:** `POST /payments/{id}/approve`  
**Authentication:** Required (finance/admin role)

**Response (200):**
```json
{
  "id": 1,
  "approved_by": {
    "id": 2,
    "name": "Finance User"
  },
  ...
}
```

---

## Error Handling

### Error Response Format

```json
{
  "message": "Error description",
  "errors": {
    "field_name": [
      "Validation error message"
    ]
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

### Common Errors

**Validation Error (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

**Unauthorized (401):**
```json
{
  "message": "Unauthenticated."
}
```

**Optimistic Lock Error:**
```json
{
  "message": "Collection has been modified by another user. Please refresh and try again."
}
```

---

## Rate Limiting

- **General API**: 60 requests per minute
- **Authentication**: 10 requests per minute

Exceeded limits return `429 Too Many Requests`

## Versioning

Current API version: v1  
All endpoints are prefixed with `/api`

## Support

For API support or issues, please contact the development team or create an issue on GitHub.
