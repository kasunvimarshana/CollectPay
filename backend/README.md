# CollectPay Backend API

Production-ready Laravel backend for data collection and payment management with offline-first synchronization.

## Features

- **JWT Authentication** with RBAC and ABAC
- **RESTful API** with versioning
- **Offline-First Sync** with conflict resolution
- **Optimistic Locking** for concurrent updates
- **Transactional Operations** for data integrity
- **Encrypted Communication** (HTTPS required in production)
- **Multi-User Support** with role-based permissions

## Requirements

- PHP 8.1 or higher
- MySQL 5.7+ or MariaDB 10.3+
- Composer
- Redis (optional, for caching)

## Installation

### 1. Install Dependencies

```bash
composer install
```

### 2. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Edit `.env` and configure your database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=collectpay
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 3. Database Migration

```bash
php artisan migrate
```

### 4. Start Development Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api/v1`

## API Documentation

### Authentication

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "collector"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {...},
  "expires_in": 3600
}
```

### Synchronization

#### Full Sync (Push + Pull)
```http
POST /api/v1/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "device_id": "device-uuid",
  "last_sync_at": "2024-01-01T00:00:00Z",
  "entity_types": ["suppliers", "products", "rates", "collections", "payments"],
  "batch": [
    {
      "entity_type": "collections",
      "operation": "create",
      "data": {
        "uuid": "uuid-here",
        "supplier_id": 1,
        "product_id": 1,
        "collection_date": "2024-01-15",
        "quantity": 10.5,
        "version": 1
      }
    }
  ]
}
```

#### Push Only
```http
POST /api/v1/sync/push
Authorization: Bearer {token}
```

#### Pull Only
```http
POST /api/v1/sync/pull
Authorization: Bearer {token}
```

### Resources

All resource endpoints support standard REST operations:

- `GET /api/v1/suppliers` - List suppliers
- `POST /api/v1/suppliers` - Create supplier
- `GET /api/v1/suppliers/{id}` - Get supplier
- `PUT /api/v1/suppliers/{id}` - Update supplier
- `DELETE /api/v1/suppliers/{id}` - Delete supplier

Similar endpoints exist for:
- `/api/v1/products`
- `/api/v1/collections`
- `/api/v1/rates`
- `/api/v1/payments`

## Security

### Production Checklist

- [ ] Set `APP_ENV=production` and `APP_DEBUG=false`
- [ ] Use HTTPS/TLS for all API communication
- [ ] Configure strong JWT secrets
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Use environment variables for sensitive data
- [ ] Enable query logging for audit trails

### Role-Based Access Control (RBAC)

Roles:
- **admin**: Full system access
- **manager**: View and manage all data
- **collector**: Create collections, view own data

### Attribute-Based Access Control (ABAC)

Fine-grained permissions stored in user `permissions` JSON field.

## Sync Strategy

### Conflict Resolution

1. **Version-Based**: Uses optimistic locking with version numbers
2. **Timestamp-Based**: Compares update timestamps
3. **Server Wins**: Default strategy when conflicts detected
4. **Idempotent Operations**: Safe to retry using UUIDs

### Data Flow

```
Mobile Device              Server
     |                        |
     |---[Push Changes]------>|
     |                        |--[Process & Validate]
     |                        |--[Detect Conflicts]
     |                        |--[Apply Changes]
     |<--[Push Results]-------|
     |                        |
     |---[Pull Changes]------>|
     |                        |--[Fetch Updates]
     |<--[Server Changes]-----|
```

## Database Schema

### Core Tables

- `users` - User authentication and roles
- `suppliers` - Supplier master data
- `products` - Product master data
- `rates` - Time-versioned product rates
- `collections` - Daily collection records
- `payments` - Payment transactions
- `sync_queue` - Synchronization queue (optional)

## Performance

- Indexed queries for fast lookups
- Pagination for large datasets (default: 50 per page)
- Batch sync operations (default: 100 items)
- Query optimization with eager loading

## License

MIT License
