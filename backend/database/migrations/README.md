# Database Migration Order

This document describes the correct execution order for database migrations and the dependencies between tables.

## Migration Execution Order

Migrations are executed in alphabetical/chronological order based on their timestamp prefix. The following order ensures all foreign key dependencies are satisfied:

### 1. Infrastructure Tables (Laravel Framework)
```
0001_01_01_000000 - create_roles_table
0001_01_01_000001 - create_users_table (depends on: roles)
0001_01_01_000002 - create_cache_table
0001_01_01_000003 - create_jobs_table
```

### 2. Business Domain Tables
```
2025_12_28_110900 - create_products_table (base table, no dependencies)
2025_12_28_110910 - create_suppliers_table (base table, no dependencies)
2025_12_28_110920 - create_audit_logs_table (depends on: users)
2025_12_28_110930 - create_rates_table (depends on: products)
2025_12_28_110940 - create_payments_table (depends on: suppliers, users)
2025_12_28_110950 - create_collections_table (depends on: suppliers, products, users, rates)
```

### 3. Additional Features
```
2025_12_28_111410 - create_personal_access_tokens_table (polymorphic, no hard dependencies)
2025_12_29_064046 - add_version_to_tables (modifies all business tables)
2026_01_08_115112 - add_composite_indices_for_performance (adds indices to existing tables)
```

## Dependency Chain

```
roles
  └─> users
       ├─> audit_logs
       ├─> payments
       └─> collections

products
  └─> rates
       └─> collections

suppliers
  ├─> payments
  └─> collections
```

## Foreign Key Relationships

| Child Table | Parent Table | Foreign Key | On Delete |
|-------------|--------------|-------------|-----------|
| users | roles | role_id | SET NULL |
| audit_logs | users | user_id | SET NULL |
| rates | products | product_id | CASCADE |
| payments | suppliers | supplier_id | CASCADE |
| payments | users | user_id | CASCADE |
| collections | suppliers | supplier_id | CASCADE |
| collections | products | product_id | CASCADE |
| collections | users | user_id | CASCADE |
| collections | rates | rate_id | RESTRICT |

## Timestamp Spacing

Migrations are spaced 10 minutes apart (in timestamp format) to ensure:
- Deterministic execution order across all database systems
- Clear separation for debugging and rollback operations
- Easy insertion of new migrations between existing ones if needed

## Adding New Migrations

When adding new migrations that depend on existing tables:

1. **Identify Dependencies**: Determine which tables your new migration depends on
2. **Choose Timestamp**: Select a timestamp after all dependencies
3. **Maintain Spacing**: Use reasonable time gaps (e.g., 10+ minutes) between related migrations
4. **Test Order**: Verify migration runs successfully on a fresh database

Example:
```bash
# Creating a migration that depends on collections and payments
php artisan make:migration create_settlements_table --create=settlements
# Rename to: 2025_12_28_111000_create_settlements_table.php
```

## Migration Order Rationale

The current order was established to:
- **Prevent Foreign Key Errors**: Parent tables are always created before child tables
- **Enable Deterministic Execution**: Adequate timestamp spacing prevents race conditions
- **Support Rollback**: Dependencies can be dropped in reverse order without conflicts
- **Maintain Referential Integrity**: All foreign key constraints are properly enforced
- **Ensure Long-term Maintainability**: Clear structure makes it easy to add new migrations

## Verification

To verify migration order is correct:

```bash
# Run migrations on a fresh database
php artisan migrate:fresh

# Check for foreign key constraint errors
# If successful, all dependencies are correctly ordered
```

## Historical Note

Previous migration timestamps (110942-110947) were renamed to (110900-110950) to enforce proper execution order and prevent potential non-deterministic behavior on different systems or database engines.
