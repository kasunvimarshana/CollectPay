# API Sorting, Filtering, and Pagination Guide

## Overview

All API list endpoints in the ledger system support comprehensive **sorting**, **filtering**, and **pagination** capabilities to provide flexible data retrieval and optimal performance.

## Common Parameters

### Pagination

All list endpoints support pagination with the following parameter:

- **`per_page`** (integer, optional): Number of results per page
  - Default: `15`
  - Maximum: `100`
  - Example: `?per_page=25`

Response includes pagination metadata:
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [...],
    "first_page_url": "http://localhost:8000/api/suppliers?page=1",
    "from": 1,
    "last_page": 5,
    "last_page_url": "http://localhost:8000/api/suppliers?page=5",
    "next_page_url": "http://localhost:8000/api/suppliers?page=2",
    "path": "http://localhost:8000/api/suppliers",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 75
  }
}
```

### Sorting

All list endpoints support flexible sorting:

- **`sort_by`** (string, optional): Field to sort by
  - Available fields vary by endpoint (see below)
  - Default varies by endpoint
  
- **`sort_order`** (string, optional): Sort direction
  - Values: `asc` (ascending), `desc` (descending)
  - Default: `desc`

Example: `?sort_by=name&sort_order=asc`

### Search

Most endpoints support full-text search:

- **`search`** (string, optional): Search term to filter results
  - Searches across multiple fields (varies by endpoint)
  - Case-insensitive partial matching
  - Example: `?search=tea`

## Endpoint-Specific Parameters

### 1. Users (`/api/users`)

**Filtering:**
- `is_active` (boolean): Filter by active status
- `role_id` (integer): Filter by role
- `search` (string): Search by name or email

**Sorting:**
- `sort_by`: `name`, `email`, `created_at`, `updated_at`
- Default: `created_at` (desc)

**Examples:**
```
GET /api/users?is_active=true&sort_by=name&sort_order=asc
GET /api/users?role_id=2&search=admin&per_page=20
GET /api/users?sort_by=email&sort_order=asc
```

### 2. Roles (`/api/roles`)

**Filtering:**
- `search` (string): Search by name or display_name

**Sorting:**
- `sort_by`: `name`, `display_name`, `created_at`, `updated_at`
- Default: `created_at` (desc)

**Examples:**
```
GET /api/roles?search=manager&sort_by=name
GET /api/roles?sort_by=display_name&sort_order=asc
```

### 3. Suppliers (`/api/suppliers`)

**Filtering:**
- `is_active` (boolean): Filter by active status
- `search` (string): Search by name, code, or region

**Sorting:**
- `sort_by`: `name`, `code`, `region`, `created_at`, `updated_at`
- Default: `created_at` (desc)

**Examples:**
```
GET /api/suppliers?is_active=true&search=central&sort_by=name
GET /api/suppliers?region=Western&sort_by=code&sort_order=asc
GET /api/suppliers?search=ABC&per_page=50
```

### 4. Products (`/api/products`)

**Filtering:**
- `is_active` (boolean): Filter by active status
- `search` (string): Search by name or code

**Sorting:**
- `sort_by`: `name`, `code`, `base_unit`, `created_at`, `updated_at`
- Default: `created_at` (desc)

**Examples:**
```
GET /api/products?is_active=true&sort_by=name&sort_order=asc
GET /api/products?search=tea&sort_by=code
GET /api/products?sort_by=base_unit
```

### 5. Rates (`/api/rates`)

**Filtering:**
- `product_id` (integer): Filter by product
- `unit` (string): Filter by unit (e.g., kg, g, lbs)
- `is_active` (boolean): Filter by active status
- `date` (date): Filter rates effective on a specific date (YYYY-MM-DD)

**Sorting:**
- `sort_by`: `rate`, `unit`, `effective_from`, `effective_to`, `version`, `created_at`, `updated_at`
- Default: `effective_from` (desc)

**Examples:**
```
GET /api/rates?product_id=1&unit=kg&sort_by=effective_from&sort_order=desc
GET /api/rates?date=2025-12-29&is_active=true
GET /api/rates?product_id=1&sort_by=version&sort_order=desc
```

### 6. Collections (`/api/collections`)

**Filtering:**
- `supplier_id` (integer): Filter by supplier
- `product_id` (integer): Filter by product
- `user_id` (integer): Filter by user who recorded the collection
- `start_date` (date): Filter collections from this date (YYYY-MM-DD)
- `end_date` (date): Filter collections until this date (YYYY-MM-DD)

**Sorting:**
- `sort_by`: `collection_date`, `quantity`, `total_amount`, `created_at`, `updated_at`
- Default: `collection_date` (desc)

**Examples:**
```
GET /api/collections?supplier_id=1&start_date=2025-01-01&end_date=2025-12-31
GET /api/collections?product_id=1&sort_by=quantity&sort_order=desc
GET /api/collections?start_date=2025-12-01&sort_by=total_amount&sort_order=desc
GET /api/collections?user_id=5&sort_by=collection_date&sort_order=asc
```

### 7. Payments (`/api/payments`)

**Filtering:**
- `supplier_id` (integer): Filter by supplier
- `user_id` (integer): Filter by user who recorded the payment
- `type` (string): Filter by payment type (`advance`, `partial`, `full`, `adjustment`)
- `start_date` (date): Filter payments from this date (YYYY-MM-DD)
- `end_date` (date): Filter payments until this date (YYYY-MM-DD)

**Sorting:**
- `sort_by`: `payment_date`, `amount`, `type`, `created_at`, `updated_at`
- Default: `payment_date` (desc)

**Examples:**
```
GET /api/payments?supplier_id=1&type=partial&start_date=2025-01-01
GET /api/payments?start_date=2025-12-01&sort_by=amount&sort_order=desc
GET /api/payments?type=advance&sort_by=payment_date&sort_order=asc
GET /api/payments?user_id=3&sort_by=amount&sort_order=desc
```

### 8. Supplier Collections (`/api/suppliers/{id}/collections`)

**Filtering:**
- `start_date` (date): Filter from this date
- `end_date` (date): Filter until this date

**Sorting:**
- `sort_by`: `collection_date`, `quantity`, `total_amount`
- Default: `collection_date` (desc)

**Examples:**
```
GET /api/suppliers/1/collections?start_date=2025-01-01&sort_by=quantity&sort_order=desc
GET /api/suppliers/1/collections?end_date=2025-12-31&sort_by=total_amount&sort_order=desc
```

### 9. Supplier Payments (`/api/suppliers/{id}/payments`)

**Filtering:**
- `start_date` (date): Filter from this date
- `end_date` (date): Filter until this date

**Sorting:**
- `sort_by`: `payment_date`, `amount`, `type`
- Default: `payment_date` (desc)

**Examples:**
```
GET /api/suppliers/1/payments?start_date=2025-01-01&sort_by=amount&sort_order=desc
GET /api/suppliers/1/payments?end_date=2025-12-31&sort_by=payment_date&sort_order=asc
```

## Combining Parameters

You can combine multiple parameters for powerful queries:

```
# Get active suppliers in Central region, sorted by name
GET /api/suppliers?is_active=true&search=central&sort_by=name&sort_order=asc&per_page=25

# Get collections for supplier 1 in December 2025, sorted by amount
GET /api/collections?supplier_id=1&start_date=2025-12-01&end_date=2025-12-31&sort_by=total_amount&sort_order=desc

# Get partial payments made by user 3, sorted by date
GET /api/payments?user_id=3&type=partial&sort_by=payment_date&sort_order=desc&per_page=50
```

## Security Considerations

- All sorting fields are validated against allowed lists to prevent SQL injection
- Invalid sort fields or orders fall back to secure defaults
- Maximum pagination size is enforced (100 items per page)
- All endpoints require JWT authentication
- RBAC/ABAC permissions are enforced per endpoint

## Performance Tips

1. **Use pagination**: Always specify `per_page` to limit result sizes
2. **Index-friendly sorting**: Prefer sorting by indexed fields (`id`, `created_at`, `updated_at`)
3. **Narrow filters first**: Apply specific filters before broad searches
4. **Date ranges**: Use specific date ranges to reduce result sets
5. **Combine filters**: Use multiple filters to get precise results

## Error Handling

Invalid parameters are handled gracefully:

- Invalid `sort_by` values: Falls back to default sorting
- Invalid `sort_order` values: Falls back to `desc`
- Invalid `per_page` values: Capped at maximum (100)
- Invalid dates: Returns validation error (422)

Example error response:
```json
{
  "success": false,
  "errors": {
    "start_date": ["The start date must be a valid date."]
  }
}
```

## Best Practices

1. **Always paginate**: Use reasonable `per_page` values (15-50)
2. **Sort explicitly**: Specify `sort_by` and `sort_order` for consistent results
3. **Filter before sorting**: Apply filters to reduce dataset before sorting
4. **Use date ranges**: Narrow down time-based queries with date filters
5. **Cache when appropriate**: Cache frequently accessed sorted/filtered results
6. **Monitor performance**: Track slow queries and optimize accordingly

## Swagger Documentation

All sorting and filtering parameters are documented in the Swagger UI at:
```
http://localhost:8000/api/documentation
```

You can test all parameters interactively using the "Try it out" feature.
