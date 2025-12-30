# Complete Swagger API Documentation

## Overview

This document describes the comprehensive Swagger/OpenAPI documentation implementation for the Data Collection and Payment Management API. All 45+ API endpoints are fully documented with request/response schemas, authentication requirements, and interactive testing capabilities.

## Documentation Details

- **API Version**: 1.0.0
- **Documentation Format**: OpenAPI 3.0
- **Interactive UI**: Available at `http://localhost:8000/api/documentation`
- **JSON Specification**: Available at `http://localhost:8000/docs/api-docs.json`
- **Total Endpoints**: 45 fully documented endpoints
- **Documentation Size**: 141KB (3,534 lines)

## API Endpoint Groups

### 1. Authentication (5 endpoints)
Complete JWT-based authentication system with token management.

- **POST** `/api/register` - Register new user with email and password
- **POST** `/api/login` - Authenticate user and receive JWT token
- **POST** `/api/logout` - Invalidate current JWT token
- **POST** `/api/refresh` - Refresh JWT token before expiration
- **GET** `/api/me` - Get authenticated user profile information

### 2. Users (5 endpoints)
Full CRUD operations for user management with role assignments.

- **GET** `/api/users` - List all users (with filtering by role, active status, search)
- **POST** `/api/users` - Create new user with role assignment
- **GET** `/api/users/{id}` - Get specific user details with role
- **PUT** `/api/users/{id}` - Update user information and role
- **DELETE** `/api/users/{id}` - Soft delete user account

### 3. Roles (5 endpoints)
Role-Based Access Control (RBAC) management.

- **GET** `/api/roles` - List all roles with user counts
- **POST** `/api/roles` - Create new role with permissions
- **GET** `/api/roles/{id}` - Get specific role with user count
- **PUT** `/api/roles/{id}` - Update role name and permissions
- **DELETE** `/api/roles/{id}` - Delete role (if no users assigned)

### 4. Suppliers (8 endpoints)
Comprehensive supplier management with balance and transaction tracking.

- **GET** `/api/suppliers` - List suppliers (with filtering and search)
- **POST** `/api/suppliers` - Create new supplier profile
- **GET** `/api/suppliers/{id}` - Get supplier details
- **PUT** `/api/suppliers/{id}` - Update supplier information
- **DELETE** `/api/suppliers/{id}` - Delete supplier
- **GET** `/api/suppliers/{id}/balance` - Calculate supplier balance
- **GET** `/api/suppliers/{id}/collections` - Get supplier's collections
- **GET** `/api/suppliers/{id}/payments` - Get supplier's payment history

### 5. Products (7 endpoints)
Product management with multi-unit support and rate tracking.

- **GET** `/api/products` - List products (with filtering)
- **POST** `/api/products` - Create product with multi-unit configuration
- **GET** `/api/products/{id}` - Get product details
- **PUT** `/api/products/{id}` - Update product and supported units
- **DELETE** `/api/products/{id}` - Delete product
- **GET** `/api/products/{id}/current-rate` - Get current rate for date/unit
- **GET** `/api/products/{id}/rate-history` - Get complete rate history

### 6. Rates (5 endpoints)
Versioned rate management with historical preservation.

- **GET** `/api/rates` - List rates (filter by product, unit, date)
- **POST** `/api/rates` - Create new rate version with effective dates
- **GET** `/api/rates/{id}` - Get specific rate details
- **PUT** `/api/rates/{id}` - Update rate and effective dates
- **DELETE** `/api/rates/{id}` - Delete rate (if not used in collections)

### 7. Collections (5 endpoints)
Daily collection tracking with automatic rate lookup and amount calculation.

- **GET** `/api/collections` - List collections (filter by supplier, product, date)
- **POST** `/api/collections` - Record new collection with auto-calculation
- **GET** `/api/collections/{id}` - Get collection details with relationships
- **PUT** `/api/collections/{id}` - Update collection with recalculation
- **DELETE** `/api/collections/{id}` - Delete collection record

### 8. Payments (5 endpoints)
Payment management with support for advance, partial, full, and adjustment types.

- **GET** `/api/payments` - List payments (filter by supplier, type, date)
- **POST** `/api/payments` - Record new payment (advance/partial/full)
- **GET** `/api/payments/{id}` - Get payment details with relationships
- **PUT** `/api/payments/{id}` - Update payment information
- **DELETE** `/api/payments/{id}` - Delete payment record

## Key Features

### 1. Comprehensive Documentation
- **Request Bodies**: Complete schemas with required fields, data types, and examples
- **Query Parameters**: Full descriptions with available filters, sorting, and pagination options
- **Response Schemas**: Detailed response structures for success and error cases
- **Authentication**: JWT Bearer token authentication documented for all protected endpoints

### 2. Interactive Testing
- **Try It Out**: Test any endpoint directly from the Swagger UI
- **Authorization**: Built-in authentication token management
- **Real-time Validation**: Immediate feedback on request validation
- **Response Preview**: View actual API responses with status codes

### 3. Multi-Unit Support
All product and collection endpoints support multiple units of measurement:
- Kilograms (kg), Grams (g), Pounds (lbs), Ounces (oz)
- Liters (l), Milliliters (ml)
- Units, Pieces, Boxes

### 4. Versioning & Concurrency
- Version tracking on collections, payments, and suppliers
- Optimistic locking for concurrent updates
- Historical rate preservation with version numbers

### 5. Advanced Filtering & Sorting
All list endpoints support:
- **Filtering**: By status, date ranges, relationships
- **Searching**: Full-text search across relevant fields
- **Sorting**: Configurable sort fields and order (asc/desc)
- **Pagination**: Configurable page size (default: 15, max: 100)

## Documentation Standards

### Request Documentation
Every endpoint includes:
- Operation ID (unique identifier)
- Summary (brief description)
- Detailed description
- Required authentication (where applicable)
- Request body schema (for POST/PUT)
- Query parameters (for filtering/sorting)
- Path parameters (for resource identification)

### Response Documentation
Every endpoint documents:
- **200/201**: Success responses with data schemas
- **401**: Unauthenticated (missing or invalid token)
- **404**: Resource not found
- **422**: Validation errors with error details

### Example Request/Response
Each endpoint provides:
- Example request payloads with realistic data
- Example response structures
- Field-level descriptions and constraints
- Enumerated values for restricted fields

## Security Documentation

### Authentication Scheme
```json
{
  "securityScheme": "bearerAuth",
  "type": "http",
  "scheme": "bearer",
  "bearerFormat": "JWT"
}
```

### Protected Endpoints
All endpoints except `/register` and `/login` require JWT authentication:
```
Authorization: Bearer {token}
```

## Accessing Documentation

### Local Development
1. Start the Laravel backend: `php artisan serve`
2. Access Swagger UI: http://localhost:8000/api/documentation
3. View JSON spec: http://localhost:8000/docs/api-docs.json

### Using the Interactive UI
1. Click on any endpoint to expand details
2. Click "Try it out" button
3. Fill in required parameters and request body
4. For protected endpoints, click "Authorize" and enter: `Bearer {your_token}`
5. Click "Execute" to send the request
6. View the response with status code and data

## Regenerating Documentation

To regenerate the Swagger documentation after making changes to annotations:

```bash
cd backend
php artisan l5-swagger:generate
```

## Documentation Maintenance

### Adding New Endpoints
1. Add OpenAPI annotations to the controller method
2. Include all required documentation elements:
   - @OA\Get, @OA\Post, @OA\Put, @OA\Delete
   - Path, tags, summary, description
   - Parameters, request bodies, responses
3. Regenerate documentation using `php artisan l5-swagger:generate`

### Annotation Format
```php
/**
 * @OA\Post(
 *     path="/api/endpoint",
 *     tags={"TagName"},
 *     summary="Brief description",
 *     description="Detailed description",
 *     operationId="uniqueOperationId",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(...),
 *     @OA\Response(response=201, description="Success"),
 *     @OA\Response(response=422, description="Validation error")
 * )
 */
```

## Integration with Frontend

The Swagger documentation serves as the authoritative API reference for frontend development:

1. **Type Generation**: Use the OpenAPI spec to generate TypeScript types
2. **Client Libraries**: Generate API client code from the specification
3. **Testing**: Use the documented examples for integration testing
4. **Validation**: Ensure frontend requests match documented schemas

## Quality Assurance

### Documentation Coverage
- ✅ All 45 endpoints documented
- ✅ All request/response schemas defined
- ✅ All query parameters documented
- ✅ All error responses included
- ✅ Authentication requirements specified
- ✅ Examples provided for all endpoints

### Validation
The documentation includes:
- Field-level validation rules
- Required vs optional fields
- Data type specifications
- Format constraints (email, date, etc.)
- Enum values for restricted fields
- Min/max values for numeric fields

## Best Practices

### API Usage
1. Always include the JWT token for protected endpoints
2. Use appropriate HTTP methods (GET for reading, POST for creating, etc.)
3. Handle all documented error responses
4. Respect pagination limits
5. Use filtering to reduce response size

### Documentation Updates
1. Update annotations when changing API behavior
2. Regenerate documentation after controller changes
3. Test endpoints in Swagger UI after updates
4. Keep examples realistic and up-to-date
5. Document breaking changes clearly

## Support and Resources

### Configuration
- **Config File**: `/backend/config/l5-swagger.php`
- **Storage Path**: `/backend/storage/api-docs/`
- **Views**: `/backend/resources/views/vendor/l5-swagger/`

### Package Information
- **Package**: darkaonline/l5-swagger ^9.0.1
- **Based On**: swagger-php and swagger-ui
- **Documentation**: https://github.com/DarkaOnLine/L5-Swagger

## Conclusion

The Swagger API documentation provides a complete, interactive, and always up-to-date reference for the Data Collection and Payment Management API. It serves as both technical documentation for developers and a testing tool for API validation, ensuring consistency between implementation and specification.

All 45 endpoints are fully documented with comprehensive request/response schemas, authentication requirements, and practical examples, making it easy for frontend developers, testers, and API consumers to understand and integrate with the system.
