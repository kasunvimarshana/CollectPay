# TransacTrack API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

## Core Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get token
- `POST /auth/logout` - Logout current session
- `GET /auth/user` - Get current user

### Suppliers
- `GET /suppliers` - List suppliers
- `POST /suppliers` - Create supplier
- `GET /suppliers/{id}` - Get supplier details
- `PUT /suppliers/{id}` - Update supplier
- `DELETE /suppliers/{id}` - Delete supplier
- `GET /suppliers/{id}/balance` - Get supplier balance
- `GET /suppliers/{id}/transactions` - Get supplier transactions

### Products
- `GET /products` - List products
- `POST /products` - Create product (Admin/Manager)
- `GET /products/{id}` - Get product details
- `PUT /products/{id}` - Update product
- `GET /products/{id}/current-rate` - Get current rate

### Product Rates
- `GET /product-rates` - List current rates (Admin/Manager)
- `POST /product-rates` - Create rate (Admin/Manager)
- `GET /products/{id}/rates` - Get product rate history

### Collections
- `GET /collections` - List collections
- `POST /collections` - Create collection
- `GET /collections/{id}` - Get collection details
- `PUT /collections/{id}` - Update collection
- `DELETE /collections/{id}` - Delete collection
- `GET /my-collections` - Get user's collections

### Payments
- `GET /payments` - List payments
- `POST /payments` - Create payment (Admin/Manager)
- `GET /payments/{id}` - Get payment details
- `PUT /payments/{id}` - Update payment (Admin/Manager)
- `DELETE /payments/{id}` - Delete payment (Admin/Manager)

### Sync
- `POST /sync/push` - Push offline data
- `GET /sync/pull` - Pull server updates
- `GET /sync/status` - Get sync queue status
- `GET /sync/conflicts` - List conflicts
- `POST /sync/resolve-conflict/{id}` - Resolve conflict

### Dashboard
- `GET /dashboard/stats` - Get statistics
- `GET /dashboard/recent-activity` - Get recent activity

For detailed request/response examples, see the full API documentation.
