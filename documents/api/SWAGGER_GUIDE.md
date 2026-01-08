# Swagger API Documentation Guide

## Overview

This application includes **interactive Swagger/OpenAPI documentation** for all API endpoints. The documentation provides a user-friendly interface to explore, test, and understand the API without writing code.

## Accessing Swagger Documentation

### Local Development
```
http://localhost:8000/api/documentation
```

### Production
```
https://your-domain.com/api/documentation
```

## Features

### 1. Interactive API Explorer
- **Browse all endpoints** organized by tags (Authentication, Suppliers, Products, etc.)
- **View request/response schemas** with detailed field descriptions
- **Test endpoints directly** from the browser
- **Authentication support** with JWT Bearer tokens

### 2. API Documentation Structure

The API is organized into the following categories:

#### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get JWT token
- `GET /api/me` - Get authenticated user details
- `POST /api/logout` - Logout and revoke token
- `POST /api/refresh` - Refresh JWT token

#### Suppliers
- `GET /api/suppliers` - List all suppliers with filtering
- `POST /api/suppliers` - Create new supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/{id}/balance` - Get supplier balance

#### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product with multi-unit support
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

#### Rates
- `GET /api/rates` - List all rates with versioning
- `POST /api/rates` - Create new rate version
- `GET /api/rates/{id}` - Get rate details
- `PUT /api/rates/{id}` - Update rate
- `DELETE /api/rates/{id}` - Delete rate

#### Collections
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create new collection entry
- `GET /api/collections/{id}` - Get collection details
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

#### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create new payment (advance/partial/full)
- `GET /api/payments/{id}` - Get payment details
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

## Using Swagger UI

### Step 1: Authentication

1. **Register or Login**
   - Navigate to the Authentication section
   - Use the `POST /api/login` endpoint
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "email": "admin@ledger.com",
       "password": "password"
     }
     ```
   - Click "Execute"
   - Copy the `token` from the response

2. **Authorize**
   - Click the "Authorize" button at the top
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize"
   - Now all protected endpoints will use this token

### Step 2: Testing Endpoints

1. **Expand any endpoint** (e.g., `GET /api/suppliers`)
2. **Click "Try it out"**
3. **Fill in parameters** (query parameters, request body, etc.)
4. **Click "Execute"**
5. **View the response** with status code, headers, and body

### Step 3: Understanding Responses

Each endpoint shows:
- **Request Parameters**: Query params, path params, request body schema
- **Response Codes**: 200 (Success), 401 (Unauthorized), 422 (Validation Error), etc.
- **Response Schema**: Expected structure of the response
- **Example Values**: Sample data for testing

## Example Workflows

### Workflow 1: Create a Supplier and Record Collection

1. **Login** (`POST /api/login`)
   ```json
   {
     "email": "admin@ledger.com",
     "password": "password"
   }
   ```

2. **Create Supplier** (`POST /api/suppliers`)
   ```json
   {
     "name": "ABC Tea Suppliers",
     "code": "SUP001",
     "region": "Central",
     "contact_person": "John Doe",
     "phone": "+94771234567",
     "email": "supplier@example.com",
     "is_active": true
   }
   ```

3. **Create Product** (`POST /api/products`)
   ```json
   {
     "name": "Tea Leaves",
     "code": "PROD001",
     "base_unit": "kg",
     "supported_units": ["kg", "g", "lbs"],
     "is_active": true
   }
   ```

4. **Create Rate** (`POST /api/rates`)
   ```json
   {
     "product_id": 1,
     "unit": "kg",
     "rate": 250.00,
     "effective_from": "2025-01-01",
     "is_active": true
   }
   ```

5. **Record Collection** (`POST /api/collections`)
   ```json
   {
     "supplier_id": 1,
     "product_id": 1,
     "quantity": 50.5,
     "unit": "kg",
     "collection_date": "2025-01-15"
   }
   ```

6. **Get Supplier Balance** (`GET /api/suppliers/1/balance`)
   - View total collected amount, payments, and balance

### Workflow 2: Multi-Unit Quantity Tracking

1. **Create product with multiple units**
   ```json
   {
     "name": "Milk",
     "code": "PROD002",
     "base_unit": "liter",
     "supported_units": ["liter", "ml", "gallon"]
   }
   ```

2. **Create rates for each unit**
   - Rate for liters: 150.00 per liter
   - Rate for ml: 0.15 per ml
   - Rate for gallons: 600.00 per gallon

3. **Record collections in different units**
   - Collection 1: 10 liters
   - Collection 2: 500 ml
   - Collection 3: 2 gallons

4. **System automatically calculates totals** using the appropriate rates

## Advanced Features

### 1. Filtering and Pagination

Most list endpoints support filtering:
```
GET /api/suppliers?is_active=true&search=ABC&per_page=20
```

### 2. Date Range Filtering

For collections and payments:
```
GET /api/collections?start_date=2025-01-01&end_date=2025-01-31&supplier_id=1
```

### 3. Rate Versioning

Get rates valid for a specific date:
```
GET /api/rates?product_id=1&date=2025-01-15
```

### 4. Multi-Unit Support

The system supports multiple units per product:
- Base unit (e.g., kg)
- Supported units (e.g., kg, g, lbs)
- Each unit can have its own rate
- Historical rate preservation

## Security

### JWT Bearer Authentication

All endpoints (except `/register` and `/login`) require authentication:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Token Expiration

- Default expiration: 3600 seconds (1 hour)
- Use `POST /api/refresh` to get a new token
- Tokens can be revoked using `POST /api/logout`

### Role-Based Access Control (RBAC)

The system implements RBAC with the following roles:
- **Admin**: Full access to all operations
- **Manager**: Manage suppliers, products, collections, payments
- **Collector**: Create collections and view suppliers
- **Accountant**: View all data, manage payments

## Regenerating Documentation

If you add new endpoints or modify existing ones:

```bash
cd backend
php artisan l5-swagger:generate
```

This will regenerate the `storage/api-docs/api-docs.json` file.

## OpenAPI Specification

The documentation follows **OpenAPI 3.0.0** specification:
- Standard format for REST API documentation
- Machine-readable JSON/YAML
- Compatible with various API tools (Postman, Insomnia, etc.)

### Downloading Specification

Access the raw OpenAPI JSON:
```
http://localhost:8000/docs/api-docs.json
```

Import this into:
- **Postman**: File → Import → Link
- **Insomnia**: Application → Import/Export → Import Data → URL
- **Other tools**: Use the JSON URL

## Production Deployment

### 1. Update Contact Information

Edit `backend/app/Http/Controllers/Controller.php` to update the contact email:
```php
/**
 * @OA\Contact(
 *     email="your-support@your-domain.com",
 *     name="API Support"
 * )
 */
```

### 2. Update Server URLs

Edit `backend/app/Http/Controllers/Controller.php` to update production URL:
```php
/**
 * @OA\Server(
 *     url="https://your-production-domain.com/api",
 *     description="Production Server"
 * )
 */
```

Or configure dynamically in `backend/config/l5-swagger.php`:
```php
'servers' => [
    [
        'url' => env('APP_URL') . '/api',
        'description' => 'Production Server'
    ]
]
```

### 3. Set Environment Variable

In `.env`:
```
APP_URL=https://your-production-domain.com
```

### 4. Regenerate Documentation

```bash
php artisan l5-swagger:generate
```

### 5. Secure Access (Optional)

Add middleware to protect Swagger UI in production:

Edit `config/l5-swagger.php`:
```php
'middleware' => [
    'api' => ['auth:api'],  // Require authentication
    'asset' => [],
    'docs' => ['auth:api'],
    'oauth2_callback' => [],
],
```

## Troubleshooting

### Issue: Swagger UI not loading

**Solution:**
```bash
php artisan l5-swagger:generate
php artisan cache:clear
php artisan config:clear
```

### Issue: Authorization not working

**Solution:**
1. Get a fresh token from `/api/login`
2. Click "Authorize" button
3. Enter: `Bearer YOUR_TOKEN` (include the word "Bearer")
4. Make sure there are no extra spaces

### Issue: Endpoints returning 404

**Solution:**
1. Check that the backend server is running
2. Verify the base URL in Swagger matches your backend
3. Check `routes/api.php` for correct route definitions

### Issue: Changes not reflected

**Solution:**
```bash
php artisan l5-swagger:generate --force
```

## Best Practices

1. **Always authenticate first** before testing protected endpoints
2. **Use example values** provided in the documentation as templates
3. **Check response codes** to understand what went wrong
4. **Test with small datasets** first before bulk operations
5. **Keep tokens secure** - don't share or commit them
6. **Refresh tokens** before they expire
7. **Log out** when done testing to revoke tokens

## Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [L5-Swagger Documentation](https://github.com/DarkaOnLine/L5-Swagger)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Laravel Documentation](https://laravel.com/docs)

## Support

For issues or questions about the API:
- Check this guide first
- Review the API Reference documentation
- Check application logs: `storage/logs/laravel.log`
- Contact: support@ledger.com

---

**Version:** 1.0.0  
**Last Updated:** December 29, 2025  
**Maintained by:** Development Team
