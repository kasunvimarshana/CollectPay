# Paywise API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
Most endpoints require authentication using Laravel Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Request Tracking

Every API request is assigned a unique **Request ID** for debugging and troubleshooting purposes. 

### Request ID Header
All API responses include an `X-Request-ID` header with a unique identifier in the format:
```
X-Request-ID: XXXX:XXXXXX:XXXXXX:XXXXXXX:XXXXXXXX
```

**Example:**
```
X-Request-ID: 47F0:6B87BA:BDD8DD:049924E:5974BF87
```

### Request ID in Error Responses
Error responses also include the request ID in the JSON body for easier debugging:
```json
{
  "message": "Error message",
  "request_id": "47F0:6B87BA:BDD8DD:049924E:5974BF87"
}
```

### Usage for Troubleshooting
When reporting issues or bugs, always include the Request ID from the failing request. This helps developers:
- Trace the request through logs
- Identify the exact request that caused an issue
- Debug multi-user and multi-device scenarios
- Correlate client-side and server-side events

### Client-Side Request ID
Clients can optionally provide their own Request ID by including the `X-Request-ID` header in the request. If provided, the server will use the client's ID instead of generating a new one.

## Endpoints

### Authentication

#### Register
- **POST** `/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "collector"
}
```
- **Response:** User object and auth token

#### Login
- **POST** `/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:** User object and auth token

#### Logout
- **POST** `/logout`
- **Auth:** Required
- **Response:** Success message

#### Get Current User
- **GET** `/user`
- **Auth:** Required
- **Response:** Current user object

### Suppliers

#### List Suppliers
- **GET** `/suppliers`
- **Auth:** Required
- **Query Parameters:**
  - `is_active` (boolean)
  - `search` (string)
  - `per_page` (number, default: 15)
- **Response:** Paginated list of suppliers

#### Create Supplier
- **POST** `/suppliers`
- **Auth:** Required
- **Body:**
```json
{
  "name": "Supplier Name",
  "code": "SUP001",
  "phone": "+1234567890",
  "email": "supplier@example.com",
  "address": "123 Main St",
  "location": "City, State",
  "is_active": true
}
```

#### Get Supplier
- **GET** `/suppliers/{id}`
- **Auth:** Required
- **Response:** Supplier object with total owed calculation

#### Update Supplier
- **PUT/PATCH** `/suppliers/{id}`
- **Auth:** Required
- **Body:** Same as create, all fields optional
- **Note:** Include `version` field for optimistic locking

#### Delete Supplier
- **DELETE** `/suppliers/{id}`
- **Auth:** Required
- **Response:** Success message

### Products

#### List Products
- **GET** `/products`
- **Auth:** Required
- **Query Parameters:**
  - `is_active` (boolean)
  - `search` (string)
  - `per_page` (number, default: 15)
- **Response:** Paginated list of products with current rates

#### Create Product
- **POST** `/products`
- **Auth:** Required
- **Body:**
```json
{
  "name": "Product Name",
  "code": "PROD001",
  "description": "Product description",
  "unit": "kg",
  "is_active": true,
  "rate": 10.50,
  "rate_effective_from": "2025-01-01"
}
```

#### Get Product
- **GET** `/products/{id}`
- **Auth:** Required
- **Response:** Product object with rate history

#### Update Product
- **PUT/PATCH** `/products/{id}`
- **Auth:** Required
- **Body:** Same as create, all fields optional
- **Note:** Include `version` field for optimistic locking

#### Delete Product
- **DELETE** `/products/{id}`
- **Auth:** Required

#### Add Product Rate
- **POST** `/products/{id}/rates`
- **Auth:** Required
- **Body:**
```json
{
  "rate": 12.00,
  "unit": "kg",
  "effective_from": "2025-02-01",
  "effective_to": null
}
```

### Collections

#### List Collections
- **GET** `/collections`
- **Auth:** Required
- **Query Parameters:**
  - `supplier_id` (number)
  - `product_id` (number)
  - `date_from` (date)
  - `date_to` (date)
  - `per_page` (number, default: 15)

#### Create Collection
- **POST** `/collections`
- **Auth:** Required
- **Body:**
```json
{
  "supplier_id": 1,
  "product_id": 1,
  "collection_date": "2025-12-25",
  "quantity": 100.5,
  "unit": "kg",
  "notes": "Morning collection"
}
```
- **Note:** Rate is automatically applied based on the product's current rate

#### Get Collection
- **GET** `/collections/{id}`
- **Auth:** Required

#### Update Collection
- **PUT/PATCH** `/collections/{id}`
- **Auth:** Required
- **Body:**
```json
{
  "collection_date": "2025-12-25",
  "quantity": 105.0,
  "notes": "Updated quantity",
  "version": 1
}
```

#### Delete Collection
- **DELETE** `/collections/{id}`
- **Auth:** Required

### Payments

#### List Payments
- **GET** `/payments`
- **Auth:** Required
- **Query Parameters:**
  - `supplier_id` (number)
  - `date_from` (date)
  - `date_to` (date)
  - `type` (advance|partial|full)
  - `per_page` (number, default: 15)

#### Create Payment
- **POST** `/payments`
- **Auth:** Required
- **Body:**
```json
{
  "supplier_id": 1,
  "payment_date": "2025-12-25",
  "amount": 1000.00,
  "type": "partial",
  "reference_number": "PAY001",
  "notes": "Partial payment"
}
```

#### Get Payment
- **GET** `/payments/{id}`
- **Auth:** Required

#### Update Payment
- **PUT/PATCH** `/payments/{id}`
- **Auth:** Required
- **Body:** Same as create, all fields optional
- **Note:** Include `version` field for optimistic locking

#### Delete Payment
- **DELETE** `/payments/{id}`
- **Auth:** Required

## Data Integrity Features

### Optimistic Locking
All updatable resources (suppliers, products, collections, payments) support optimistic locking through the `version` field. When updating, include the current version number. If the record has been modified by another user, you'll receive a 422 error.

### Multi-Unit Support
Collections support multiple units of measurement. The system automatically applies the correct rate based on the product's current rate for the specified unit.

### Rate Versioning
Product rates are versioned with effective dates. Historical rates are preserved, and new collections automatically use the current active rate.

### Soft Deletes
All main entities use soft deletes, allowing data recovery and maintaining referential integrity.

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 422 Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### 404 Not Found
```json
{
  "message": "Resource not found."
}
```

## Default Test Users

- **Admin:** admin@paywise.com / password
- **Manager:** manager@paywise.com / password
- **Collector:** collector@paywise.com / password

---

## User Management Endpoints

### List Users
- **GET** `/users`
- **Auth:** Required (Admin)
- **Query Parameters:**
  - `is_active` (boolean): Filter by active status
  - `role` (string): Filter by role (admin/manager/collector)
  - `search` (string): Search by name or email
  - `per_page` (int): Results per page (default: 15, max: 100)
- **Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "collector",
      "is_active": true,
      "version": 0,
      "created_at": "2025-12-25T10:00:00.000000Z",
      "updated_at": "2025-12-25T10:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "per_page": 15,
  "total": 1
}
```

### Create User
- **POST** `/users`
- **Auth:** Required (Admin)
- **Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "manager",
  "is_active": true
}
```
- **Response:** User object with success message

### Get User
- **GET** `/users/{id}`
- **Auth:** Required
- **Response:** User object

### Update User
- **PUT/PATCH** `/users/{id}`
- **Auth:** Required (Admin)
- **Body:**
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123",
  "role": "admin",
  "is_active": false,
  "version": 0
}
```
- **Response:** Updated user object

### Delete User
- **DELETE** `/users/{id}`
- **Auth:** Required (Admin)
- **Response:** Success message
- **Note:** Cannot delete your own account

### Toggle User Active Status
- **POST** `/users/{id}/toggle-active`
- **Auth:** Required (Admin)
- **Response:** Updated user object
- **Note:** Cannot deactivate your own account

---

## Product Rate Management Endpoints

### List Product Rates
- **GET** `/product-rates`
- **Auth:** Required
- **Query Parameters:**
  - `product_id` (int): Filter by product
  - `is_active` (boolean): Filter by active status
  - `unit` (string): Filter by unit
  - `effective_date` (date): Filter by effective date
  - `per_page` (int): Results per page
- **Response:**
```json
{
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "rate": "10.50",
      "unit": "kg",
      "effective_from": "2025-12-01",
      "effective_to": null,
      "is_active": true,
      "created_at": "2025-12-25T10:00:00.000000Z",
      "product": {
        "id": 1,
        "name": "Tea Leaves",
        "code": "TEA001"
      }
    }
  ]
}
```

### Create Product Rate
- **POST** `/product-rates`
- **Auth:** Required
- **Body:**
```json
{
  "product_id": 1,
  "rate": 12.00,
  "unit": "kg",
  "effective_from": "2025-12-25",
  "effective_to": null,
  "is_active": true
}
```
- **Response:** Product rate object with success message
- **Note:** Automatically deactivates overlapping rates

### Get Product Rate
- **GET** `/product-rates/{id}`
- **Auth:** Required
- **Response:** Product rate object with product details

### Update Product Rate
- **PUT/PATCH** `/product-rates/{id}`
- **Auth:** Required
- **Body:**
```json
{
  "rate": 13.00,
  "effective_to": "2025-12-31"
}
```
- **Response:** Updated product rate object

### Delete Product Rate
- **DELETE** `/product-rates/{id}`
- **Auth:** Required
- **Response:** Success message
- **Note:** Cannot delete if used in collections

### Get Rate History for Product
- **GET** `/product-rates/history/{productId}`
- **Auth:** Required
- **Response:**
```json
{
  "product": {
    "id": 1,
    "name": "Tea Leaves"
  },
  "rates": [
    {
      "id": 2,
      "rate": "12.00",
      "effective_from": "2025-12-25",
      "effective_to": null,
      "is_active": true
    },
    {
      "id": 1,
      "rate": "10.00",
      "effective_from": "2025-12-01",
      "effective_to": "2025-12-25",
      "is_active": false
    }
  ]
}
```

### Get Current Active Rate
- **GET** `/product-rates/current`
- **Auth:** Required
- **Query Parameters:**
  - `product_id` (int, required): Product ID
  - `unit` (string, required): Unit to get rate for
  - `date` (date, optional): Date to check (defaults to now)
- **Response:**
```json
{
  "rate": {
    "id": 1,
    "product_id": 1,
    "rate": "10.50",
    "unit": "kg",
    "effective_from": "2025-12-01",
    "effective_to": null,
    "is_active": true
  }
}
```

---

## Key Features

### Optimistic Locking
All major entities (users, suppliers, products, collections, payments) support optimistic locking using a `version` field:
- Include the current `version` number when updating
- If the version doesn't match, a 422 error is returned
- The version is automatically incremented on successful update

### Automatic Rate Application
When creating a collection:
- The system automatically finds the current active rate for the product and unit
- The rate is applied and stored with the collection
- Total amount is automatically calculated (quantity × rate)
- Historical rates are preserved for audit purposes

### Multi-Unit Support
- Products can have different rates for different units (kg, g, liters, etc.)
- Collections record the specific unit used
- Rates are unit-specific and version-controlled

### Data Integrity
- All DELETE operations are soft deletes (records are marked as deleted but not removed)
- Foreign key constraints maintain referential integrity
- Database transactions ensure atomic operations
- Optimistic locking prevents concurrent update conflicts

### Role-Based Access Control
- **Admin**: Full access to all resources including user management
- **Manager**: Access to suppliers, products, collections, and payments
- **Collector**: Access to create and view collections and payments

---

## Testing

The API includes comprehensive test coverage:
- **Unit Tests**: Model behavior and business logic
- **Integration Tests**: API endpoint functionality
- **Test Factories**: Generate test data easily

Run tests with:
```bash
php artisan test
```

---

## API Best Practices

1. **Always include version field when updating** to prevent concurrent update conflicts
2. **Use pagination** for listing endpoints to improve performance
3. **Handle 422 validation errors** appropriately in your client
4. **Store auth tokens securely** and refresh as needed
5. **Use appropriate roles** for different user types
6. **Check current rates** before creating collections manually (the API does this automatically)
7. **Test concurrency scenarios** in your application before production deployment
