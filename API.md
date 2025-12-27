# TrackVault API Documentation

## Base URL

```
Development: http://localhost:8000/api
Production: https://api.yourdomain.com/api
```

## Authentication

All endpoints (except `/health` and `/auth/login`) require authentication via JWT token.

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication token |
| `FORBIDDEN` | User doesn't have permission |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Input validation failed |
| `CONFLICT` | Resource conflict (e.g., duplicate email) |
| `INTERNAL_ERROR` | Server error |

## Endpoints

### Health Check

#### Check API Health
```
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-27 10:00:00",
  "version": "1.0.0"
}
```

---

### Authentication

#### Login
```
POST /auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "roles": ["admin"],
      "permissions": ["users:create", "users:read"]
    }
  }
}
```

#### Logout
```
POST /auth/logout
```

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Refresh Token
```
POST /auth/refresh
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "new_token_here"
  }
}
```

---

### Users

#### List Users
```
GET /users?page=1&per_page=10
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 10, max: 100)

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "roles": ["admin"],
        "permissions": [],
        "created_at": "2025-12-27 10:00:00",
        "updated_at": "2025-12-27 10:00:00",
        "version": 1
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 50
    }
  }
}
```

#### Get User
```
GET /users/{id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["admin"],
    "permissions": [],
    "created_at": "2025-12-27 10:00:00",
    "updated_at": "2025-12-27 10:00:00",
    "version": 1
  }
}
```

#### Create User
```
POST /users
```

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "roles": ["collector"],
  "permissions": ["collections:create"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "new_uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "roles": ["collector"],
    "permissions": ["collections:create"],
    "created_at": "2025-12-27 10:00:00",
    "updated_at": "2025-12-27 10:00:00",
    "version": 1
  },
  "message": "User created successfully"
}
```

#### Update User
```
PUT /users/{id}
```

**Request Body**:
```json
{
  "name": "Jane Smith",
  "roles": ["collector", "manager"],
  "version": 1
}
```

**Response**: Same as Get User

#### Delete User
```
DELETE /users/{id}
```

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Suppliers

#### List Suppliers
```
GET /suppliers?page=1&per_page=10&search=tea
```

**Query Parameters**:
- `page` (optional): Page number
- `per_page` (optional): Items per page
- `search` (optional): Search query

**Response**: Similar to List Users with supplier data

#### Get Supplier
```
GET /suppliers/{id}
```

#### Create Supplier
```
POST /suppliers
```

**Request Body**:
```json
{
  "name": "ABC Tea Estate",
  "contact_person": "John Smith",
  "phone": "+1234567890",
  "email": "contact@abctea.com",
  "address": "123 Tea Lane, City, Country",
  "bank_account": "1234567890",
  "tax_id": "TAX123456",
  "metadata": {
    "region": "North",
    "established": "2010"
  }
}
```

#### Update Supplier
```
PUT /suppliers/{id}
```

#### Delete Supplier
```
DELETE /suppliers/{id}
```

---

### Products

#### List Products
```
GET /products?page=1&per_page=10
```

#### Get Product
```
GET /products/{id}
```

#### Create Product
```
POST /products
```

**Request Body**:
```json
{
  "name": "Green Tea Leaves",
  "description": "High-quality green tea leaves",
  "unit": "kg",
  "metadata": {
    "grade": "A",
    "origin": "Highland"
  }
}
```

#### Add Rate to Product
```
POST /products/{id}/rates
```

**Request Body**:
```json
{
  "amount": 50.00,
  "currency": "USD",
  "effective_from": "2025-01-01 00:00:00",
  "effective_to": null
}
```

#### Update Product
```
PUT /products/{id}
```

#### Delete Product
```
DELETE /products/{id}
```

---

### Collections

#### List Collections
```
GET /collections?page=1&supplier_id=uuid&product_id=uuid&start_date=2025-01-01&end_date=2025-01-31
```

**Query Parameters**:
- `supplier_id` (optional): Filter by supplier
- `product_id` (optional): Filter by product
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

#### Get Collection
```
GET /collections/{id}
```

#### Create Collection
```
POST /collections
```

**Request Body**:
```json
{
  "supplier_id": "uuid",
  "product_id": "uuid",
  "quantity": 100.5,
  "unit": "kg",
  "collection_date": "2025-12-27 10:00:00",
  "metadata": {
    "location": "Field A",
    "weather": "sunny"
  }
}
```

**Note**: Rate is automatically determined from product's current rate.

#### Update Collection
```
PUT /collections/{id}
```

#### Delete Collection
```
DELETE /collections/{id}
```

---

### Payments

#### List Payments
```
GET /payments?supplier_id=uuid&start_date=2025-01-01&end_date=2025-01-31
```

#### Get Payment
```
GET /payments/{id}
```

#### Create Payment
```
POST /payments
```

**Request Body**:
```json
{
  "supplier_id": "uuid",
  "amount": 5000.00,
  "currency": "USD",
  "type": "partial",
  "payment_method": "bank_transfer",
  "reference": "TXN123456",
  "payment_date": "2025-12-27 10:00:00",
  "metadata": {
    "bank": "ABC Bank",
    "account": "1234567890"
  }
}
```

**Payment Types**:
- `advance`: Advance payment
- `partial`: Partial payment
- `full`: Full settlement

#### Calculate Balance
```
GET /payments/calculate/{supplier_id}?start_date=2025-01-01&end_date=2025-12-31
```

**Response**:
```json
{
  "success": true,
  "data": {
    "supplier_id": "uuid",
    "total_owed": 10000.00,
    "total_paid": 5000.00,
    "balance": 5000.00,
    "currency": "USD",
    "period": {
      "start": "2025-01-01",
      "end": "2025-12-31"
    }
  }
}
```

#### Update Payment
```
PUT /payments/{id}
```

#### Delete Payment
```
DELETE /payments/{id}
```

---

## Pagination

All list endpoints support pagination:

```
GET /endpoint?page=1&per_page=20
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

## Versioning

All entities include a `version` field for optimistic locking:

When updating, include the current version:
```json
{
  "name": "Updated Name",
  "version": 5
}
```

If the version doesn't match (entity was modified by another user), the API returns:
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Entity has been modified by another process"
  }
}
```

## Rate Limiting

- **Authenticated requests**: 1000 requests per hour
- **Anonymous requests**: 100 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640606400
```

## CORS

Configure allowed origins in backend `.env`:
```
CORS_ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:19006
```

## Audit Logs

All operations are logged in the audit trail. Access audit logs:

```
GET /audit?entity_type=User&entity_id=uuid&limit=100
```

## Webhooks (Future Enhancement)

Webhook support for events:
- `user.created`
- `collection.created`
- `payment.created`
- `supplier.updated`

## Examples

### Complete Workflow Example

1. **Login**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

2. **Create Supplier**:
```bash
curl -X POST http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tea Estate","contact_person":"John","phone":"123","email":"tea@example.com","address":"123 St"}'
```

3. **Create Product**:
```bash
curl -X POST http://localhost:8000/api/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Green Tea","description":"Quality tea","unit":"kg"}'
```

4. **Add Product Rate**:
```bash
curl -X POST http://localhost:8000/api/products/{id}/rates \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"amount":50.0,"currency":"USD","effective_from":"2025-01-01"}'
```

5. **Record Collection**:
```bash
curl -X POST http://localhost:8000/api/collections \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"supplier_id":"uuid","product_id":"uuid","quantity":100,"unit":"kg","collection_date":"2025-12-27"}'
```

6. **Calculate Balance**:
```bash
curl -X GET "http://localhost:8000/api/payments/calculate/{supplier_id}" \
  -H "Authorization: Bearer {token}"
```

7. **Record Payment**:
```bash
curl -X POST http://localhost:8000/api/payments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"supplier_id":"uuid","amount":5000,"currency":"USD","type":"partial","payment_method":"bank","payment_date":"2025-12-27"}'
```

## Support

For API issues or questions, please refer to the main documentation or contact support.
