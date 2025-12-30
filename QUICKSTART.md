# Quick Start Guide

## FieldPay Ledger - Laravel Backend

### Prerequisites Check
```bash
php -v      # Should be 8.1 or higher
composer -V # Should show Composer version
mysql -V    # Or: psql --version
```

### Installation (5 minutes)

```bash
# 1. Clone and navigate
cd fieldpay-ledger/backend

# 2. Install dependencies
composer install

# 3. Environment setup
cp .env.example .env
php artisan key:generate

# 4. Configure database (edit .env file)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fieldpay_ledger
DB_USERNAME=root
DB_PASSWORD=your_password

# 5. Create database
mysql -u root -p -e "CREATE DATABASE fieldpay_ledger;"

# 6. Run migrations
php artisan migrate

# 7. Start server
php artisan serve
```

### Verify Installation

```bash
# Test endpoint
curl http://localhost:8000/api/v1/suppliers

# Expected: {"data":[],"meta":{"page":"1","per_page":"20"}}
```

### Create Your First Supplier

```bash
curl -X POST http://localhost:8000/api/v1/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Supplier",
    "code": "TEST001",
    "address": "123 Test St",
    "phone": "+1234567890",
    "email": "test@example.com"
  }'
```

### Next Steps

1. Read [ARCHITECTURE.md](backend/ARCHITECTURE.md) for architecture details
2. Read [IMPLEMENTATION.md](backend/IMPLEMENTATION.md) for API usage
3. Explore the codebase:
   - `src/Domain/` - Business logic
   - `src/Application/` - Use cases
   - `src/Infrastructure/` - Database
   - `app/Http/Controllers/Api/` - API endpoints

### Common Commands

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear

# Run migrations
php artisan migrate
php artisan migrate:fresh  # Reset database

# List routes
php artisan route:list

# Run tests (when available)
php artisan test
```

### Troubleshooting

**"Class not found" errors?**
```bash
composer dump-autoload
```

**Database connection error?**
- Check `.env` file database credentials
- Ensure database exists
- Ensure MySQL/PostgreSQL is running

**Port 8000 already in use?**
```bash
php artisan serve --port=8001
```

### API Testing Tools

- **cURL**: Command line (examples above)
- **Postman**: Import from `/docs/postman_collection.json` (when available)
- **Insomnia**: Import from `/docs/insomnia_collection.json` (when available)

### Development Workflow

1. Create Domain Entity/Value Object
2. Define Repository Interface
3. Create Use Case
4. Implement Repository (Eloquent)
5. Create Controller
6. Add Routes
7. Test API

### Support

- Documentation: See `/backend/ARCHITECTURE.md` and `/backend/IMPLEMENTATION.md`
- Issues: GitHub Issues
- Requirements: See `/SRS.md` and `/PRD.md`
