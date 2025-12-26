# PayTrack Backend API

## Laravel-based REST API for PayTrack data collection and payment management system

### Features

- **Authentication**: Laravel Sanctum with RBAC/ABAC
- **Multi-entity CRUD**: Suppliers, Products, Rates, Collections, Payments
- **Offline-first sync**: Bidirectional sync with conflict resolution
- **Versioned rates**: Time-based product pricing with history
- **Auto-calculations**: Automated payment allocations and balances
- **Optimistic locking**: Version-based conflict detection
- **Security**: Encrypted data, validated inputs, transactional operations

## Requirements

- PHP 8.1 or higher
- MySQL 5.7+ or MariaDB 10.3+
- Composer
- Laravel 10.x

## Installation

### 1. Install Dependencies

```bash
cd backend
composer install
```

### 2. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Configure Database

Edit `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paytrack
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Create Admin User (Optional)

```bash
php artisan tinker
```

Then run:

```php
\App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@paytrack.com',
    'password' => bcrypt('password'),
    'role' => 'admin',
    'is_active' => true
]);
```

### 6. Start Development Server

```bash
php artisan serve
```

API will be available at `http://localhost:8000`

## API Documentation

### Authentication

#### Register
```http
POST /api/v1/register
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
POST /api/v1/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "device_id": "device-uuid-here"
}
```

Response includes Bearer token for authentication.

### Suppliers

```http
GET    /api/v1/suppliers              # List all
GET    /api/v1/suppliers/{id}         # Get one
POST   /api/v1/suppliers              # Create
PUT    /api/v1/suppliers/{id}         # Update
DELETE /api/v1/suppliers/{id}         # Delete
GET    /api/v1/suppliers/{id}/balance # Get balance
```

### Products

```http
GET    /api/v1/products                    # List all
GET    /api/v1/products/{id}               # Get one
POST   /api/v1/products                    # Create
PUT    /api/v1/products/{id}               # Update
DELETE /api/v1/products/{id}               # Delete
GET    /api/v1/products/{id}/current-rate  # Get current rate
```

### Rates

```http
GET    /api/v1/rates          # List all
GET    /api/v1/rates/{id}     # Get one
POST   /api/v1/rates          # Create
PUT    /api/v1/rates/{id}     # Update
DELETE /api/v1/rates/{id}     # Delete
GET    /api/v1/rates/history  # Rate history
```

### Collections

```http
GET    /api/v1/collections         # List all
GET    /api/v1/collections/{id}    # Get one
POST   /api/v1/collections         # Create
PUT    /api/v1/collections/{id}    # Update
DELETE /api/v1/collections/{id}    # Delete
GET    /api/v1/collections/summary # Summary stats
```

### Payments

```http
GET    /api/v1/payments                      # List all
GET    /api/v1/payments/{id}                 # Get one
POST   /api/v1/payments                      # Create
PUT    /api/v1/payments/{id}                 # Update
DELETE /api/v1/payments/{id}                 # Delete
POST   /api/v1/payments/calculate-allocation # Calculate allocation
GET    /api/v1/payments/summary              # Summary stats
```

### Sync

```http
POST   /api/v1/sync/push       # Push local changes
POST   /api/v1/sync/pull       # Pull server changes
GET    /api/v1/sync/status     # Get sync status
POST   /api/v1/sync/changes    # Get changes since timestamp
```

## Sync API Usage

### Push Changes (Offline → Online)

```json
POST /api/v1/sync/push
Authorization: Bearer {token}

{
  "device_id": "device-uuid",
  "changes": [
    {
      "entity_type": "collections",
      "operation": "create",
      "data": {
        "uuid": "collection-uuid",
        "supplier_id": 1,
        "product_id": 1,
        "collection_date": "2024-01-15",
        "quantity": 50.5,
        "unit": "kg",
        "rate_applied": 25.00,
        "version": 1
      }
    }
  ]
}
```

### Pull Changes (Online → Offline)

```json
POST /api/v1/sync/pull
Authorization: Bearer {token}

{
  "device_id": "device-uuid",
  "last_sync": "2024-01-01T00:00:00Z",
  "entities": ["suppliers", "products", "rates", "collections", "payments"]
}
```

## Conflict Resolution

When version conflicts occur (409 status), the response includes:

```json
{
  "success": false,
  "conflict": true,
  "message": "Conflict detected",
  "data": {
    "server_version": 5,
    "server_data": { ... }
  }
}
```

Default strategy: **Server wins**. Client should update local data with server version.

## Security

- All endpoints (except register/login) require Bearer token authentication
- Passwords are bcrypt hashed
- Input validation on all endpoints
- SQL injection protection via Eloquent ORM
- CORS configured for frontend domains
- Rate limiting on API endpoints

## Database Schema

### Users
- Authentication and RBAC/ABAC
- Roles: admin, manager, collector

### Suppliers
- Supplier profile and contact info
- UUID for offline-first sync
- Soft deletes and versioning

### Products
- Product catalog with units
- Unique codes, categories

### Rates
- Time-based versioned rates
- Supplier-product specific
- Historical preservation

### Collections
- Daily collection records
- Frozen rate at collection time
- Auto-calculated totals

### Payments
- Payment transactions
- Type: advance, partial, full, adjustment
- Allocation tracking

### Sync Logs
- Complete sync audit trail
- Conflict detection and resolution
- Retry tracking

## Testing

```bash
php artisan test
```

## Production Deployment

1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Configure production database
3. Set up SSL/TLS
4. Configure CORS for your domains
5. Enable rate limiting
6. Set up queue workers for background jobs
7. Configure backup strategy
8. Set up monitoring and logging

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
