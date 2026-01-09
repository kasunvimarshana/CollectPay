# Database Migration Ordering Guide

## Overview
This document explains the proper ordering of database migrations in the CollectPay system to ensure referential integrity and prevent foreign key constraint violations during schema creation.

## Migration Execution Order

Laravel executes migrations in **alphabetical/chronological order** based on the timestamp prefix in the filename. The current order is:

### 1. Foundation Tables (0001_01_01_000000 - 0001_01_01_000003)
```
0001_01_01_000000_create_roles_table.php
0001_01_01_000001_create_users_table.php
0001_01_01_000002_create_cache_table.php
0001_01_01_000003_create_jobs_table.php
```

### 2. Audit and Core Business Tables (2025_12_28_110942 - 2025_12_28_110947)
```
2025_12_28_110942_create_audit_logs_table.php
2025_12_28_110943_create_products_table.php
2025_12_28_110944_create_suppliers_table.php
2025_12_28_110945_create_rates_table.php
2025_12_28_110946_create_payments_table.php
2025_12_28_110947_create_collections_table.php
```

### 3. Authentication and Enhancement Tables
```
2025_12_28_111410_create_personal_access_tokens_table.php
2025_12_29_064046_add_version_to_tables.php
2026_01_08_115112_add_composite_indices_for_performance.php
```

## Dependency Chain

### Level 1: Independent Tables (No Foreign Keys)
- **roles** - User role definitions
- **cache** - Laravel cache storage
- **jobs** - Laravel queue jobs
- **products** - Product catalog
- **suppliers** - Supplier information
- **personal_access_tokens** - API authentication

### Level 2: Tables Depending on Level 1
- **users** → depends on **roles**
  - Foreign key: `role_id` references `roles.id`

### Level 3: Tables Depending on Level 2
- **audit_logs** → depends on **users**
  - Foreign key: `user_id` references `users.id`
- **rates** → depends on **products**
  - Foreign key: `product_id` references `products.id`
- **payments** → depends on **suppliers** and **users**
  - Foreign keys: `supplier_id` references `suppliers.id`, `user_id` references `users.id`

### Level 4: Tables Depending on Multiple Previous Levels
- **collections** → depends on **suppliers**, **products**, **users**, and **rates**
  - Foreign keys:
    - `supplier_id` references `suppliers.id`
    - `product_id` references `products.id`
    - `user_id` references `users.id`
    - `rate_id` references `rates.id`

### Level 5: Schema Modifications
- **add_version_to_tables** - Adds version columns to existing tables
- **add_composite_indices_for_performance** - Adds performance indices

## Best Practices

### 1. Creating New Migrations
When creating a new migration that includes foreign keys:

```bash
php artisan make:migration create_new_table --create=new_table
```

Ensure the timestamp is **after** all dependent tables:
- If your table references `users`, use a timestamp after `0001_01_01_000001`
- If your table references `collections`, use a timestamp after `2025_12_28_110947`

### 2. Naming Convention
```
YYYY_MM_DD_HHMMSS_descriptive_migration_name.php
```

The timestamp should reflect the dependency order, not necessarily the actual creation time.

### 3. Foreign Key Constraints
Always define foreign keys with appropriate actions:
- `onDelete('cascade')` - Delete child records when parent is deleted
- `onDelete('set null')` - Set foreign key to NULL when parent is deleted
- `onDelete('restrict')` - Prevent parent deletion if children exist

Example:
```php
$table->foreignId('user_id')
    ->constrained('users')
    ->onDelete('cascade');
```

### 4. Migration Order Verification
To verify migration order is correct:

```bash
# List migrations in execution order
ls -1 database/migrations/*.php | sort

# Check migration status
php artisan migrate:status
```

### 5. Testing Migration Order
Before deploying to production:

```bash
# Fresh migration (destroys all data)
php artisan migrate:fresh

# Rollback and re-migrate
php artisan migrate:rollback --step=10
php artisan migrate
```

## Common Issues and Solutions

### Issue: Foreign Key Constraint Error
**Error**: `SQLSTATE[HY000]: General error: 1215 Cannot add foreign key constraint`

**Solution**: 
- Ensure the referenced table is created before the table with the foreign key
- Check that the referenced column exists and has the correct data type
- Verify the timestamp of the migration file ensures proper ordering

### Issue: Duplicate Timestamps
**Problem**: Multiple migrations with the same timestamp may execute in undefined order

**Solution**:
- Rename migrations to have unique, sequential timestamps
- Use `git mv` to preserve file history: `git mv old_name.php new_name.php`

## Rollback Strategy

When rolling back migrations, they execute in **reverse order**:

```bash
# Rollback last batch
php artisan migrate:rollback

# Rollback specific number of migrations
php artisan migrate:rollback --step=5

# Rollback all migrations
php artisan migrate:reset
```

The `down()` method should drop tables in reverse dependency order (handled automatically by Laravel).

## Conclusion

Proper migration ordering is critical for:
- **Referential Integrity**: Foreign keys always reference existing tables
- **Predictable Execution**: Same order on all environments (dev, staging, production)
- **Maintainability**: Clear dependency chain for future developers
- **Reliability**: No random failures due to race conditions

Always review dependencies before creating new migrations and maintain the established ordering convention.
