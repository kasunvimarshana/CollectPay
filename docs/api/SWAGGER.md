# TrackVault - Swagger/OpenAPI Documentation

**Version:** 1.0.0  
**Last Updated:** December 26, 2025

---

## Overview

TrackVault API now includes comprehensive **Swagger/OpenAPI** documentation for all REST API endpoints. The interactive API documentation provides detailed information about:

- Authentication endpoints
- Request/response schemas
- Query parameters (sorting, filtering, pagination)
- Request body examples
- Response codes and error handling
- Try-it-out functionality for testing endpoints

---

## Accessing Swagger UI

### Development Environment

After starting the Laravel backend server, access the Swagger UI at:

```
http://localhost:8000/api/documentation
```

### Production Environment

```
https://your-domain.com/api/documentation
```

---

## Features

### 1. **Interactive API Explorer**
- Browse all available endpoints organized by tags
- View detailed request/response schemas
- Test endpoints directly from the browser

### 2. **Authentication Support**
- Built-in authentication using Bearer tokens
- Click "Authorize" button at the top
- Enter your token in the format: `Bearer {your-token-here}`
- All subsequent requests will include the authorization header

### 3. **Comprehensive Documentation**
Every endpoint includes:
- **Description**: What the endpoint does
- **Parameters**: Query parameters with types and descriptions
- **Request Body**: JSON schema with examples
- **Responses**: All possible response codes with examples
- **Tags**: Organized by resource type

---

## API Tags (Resource Groups)

### 🔐 Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `POST /api/auth/logout` - Revoke current token
- `GET /api/auth/me` - Get current user details

### 👥 Suppliers
- `GET /api/suppliers` - List suppliers (with pagination, search, sort)
- `POST /api/suppliers` - Create new supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/{id}/balance` - Get supplier balance

### 📦 Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### 💰 Product Rates
- `GET /api/product-rates` - List rates
- `POST /api/product-rates` - Create rate
- `GET /api/product-rates/{id}` - Get rate details
- `PUT /api/product-rates/{id}` - Update rate
- `DELETE /api/product-rates/{id}` - Delete rate

### 📊 Collections
- `GET /api/collections` - List collections (with date filters, sorting)
- `POST /api/collections` - Create collection
- `GET /api/collections/{id}` - Get collection details
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

### 💳 Payments
- `GET /api/payments` - List payments (with date filters, sorting)
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment details
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

---

## Common Query Parameters

All list endpoints support the following query parameters:

### Pagination
```
?page=1              # Page number (default: 1)
&per_page=25         # Items per page (default: 15, max: 100)
```

### Sorting
```
?sort_by=name        # Field to sort by
&sort_order=asc      # Sort direction: asc or desc
```

**Allowed sort fields by endpoint:**
- **Suppliers**: `name`, `code`, `created_at`, `updated_at`
- **Products**: `name`, `code`, `created_at`, `updated_at`
- **Collections**: `collection_date`, `quantity`, `total_amount`, `created_at`, `updated_at`
- **Payments**: `payment_date`, `amount`, `payment_type`, `created_at`, `updated_at`
- **Product Rates**: `effective_date`, `rate`, `unit`, `created_at`, `updated_at`

### Filtering
```
?search=query        # Search term (varies by endpoint)
&is_active=true      # Filter by active status
```

**Collections and Payments specific:**
```
?from_date=2025-01-01    # Start date (YYYY-MM-DD)
&to_date=2025-12-31      # End date (YYYY-MM-DD)
```

---

## Quick Start Guide

### Step 1: Start Backend Server

```bash
cd backend
php artisan serve
```

### Step 2: Access Swagger UI

Open your browser and navigate to:
```
http://localhost:8000/api/documentation
```

### Step 3: Authenticate

1. Click the **"Authorize"** button (🔒 icon) at the top
2. Get a token by logging in via the `/api/auth/login` endpoint
3. Enter the token in the format: `Bearer {your-token}`
4. Click "Authorize"
5. Click "Close"

### Step 4: Test Endpoints

1. Expand any endpoint by clicking on it
2. Click "Try it out" button
3. Fill in the required parameters
4. Click "Execute"
5. View the response below

---

## Example: Using Swagger UI

### 1. Login to Get Token

1. Expand `POST /api/auth/login`
2. Click "Try it out"
3. Enter request body:
   ```json
   {
     "email": "admin@trackvault.com",
     "password": "password"
   }
   ```
4. Click "Execute"
5. Copy the `token` from the response

### 2. Authorize with Token

1. Click "Authorize" button at the top
2. Enter: `Bearer {paste-your-token-here}`
3. Click "Authorize"

### 3. List Suppliers with Pagination and Sorting

1. Expand `GET /api/suppliers`
2. Click "Try it out"
3. Set parameters:
   - `per_page`: 25
   - `sort_by`: name
   - `sort_order`: asc
   - `search`: (optional)
4. Click "Execute"
5. View paginated results

### 4. Create a New Collection

1. Expand `POST /api/collections`
2. Click "Try it out"
3. Enter request body:
   ```json
   {
     "supplier_id": 1,
     "product_id": 1,
     "collection_date": "2025-12-26",
     "quantity": 45.5,
     "unit": "kg",
     "notes": "Morning collection"
   }
   ```
4. Click "Execute"
5. The response will include auto-calculated `rate_applied` and `total_amount`

---

## Regenerating Documentation

If you make changes to the API or add new endpoints with Swagger annotations:

```bash
cd backend
php artisan l5-swagger:generate
```

This will regenerate the `storage/api-docs/api-docs.json` file.

---

## Advanced Features

### Export OpenAPI Spec

The raw OpenAPI JSON specification is available at:
```
http://localhost:8000/docs/api-docs.json
```

This can be imported into tools like:
- Postman
- Insomnia
- API testing frameworks
- Code generators

### Custom Environments

You can configure different environments in your API client by using the server URLs:
- Development: `http://localhost:8000/api`
- Production: `https://api.trackvault.com/api`

---

## Configuration

Swagger settings are configured in `backend/config/l5-swagger.php`:

```php
return [
    'default' => 'default',
    'documentations' => [
        'default' => [
            'api' => [
                'title' => 'TrackVault API Documentation',
            ],
            'routes' => [
                'api' => 'api/documentation',  // UI route
            ],
        ],
    ],
];
```

---

## Security Considerations

### 1. **Production Environment**
- Consider adding middleware to protect the documentation route
- Options include:
  - IP whitelist
  - Basic authentication
  - Disable in production entirely

### 2. **Example Protection**

In `config/l5-swagger.php`:
```php
'middleware' => [
    'api' => ['auth:sanctum'],  // Require authentication
    'asset' => [],
    'docs' => [],
    'oauth2_callback' => [],
],
```

### 3. **Environment-Based Access**

```php
'routes' => [
    'api' => env('APP_ENV') === 'production' ? false : 'api/documentation',
],
```

---

## Annotations Reference

### Basic Endpoint Annotation

```php
/**
 * @OA\Get(
 *     path="/api/resource",
 *     tags={"Resource"},
 *     summary="List resources",
 *     description="Get paginated list of resources",
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(
 *         name="per_page",
 *         in="query",
 *         description="Results per page",
 *         required=false,
 *         @OA\Schema(type="integer", default=15)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Successful operation"
 *     ),
 *     @OA\Response(response=401, description="Unauthenticated")
 * )
 */
public function index(Request $request)
```

---

## Troubleshooting

### Documentation Not Loading

1. **Clear cache:**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

2. **Regenerate docs:**
   ```bash
   php artisan l5-swagger:generate
   ```

3. **Check permissions:**
   ```bash
   chmod -R 775 storage/api-docs
   ```

### Swagger UI Shows "Failed to Load"

1. **Verify route exists:**
   ```bash
   php artisan route:list | grep documentation
   ```

2. **Check storage folder:**
   ```bash
   ls -la storage/api-docs/
   ```

3. **Review error logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

---

## Benefits of Swagger Documentation

### For Developers
- ✅ Interactive testing without Postman/Insomnia
- ✅ Always up-to-date with code
- ✅ Self-documenting API
- ✅ Clear parameter and response schemas
- ✅ Validation examples

### For Frontend Teams
- ✅ Single source of truth
- ✅ Easy to understand request/response formats
- ✅ Can test endpoints before integration
- ✅ Export to client SDKs

### For QA Teams
- ✅ Test all endpoints systematically
- ✅ Understand expected behaviors
- ✅ Verify error handling
- ✅ Document test cases

---

## Related Documentation

- **[API.md](API.md)** - Detailed API reference with examples
- **[README.md](README.md)** - Project overview
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Setup guide
- **[SECURITY.md](SECURITY.md)** - Security best practices

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-26 | Initial Swagger documentation implementation |

---

**Status:** ✅ **COMPLETE**  
**Package Used:** darkaonline/l5-swagger ^9.0  
**OpenAPI Version:** 3.0

For support or questions, refer to the [L5-Swagger Documentation](https://github.com/DarkaOnLine/L5-Swagger).
