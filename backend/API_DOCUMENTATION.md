# API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

All API endpoints except `/register` and `/login` require authentication using JWT Bearer tokens.

Include the token in the Authorization header:
```
Authorization: Bearer {your_token_here}
```

### Register
**POST** `/register`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role_id": 1
}
```

### Login
**POST** `/login`

Request body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
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
**GET** `/me`

### Logout
**POST** `/logout`

### Refresh Token
**POST** `/refresh`

## Users

### List Users
**GET** `/users`

Query parameters:
- `per_page` (optional): Number of results per page (default: 15)
- `search` (optional): Search by name or email
- `is_active` (optional): Filter by active status

### Get User
**GET** `/users/{id}`

### Create User
**POST** `/users`

### Update User
**PUT** `/users/{id}`

### Delete User
**DELETE** `/users/{id}`

## Roles

### List Roles
**GET** `/roles`

### Get Role
**GET** `/roles/{id}`

### Create Role
**POST** `/roles`

Request body:
```json
{
  "name": "manager",
  "display_name": "Manager",
  "description": "Manages collections and payments",
  "permissions": ["collections.view", "collections.create"]
}
```

### Update Role
**PUT** `/roles/{id}`

### Delete Role
**DELETE** `/roles/{id}`

## Suppliers

### List Suppliers
**GET** `/suppliers`

Query parameters:
- `per_page` (optional): Number of results per page
- `search` (optional): Search by name, code, or region
- `is_active` (optional): Filter by active status

### Get Supplier
**GET** `/suppliers/{id}`

### Create Supplier
**POST** `/suppliers`

Request body:
```json
{
  "name": "ABC Suppliers",
  "code": "SUP001",
  "contact_person": "Jane Doe",
  "phone": "+1234567890",
  "email": "contact@abc.com",
  "address": "123 Main St",
  "region": "North",
  "is_active": true
}
```

### Update Supplier
**PUT** `/suppliers/{id}`

### Delete Supplier
**DELETE** `/suppliers/{id}`

### Get Supplier Balance
**GET** `/suppliers/{id}/balance`

Query parameters:
- `start_date` (optional): Start date for period
- `end_date` (optional): End date for period

Response:
```json
{
  "success": true,
  "data": {
    "supplier": { ... },
    "total_collected": 1500.00,
    "total_paid": 1000.00,
    "balance": 500.00,
    "period": {
      "start_date": "2025-01-01",
      "end_date": "2025-01-31"
    }
  }
}
```

### Get Supplier Collections
**GET** `/suppliers/{id}/collections`

Query parameters:
- `per_page` (optional)
- `start_date` (optional)
- `end_date` (optional)

### Get Supplier Payments
**GET** `/suppliers/{id}/payments`

Query parameters:
- `per_page` (optional)
- `start_date` (optional)
- `end_date` (optional)

## Products

### List Products
**GET** `/products`

Query parameters:
- `per_page` (optional)
- `search` (optional): Search by name or code
- `is_active` (optional)

### Get Product
**GET** `/products/{id}`

### Create Product
**POST** `/products`

Request body:
```json
{
  "name": "Tea Leaves",
  "code": "PROD001",
  "description": "Premium tea leaves",
  "base_unit": "kg",
  "supported_units": ["kg", "g", "ton"],
  "is_active": true
}
```

### Update Product
**PUT** `/products/{id}`

### Delete Product
**DELETE** `/products/{id}`

### Get Current Rate
**GET** `/products/{id}/current-rate`

Query parameters:
- `date` (optional): Date for which to get rate (default: today)
- `unit` (optional): Unit for rate (default: base_unit)

### Get Rate History
**GET** `/products/{id}/rate-history`

Query parameters:
- `unit` (optional): Filter by unit

## Rates

### List Rates
**GET** `/rates`

### Get Rate
**GET** `/rates/{id}`

### Create Rate
**POST** `/rates`

Request body:
```json
{
  "product_id": 1,
  "rate": 150.50,
  "unit": "kg",
  "effective_from": "2025-01-01",
  "effective_to": null,
  "is_active": true
}
```

### Update Rate
**PUT** `/rates/{id}`

### Delete Rate
**DELETE** `/rates/{id}`

## Collections

### List Collections
**GET** `/collections`

Query parameters:
- `per_page` (optional)
- `supplier_id` (optional)
- `product_id` (optional)
- `start_date` (optional)
- `end_date` (optional)

### Get Collection
**GET** `/collections/{id}`

### Create Collection
**POST** `/collections`

Request body:
```json
{
  "supplier_id": 1,
  "product_id": 1,
  "rate_id": 1,
  "collection_date": "2025-01-15",
  "quantity": 100.500,
  "unit": "kg",
  "rate_applied": 150.50,
  "total_amount": 15125.25,
  "notes": "Morning collection"
}
```

### Update Collection
**PUT** `/collections/{id}`

### Delete Collection
**DELETE** `/collections/{id}`

## Payments

### List Payments
**GET** `/payments`

Query parameters:
- `per_page` (optional)
- `supplier_id` (optional)
- `type` (optional): advance, partial, full, adjustment
- `start_date` (optional)
- `end_date` (optional)

### Get Payment
**GET** `/payments/{id}`

### Create Payment
**POST** `/payments`

Request body:
```json
{
  "supplier_id": 1,
  "payment_date": "2025-01-20",
  "amount": 5000.00,
  "type": "partial",
  "reference_number": "PAY001",
  "payment_method": "bank_transfer",
  "notes": "January payment"
}
```

### Update Payment
**PUT** `/payments/{id}`

### Delete Payment
**DELETE** `/payments/{id}`

## Error Responses

All endpoints return consistent error responses:

**Validation Error (422)**
```json
{
  "success": false,
  "errors": {
    "field_name": ["Error message"]
  }
}
```

**Unauthorized (401)**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Not Found (404)**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Testing

Default test users:
- Admin: `admin@ledger.com` / `password`
- Collector: `collector@ledger.com` / `password`
