# API Examples

This document provides examples of common API operations.

## Authentication

### Register a New User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securepassword",
    "password_confirmation": "securepassword"
  }'
```

Response:
```json
{
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  },
  "token": "1|abcdef123456..."
}
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securepassword",
    "device_id": "device_123"
  }'
```

## Collections

### Create a Collection
```bash
curl -X POST http://localhost:8000/api/v1/collections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Q1 2024 Collections",
    "description": "First quarter collections",
    "status": "active",
    "metadata": {
      "region": "North",
      "category": "Monthly"
    }
  }'
```

### List Collections
```bash
curl -X GET "http://localhost:8000/api/v1/collections?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get a Specific Collection
```bash
curl -X GET http://localhost:8000/api/v1/collections/COLLECTION_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update a Collection
```bash
curl -X PUT http://localhost:8000/api/v1/collections/COLLECTION_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Q1 2024 Collections - Updated",
    "status": "inactive"
  }'
```

### Delete a Collection
```bash
curl -X DELETE http://localhost:8000/api/v1/collections/COLLECTION_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Payments

### Create a Payment (Idempotent)
```bash
curl -X POST http://localhost:8000/api/v1/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "collection_id": 1,
    "payer_id": 1,
    "amount": 150.50,
    "currency": "USD",
    "payment_method": "cash",
    "payment_date": "2024-01-15T10:30:00Z",
    "notes": "Monthly payment for January",
    "idempotency_key": "device_123_1705314600_abc123",
    "metadata": {
      "location": "Office A",
      "collected_by": "John Doe"
    }
  }'
```

### Batch Create Payments
```bash
curl -X POST http://localhost:8000/api/v1/payments/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payments": [
      {
        "collection_id": 1,
        "payer_id": 1,
        "amount": 100.00,
        "payment_method": "cash",
        "payment_date": "2024-01-15T10:00:00Z",
        "idempotency_key": "batch_1_item_1"
      },
      {
        "collection_id": 1,
        "payer_id": 2,
        "amount": 150.00,
        "payment_method": "card",
        "payment_date": "2024-01-15T10:05:00Z",
        "idempotency_key": "batch_1_item_2"
      }
    ]
  }'
```

### List Payments
```bash
curl -X GET "http://localhost:8000/api/v1/payments?status=completed&collection_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Payment Status
```bash
curl -X PUT http://localhost:8000/api/v1/payments/PAYMENT_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "completed",
    "processed_at": "2024-01-15T10:35:00Z"
  }'
```

## Rates

### Create a Rate
```bash
curl -X POST http://localhost:8000/api/v1/rates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Standard Monthly Rate",
    "description": "Default monthly collection rate",
    "amount": 100.00,
    "currency": "USD",
    "rate_type": "monthly",
    "collection_id": 1,
    "effective_from": "2024-01-01T00:00:00Z",
    "effective_until": "2024-12-31T23:59:59Z",
    "is_active": true,
    "metadata": {
      "category": "standard"
    }
  }'
```

### List Active Rates
```bash
curl -X GET http://localhost:8000/api/v1/rates/active/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Rate (Creates New Version)
```bash
curl -X PUT http://localhost:8000/api/v1/rates/RATE_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 120.00,
    "effective_from": "2024-07-01T00:00:00Z"
  }'
```

### Get Rate Versions
```bash
curl -X GET http://localhost:8000/api/v1/rates/RATE_UUID/versions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Synchronization

### Pull Data from Server
```bash
curl -X POST http://localhost:8000/api/v1/sync/pull \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "device_id": "device_123",
    "last_synced_at": "2024-01-15T00:00:00Z",
    "entity_types": ["collections", "payments", "rates"]
  }'
```

Response:
```json
{
  "data": {
    "collections": [...],
    "payments": [...],
    "rates": [...]
  },
  "synced_at": "2024-01-15T12:00:00Z",
  "has_more": false
}
```

### Push Local Changes to Server
```bash
curl -X POST http://localhost:8000/api/v1/sync/push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "device_id": "device_123",
    "data": {
      "collections": [
        {
          "uuid": "temp_123_abc",
          "name": "New Collection",
          "description": "Created offline",
          "status": "active",
          "version": 1
        }
      ],
      "payments": [
        {
          "uuid": "temp_456_def",
          "collection_id": 1,
          "payer_id": 1,
          "amount": 100.00,
          "payment_method": "cash",
          "payment_date": "2024-01-15T10:00:00Z",
          "idempotency_key": "offline_payment_1",
          "version": 1
        }
      ]
    }
  }'
```

Response:
```json
{
  "message": "Sync completed",
  "synced_at": "2024-01-15T12:05:00Z",
  "results": {
    "collections": [
      {
        "uuid": "temp_123_abc",
        "status": "created",
        "version": 1
      }
    ],
    "payments": [
      {
        "uuid": "temp_456_def",
        "status": "created",
        "version": 1
      }
    ],
    "conflicts": []
  }
}
```

### Resolve Conflicts
```bash
curl -X POST http://localhost:8000/api/v1/sync/resolve-conflicts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "conflicts": [
      {
        "uuid": "collection_uuid_123",
        "entity_type": "collection",
        "resolution": "server_wins"
      },
      {
        "uuid": "payment_uuid_456",
        "entity_type": "payment",
        "resolution": "client_wins",
        "merged_data": {
          "status": "completed",
          "notes": "Updated by client"
        }
      }
    ]
  }'
```

### Get Sync Status
```bash
curl -X GET "http://localhost:8000/api/v1/sync/status?device_id=device_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "collections": 10,
  "payments": 45,
  "rates": 5,
  "last_sync": {
    "collections": "2024-01-15T12:00:00Z",
    "payments": "2024-01-15T12:00:00Z",
    "rates": "2024-01-15T12:00:00Z"
  }
}
```

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
    "email": [
      "The email field is required."
    ],
    "amount": [
      "The amount must be a number."
    ]
  }
}
```

### 404 Not Found
```json
{
  "message": "Resource not found."
}
```

## Postman Collection

You can import these examples into Postman:

1. Create a new collection
2. Set up an environment variable for `BASE_URL` = `http://localhost:8000/api/v1`
3. Set up an environment variable for `TOKEN` = Your auth token
4. Use `{{BASE_URL}}` and `Bearer {{TOKEN}}` in your requests

## Testing Tips

1. **Use UUIDs correctly**: When testing updates/deletes, make sure to use the UUID from the created resource
2. **Idempotency keys**: Use unique keys for each payment to test idempotency
3. **Version numbers**: Increment version numbers when testing conflict scenarios
4. **Timestamps**: Use ISO 8601 format for all timestamps
5. **Device IDs**: Use consistent device IDs to test multi-device scenarios
