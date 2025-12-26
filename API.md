# API Documentation - TrackVault

Complete REST API reference for TrackVault backend.

## Base URL

```
Development: http://localhost:8000/api
Production: https://api.trackvault.com/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication.

**Authorization Header:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

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
    "is_active": true,
    "created_at": "2025-12-25T10:00:00.000000Z",
    "updated_at": "2025-12-25T10:00:00.000000Z"
  },
  "token": "1|abc123..."
}
```

### Login

Authenticate and receive access token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@trackvault.com",
  "password": "password"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@trackvault.com",
    "role": "admin",
    "is_active": true
  },
  "token": "1|abc123..."
}
```

### Logout

Revoke current access token.

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User

Retrieve authenticated user details.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@trackvault.com",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-12-25T10:00:00.000000Z",
  "updated_at": "2025-12-25T10:00:00.000000Z"
}
```

---

## Suppliers

### List Suppliers

**Endpoint:** `GET /suppliers`

**Query Parameters:**
- `search` (optional): Search by name, code, or email
- `is_active` (optional): Filter by active status (true/false)
- `per_page` (optional): Results per page (default: 15, max: 100)
- `page` (optional): Page number

**Example:** `GET /suppliers?search=Green&is_active=true&per_page=20`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Green Valley Farms",
      "code": "SUP-001",
      "address": "123 Valley Road, Kandy",
      "phone": "+94771234567",
      "email": "greenvalley@example.com",
      "is_active": true,
      "version": 1,
      "created_at": "2025-12-25T10:00:00.000000Z",
      "updated_at": "2025-12-25T10:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "per_page": 20,
  "total": 1
}
```

### Get Supplier

Retrieve single supplier with balance information.

**Endpoint:** `GET /suppliers/{id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Green Valley Farms",
  "code": "SUP-001",
  "address": "123 Valley Road, Kandy",
  "phone": "+94771234567",
  "email": "greenvalley@example.com",
  "is_active": true,
  "version": 1,
  "total_collections": 17580.00,
  "total_payments": 5000.00,
  "balance": 12580.00,
  "collections": [...],
  "payments": [...]
}
```

### Create Supplier

**Endpoint:** `POST /suppliers`

**Request Body:**
```json
{
  "name": "New Supplier",
  "code": "SUP-004",
  "address": "Address here",
  "phone": "+94771234567",
  "email": "newsupplier@example.com",
  "is_active": true
}
```

**Response:** `201 Created`

### Update Supplier

**Endpoint:** `PUT /suppliers/{id}`

**Request Body:**
```json
{
  "name": "Updated Supplier Name",
  "code": "SUP-004",
  "version": 1
}
```

**Response:** `200 OK`

**Note:** Version field is required for optimistic locking. If version mismatch occurs, returns 500 error.

### Delete Supplier

Soft delete a supplier.

**Endpoint:** `DELETE /suppliers/{id}`

**Response:** `200 OK`
```json
{
  "message": "Supplier deleted successfully"
}
```

### Get Supplier Balance

**Endpoint:** `GET /suppliers/{id}/balance`

**Response:** `200 OK`
```json
{
  "supplier_id": 1,
  "supplier_name": "Green Valley Farms",
  "total_collections": 17580.00,
  "total_payments": 5000.00,
  "balance": 12580.00
}
```

---

## Products

### List Products

**Endpoint:** `GET /products`

**Query Parameters:**
- `search` (optional): Search by name or code
- `is_active` (optional): Filter by active status
- `per_page` (optional): Results per page
- `page` (optional): Page number

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Tea Leaves",
      "code": "PROD-001",
      "description": "Fresh tea leaves",
      "default_unit": "kg",
      "supported_units": ["kg", "g"],
      "is_active": true,
      "version": 1,
      "rates": [...]
    }
  ]
}
```

### Get Product

**Endpoint:** `GET /products/{id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Tea Leaves",
  "code": "PROD-001",
  "description": "Fresh tea leaves",
  "default_unit": "kg",
  "supported_units": ["kg", "g"],
  "is_active": true,
  "version": 1,
  "rates": [
    {
      "id": 1,
      "unit": "kg",
      "rate": 120.00,
      "effective_date": "2025-11-25",
      "end_date": null,
      "is_active": true
    }
  ]
}
```

### Create Product

**Endpoint:** `POST /products`

**Request Body:**
```json
{
  "name": "New Product",
  "code": "PROD-004",
  "description": "Product description",
  "default_unit": "kg",
  "supported_units": ["kg", "g"],
  "is_active": true
}
```

**Response:** `201 Created`

### Update Product

**Endpoint:** `PUT /products/{id}`

**Request Body:**
```json
{
  "name": "Updated Product",
  "code": "PROD-004",
  "default_unit": "kg",
  "version": 1
}
```

**Response:** `200 OK`

### Delete Product

**Endpoint:** `DELETE /products/{id}`

**Response:** `200 OK`

---

## Product Rates

### List Product Rates

**Endpoint:** `GET /product-rates`

**Query Parameters:**
- `product_id` (optional): Filter by product
- `unit` (optional): Filter by unit
- `is_active` (optional): Filter by active status
- `per_page` (optional): Results per page
- `page` (optional): Page number

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "unit": "kg",
      "rate": 120.00,
      "effective_date": "2025-11-25",
      "end_date": null,
      "is_active": true,
      "version": 1,
      "product": {...}
    }
  ]
}
```

### Get Product Rate

**Endpoint:** `GET /product-rates/{id}`

**Response:** `200 OK`

### Create Product Rate

**Endpoint:** `POST /product-rates`

**Request Body:**
```json
{
  "product_id": 1,
  "unit": "kg",
  "rate": 125.00,
  "effective_date": "2025-12-26",
  "end_date": null,
  "is_active": true
}
```

**Response:** `201 Created`

**Note:** The system automatically applies the correct rate based on `effective_date` and `end_date` when creating collections.

### Update Product Rate

**Endpoint:** `PUT /product-rates/{id}`

**Request Body:**
```json
{
  "rate": 130.00,
  "version": 1
}
```

**Response:** `200 OK`

### Delete Product Rate

**Endpoint:** `DELETE /product-rates/{id}`

**Response:** `200 OK`

---

## Collections

### List Collections

**Endpoint:** `GET /collections`

**Query Parameters:**
- `supplier_id` (optional): Filter by supplier
- `product_id` (optional): Filter by product
- `from_date` (optional): Filter from date (YYYY-MM-DD)
- `to_date` (optional): Filter to date (YYYY-MM-DD)
- `per_page` (optional): Results per page
- `page` (optional): Page number

**Example:** `GET /collections?supplier_id=1&from_date=2025-12-01&to_date=2025-12-31`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "supplier_id": 1,
      "product_id": 1,
      "user_id": 2,
      "product_rate_id": 1,
      "collection_date": "2025-12-05",
      "quantity": 45.5,
      "unit": "kg",
      "rate_applied": 120.00,
      "total_amount": 5460.00,
      "notes": "Morning collection",
      "version": 1,
      "supplier": {...},
      "product": {...},
      "user": {...},
      "productRate": {...}
    }
  ]
}
```

### Get Collection

**Endpoint:** `GET /collections/{id}`

**Response:** `200 OK`

### Create Collection

System automatically applies the correct rate and calculates total amount.

**Endpoint:** `POST /collections`

**Request Body:**
```json
{
  "supplier_id": 1,
  "product_id": 1,
  "collection_date": "2025-12-25",
  "quantity": 50.5,
  "unit": "kg",
  "notes": "Afternoon collection"
}
```

**Response:** `201 Created`
```json
{
  "id": 7,
  "supplier_id": 1,
  "product_id": 1,
  "user_id": 2,
  "product_rate_id": 1,
  "collection_date": "2025-12-25",
  "quantity": 50.5,
  "unit": "kg",
  "rate_applied": 120.00,
  "total_amount": 6060.00,
  "notes": "Afternoon collection",
  "version": 1
}
```

**Automatic Calculations:**
- `rate_applied`: Fetched from product_rates based on collection_date
- `product_rate_id`: Set to the matching rate
- `total_amount`: Calculated as `quantity * rate_applied`
- `user_id`: Set to authenticated user

### Update Collection

**Endpoint:** `PUT /collections/{id}`

**Request Body:**
```json
{
  "quantity": 55.0,
  "version": 1
}
```

**Response:** `200 OK`

**Note:** Changing quantity recalculates `total_amount`. Changing product/unit/date refetches rate.

### Delete Collection

**Endpoint:** `DELETE /collections/{id}`

**Response:** `200 OK`

---

## Payments

### List Payments

**Endpoint:** `GET /payments`

**Query Parameters:**
- `supplier_id` (optional): Filter by supplier
- `payment_type` (optional): Filter by type (advance/partial/full)
- `from_date` (optional): Filter from date
- `to_date` (optional): Filter to date
- `per_page` (optional): Results per page
- `page` (optional): Page number

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "supplier_id": 1,
      "user_id": 3,
      "payment_date": "2025-12-10",
      "amount": 5000.00,
      "payment_type": "advance",
      "payment_method": "Cash",
      "reference_number": "PAY-001",
      "notes": "Advance payment",
      "version": 1,
      "supplier": {...},
      "user": {...}
    }
  ]
}
```

### Get Payment

**Endpoint:** `GET /payments/{id}`

**Response:** `200 OK`

### Create Payment

**Endpoint:** `POST /payments`

**Request Body:**
```json
{
  "supplier_id": 1,
  "payment_date": "2025-12-25",
  "amount": 3000.00,
  "payment_type": "partial",
  "payment_method": "Bank Transfer",
  "reference_number": "PAY-004",
  "notes": "Partial payment for December"
}
```

**Payment Types:**
- `advance`: Payment before collections
- `partial`: Partial payment against balance
- `full`: Full settlement of balance

**Response:** `201 Created`

### Update Payment

**Endpoint:** `PUT /payments/{id}`

**Request Body:**
```json
{
  "amount": 3500.00,
  "version": 1
}
```

**Response:** `200 OK`

### Delete Payment

**Endpoint:** `DELETE /payments/{id}`

**Response:** `200 OK`

---

## Error Responses

### 401 Unauthorized

```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found

```json
{
  "message": "Resource not found."
}
```

### 422 Validation Error

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "quantity": ["The quantity must be at least 0.001."]
  }
}
```

### 500 Version Mismatch

```json
{
  "message": "Version mismatch. Please refresh and try again."
}
```

---

## Rate Limiting

**Default**: 60 requests per minute per IP address

**Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
```

---

## Pagination

All list endpoints return paginated results:

```json
{
  "data": [...],
  "current_page": 1,
  "per_page": 15,
  "total": 50,
  "last_page": 4,
  "from": 1,
  "to": 15
}
```

---

## Data Types

### Supplier
```typescript
{
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  metadata?: object;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}
```

### Product
```typescript
{
  id: number;
  name: string;
  code: string;
  description?: string;
  default_unit: string;
  supported_units: string[];
  metadata?: object;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}
```

### Collection
```typescript
{
  id: number;
  supplier_id: number;
  product_id: number;
  user_id: number;
  product_rate_id: number;
  collection_date: string; // YYYY-MM-DD
  quantity: number;
  unit: string;
  rate_applied: number;
  total_amount: number;
  notes?: string;
  metadata?: object;
  version: number;
  created_at: string;
  updated_at: string;
}
```

### Payment
```typescript
{
  id: number;
  supplier_id: number;
  user_id: number;
  payment_date: string; // YYYY-MM-DD
  amount: number;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  metadata?: object;
  version: number;
  created_at: string;
  updated_at: string;
}
```

---

## Best Practices

1. **Always include version field** when updating to prevent concurrent modification issues
2. **Use pagination** for large datasets to improve performance
3. **Filter by date range** for collections and payments to reduce payload size
4. **Cache responses** when appropriate (e.g., product lists)
5. **Handle 401 errors** by refreshing token or redirecting to login
6. **Retry on 500 errors** with exponential backoff
7. **Validate data client-side** before sending to reduce API calls

---

**Version**: 1.0
**Last Updated**: 2025-12-25
