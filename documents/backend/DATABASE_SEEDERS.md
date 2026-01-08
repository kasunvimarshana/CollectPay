# Database Seeders Documentation

This document provides information about the database seeders implemented in this application.

## Overview

The application includes comprehensive seeders for all required entities to ensure consistent, complete, and reliable initial data across the application. All seeders are designed to work together and handle dependencies properly.

## Available Seeders

### 1. RoleSeeder
**Path:** `database/seeders/RoleSeeder.php`

Creates default system roles with appropriate permissions:
- **Admin**: Full system access and management
- **Manager**: Manage collections, payments, and view reports
- **Collector**: Record collections and view basic information
- **Viewer**: View-only access to data

**Usage:**
```bash
php artisan db:seed --class=RoleSeeder
```

### 2. SupplierSeeder
**Path:** `database/seeders/SupplierSeeder.php`

Seeds 6 sample suppliers with realistic data including:
- Company names
- Unique supplier codes (SUP001-SUP006)
- Contact persons
- Phone numbers and emails
- Addresses and regions
- Active/inactive status

**Sample Data:**
- Green Valley Farms (California)
- Mountain Fresh Produce (Colorado)
- Coastal Growers Co. (Washington)
- Sunrise Agriculture (Arizona)
- Valley Harvest Inc. (Texas)
- Plains Produce Group (Nebraska) - Inactive

**Usage:**
```bash
# Run individual seeders (ensure dependency order: Roles → Suppliers → Products → Rates → Collections → Payments)
php artisan db:seed --class=SupplierSeeder

# Or better yet, run all seeders in correct order:
php artisan db:seed
```

> ⚠️ **Note**: When running individual seeders, ensure you follow the dependency order outlined below. It's recommended to use `php artisan db:seed` (DatabaseSeeder) which handles dependencies automatically.

### 3. ProductSeeder
**Path:** `database/seeders/ProductSeeder.php`

Seeds 8 common agricultural products with:
- Product names and unique codes (PROD001-PROD008)
- Descriptions
- Base units (kg, liter, etc.)
- Supported units arrays
- Active/inactive status

**Products:**
- Coconuts (kg, g, ton, piece)
- Latex (kg, g, ton, liter)
- Palm Oil (liter, ml, gallon)
- Cocoa Beans (kg, g, ton, lb)
- Coffee Beans (kg, g, ton, lb)
- Tea Leaves (kg, g, ton)
- Cashew Nuts (kg, g, ton, lb)
- Bananas (kg, g, ton, bunch) - Inactive

**Usage:**
```bash
php artisan db:seed --class=ProductSeeder
```

### 4. RateSeeder
**Path:** `database/seeders/RateSeeder.php`

Seeds historical rates for active products with:
- Multiple rate versions per product
- Date ranges (effective_from/effective_to)
- Active/inactive status based on date validity
- Support for different units

**Features:**
- Rate progression over time (Q1 2025 - Current)
- Handles expired and current rates
- Supports multiple units per product

**Dependencies:** Requires `ProductSeeder` to run first

**Usage:**
```bash
php artisan db:seed --class=RateSeeder
```

### 5. CollectionSeeder
**Path:** `database/seeders/CollectionSeeder.php`

Seeds 15 sample collection records spanning 3 months with:
- Links to suppliers, products, users, and rates
- Collection dates (October - December 2025)
- Quantities and units
- Calculated total amounts
- Notes

**Features:**
- Automatically finds appropriate rates for collection dates
- Calculates totals based on quantity × rate
- Distributes collections across multiple suppliers and products

**Dependencies:** 
- RoleSeeder
- SupplierSeeder
- ProductSeeder
- RateSeeder
- At least one active user

**Usage:**
```bash
php artisan db:seed --class=CollectionSeeder
```

### 6. PaymentSeeder
**Path:** `database/seeders/PaymentSeeder.php`

Seeds 14 sample payment records with:
- Links to suppliers and users
- Payment dates (October - December 2025)
- Various payment amounts
- Payment types (advance, partial, full, adjustment)
- Unique reference numbers (PAY10001-PAY10014)
- Payment methods (bank_transfer, check, cash)
- Notes

**Features:**
- Multiple payments per supplier
- Realistic payment progression over time
- Unique reference numbers guaranteed

**Dependencies:**
- RoleSeeder
- SupplierSeeder
- At least one active user

**Usage:**
```bash
php artisan db:seed --class=PaymentSeeder
```

### 7. DatabaseSeeder (Main Seeder)
**Path:** `database/seeders/DatabaseSeeder.php`

The main seeder that orchestrates all other seeders in the correct order:

1. Seeds roles
2. Creates admin and collector users
3. Seeds suppliers
4. Seeds products
5. Seeds rates
6. Seeds collections
7. Seeds payments

**Usage:**
```bash
php artisan db:seed
# or
php artisan migrate:fresh --seed
```

## Running Seeders

### Seed All Data
```bash
# In development/testing
php artisan db:seed

# In production (requires --force flag)
php artisan db:seed --force
```

### Seed Specific Seeder
```bash
php artisan db:seed --class=SupplierSeeder
php artisan db:seed --class=ProductSeeder
```

### Fresh Migration with Seeding
```bash
# WARNING: This drops all tables and recreates them
php artisan migrate:fresh --seed
```

### Testing Seeders
```bash
# Run seeder tests
php artisan test --filter=SeederTest
```

## Seeder Order Dependencies

The seeders must be run in this order to maintain referential integrity:

```
1. RoleSeeder (no dependencies)
2. Users (depends on RoleSeeder)
3. SupplierSeeder (no dependencies)
4. ProductSeeder (no dependencies)
5. RateSeeder (depends on ProductSeeder)
6. CollectionSeeder (depends on RoleSeeder, SupplierSeeder, ProductSeeder, RateSeeder, Users)
7. PaymentSeeder (depends on RoleSeeder, SupplierSeeder, Users)
```

## Data Volumes

After running all seeders, you will have:
- 4 Roles
- 2 Users (admin and collector)
- 6 Suppliers (5 active, 1 inactive)
- 8 Products (7 active, 1 inactive)
- 17 Rates (with historical data)
- 15 Collections (spanning 3 months)
- 14 Payments (spanning 3 months)

## Development Notes

### Adding New Seeders

1. Create seeder:
   ```bash
   php artisan make:seeder NewSeeder
   ```

2. Implement the `run()` method with data

3. Add to `DatabaseSeeder` in appropriate order

4. Create tests in `tests/Feature/SeederTest.php`

### Seeder Best Practices

1. **Use realistic data**: Sample data should reflect real-world scenarios
2. **Handle dependencies**: Check for required data before creating records
3. **Provide feedback**: Use `$this->command->info()` to show progress
4. **Test thoroughly**: Create comprehensive tests for all seeders
5. **Document well**: Keep this documentation updated

### Production Considerations

- **TestUserSeeder** includes a check to prevent running in production
- Main seeders can run in production but require `--force` flag
- Always backup data before running seeders in production
- Consider creating separate seeders for production vs. development

## Troubleshooting

### "Missing required data" warnings

**Cause:** Seeders were not run in the correct order

**Solution:** Run `php artisan db:seed` to execute all seeders in order

### "No rate found for product" warnings

**Cause:** Rate dates don't cover collection dates

**Solution:** Update `RateSeeder` to include rates for the required date ranges

### Duplicate key errors

**Cause:** Seeder has already been run and unique constraints are violated

**Solution:** 
```bash
php artisan migrate:fresh --seed
```

## Examples

### Seeding for Development
```bash
# Fresh start with all data
php artisan migrate:fresh --seed

# Verify data
php artisan tinker
>>> App\Models\Supplier::count()
=> 6
>>> App\Models\Collection::count()
=> 15
```

### Seeding Specific Data
```bash
# Only seed suppliers and products
php artisan db:seed --class=SupplierSeeder
php artisan db:seed --class=ProductSeeder
```

### Testing Workflow
```bash
# Run all tests including seeder tests
php artisan test

# Run only seeder tests
php artisan test --filter=SeederTest
```

## Additional Resources

- Laravel Seeding Documentation: https://laravel.com/docs/seeding
- Database Factories: `database/factories/`
- Migrations: `database/migrations/`
- Models: `app/Models/`
