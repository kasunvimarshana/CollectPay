# PayCore Backend API

## Overview
This is the Laravel backend for the PayCore Data Collection and Payment Management System. It provides a RESTful API for managing suppliers, products, collections, and payments with multi-user support and data integrity.

## Features
- **Authentication**: Laravel Sanctum for API token-based authentication
- **CRUD Operations**: Full resource management for all entities
- **Multi-Unit Support**: Track quantities in multiple units (kg, g, l, ml, etc.)
- **Versioned Rates**: Historical rate management with automatic application
- **Automated Calculations**: Payment calculations based on collections and rates
- **Soft Deletes**: All records support soft deletion for data integrity
- **Audit Trail**: Created by and timestamp tracking on all entities

## Requirements
- PHP >= 8.2
- Composer
- MySQL or PostgreSQL database
- Laravel 12.x

## Installation

1. **Install Dependencies**
   ```bash
   cd backend
   composer install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database Setup**
   Update `.env` with your database credentials:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=paycore
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

4. **Run Migrations**
   ```bash
   php artisan migrate
   ```

5. **Start Development Server**
   ```bash
   php artisan serve
   ```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get access token
- `POST /api/logout` - Logout (requires auth)
- `GET /api/me` - Get current user (requires auth)

### Suppliers (requires auth)
- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Create a new supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Products (requires auth)
- `GET /api/products` - List all products
- `POST /api/products` - Create a new product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Product Rates (requires auth)
- `GET /api/product-rates` - List all product rates
- `POST /api/product-rates` - Create a new rate
- `GET /api/product-rates/{id}` - Get rate details
- `PUT /api/product-rates/{id}` - Update rate
- `DELETE /api/product-rates/{id}` - Delete rate

### Collections (requires auth)
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create a new collection
- `GET /api/collections/{id}` - Get collection details
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

### Payments (requires auth)
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create a new payment
- `GET /api/payments/{id}` - Get payment details
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

## Database Schema

### Users
- id, name, email, password, role, is_active, timestamps, soft deletes

### Suppliers
- id, name, contact_person, phone, email, address, registration_number, is_active, created_by, timestamps, soft deletes

### Products
- id, name, description, code, default_unit, is_active, created_by, timestamps, soft deletes

### Product Rates
- id, product_id, unit, rate, effective_from, effective_to, is_active, created_by, timestamps, soft deletes

### Collections
- id, supplier_id, product_id, product_rate_id, collection_date, quantity, unit, rate_applied, total_amount, notes, collected_by, timestamps, soft deletes

### Payments
- id, supplier_id, payment_date, amount, payment_type, payment_method, reference_number, notes, created_by, timestamps, soft deletes

## Architecture

### Clean Architecture Principles
- **Models**: Domain entities with business logic
- **Controllers**: API request handling and validation
- **Services**: Business logic layer (to be added for complex operations)
- **Repositories**: Data access layer (currently using Eloquent ORM directly)

### Security
- API authentication via Laravel Sanctum
- Password hashing with bcrypt
- SQL injection protection via Eloquent ORM
- CSRF protection for web routes
- Rate limiting on API routes

### Data Integrity
- Database transactions for critical operations
- Foreign key constraints
- Soft deletes for historical data preservation
- Automatic calculation of totals in Collection model
- Versioned rate management with historical preservation

## Testing
```bash
php artisan test
```

## Contributing
Follow PSR-12 coding standards and add tests for new features.

## License
Proprietary - All rights reserved
