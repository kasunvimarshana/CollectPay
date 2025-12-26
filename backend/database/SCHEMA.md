# PayMaster Database Schema

This document describes the complete database schema for the PayMaster application.

## Core Tables

### users
Stores user information with authentication and authorization data.

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    roles JSON NOT NULL DEFAULT '["collector"]',
    permissions JSON NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    version INT UNSIGNED DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### suppliers
Stores supplier/vendor information.

```sql
CREATE TABLE suppliers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    region VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    version INT UNSIGNED DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_region (region),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### products
Stores product information.

```sql
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    version INT UNSIGNED DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### product_rates
Stores versioned product rates with time-based validity.
Historical immutability is enforced - rates are never updated, only new versions are created.

```sql
CREATE TABLE product_rates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    version INT UNSIGNED DEFAULT 1,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_product_active (product_id, is_active),
    INDEX idx_effective_dates (effective_from, effective_to),
    INDEX idx_product_date_range (product_id, effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### collections
Stores collection events with immutable rate snapshots.

```sql
CREATE TABLE collections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    product_rate_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    collection_date TIMESTAMP NOT NULL,
    collected_by BIGINT UNSIGNED NOT NULL,
    notes TEXT,
    version INT UNSIGNED DEFAULT 1,
    sync_id VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_rate_id) REFERENCES product_rates(id) ON DELETE RESTRICT,
    FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_supplier (supplier_id),
    INDEX idx_product (product_id),
    INDEX idx_collection_date (collection_date),
    INDEX idx_sync_id (sync_id),
    INDEX idx_supplier_date (supplier_id, collection_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### payments
Stores payment transactions.

```sql
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type ENUM('advance', 'partial', 'final') NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    paid_by BIGINT UNSIGNED NOT NULL,
    notes TEXT,
    reference VARCHAR(50) UNIQUE,
    version INT UNSIGNED DEFAULT 1,
    sync_id VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_supplier (supplier_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_reference (reference),
    INDEX idx_sync_id (sync_id),
    INDEX idx_supplier_date (supplier_id, payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### sync_logs
Tracks synchronization operations for offline support.

```sql
CREATE TABLE sync_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    operation VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    conflict_resolved BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_entity (user_id, entity_type),
    INDEX idx_status (status),
    INDEX idx_synced_at (synced_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Indexes Strategy

All tables include appropriate indexes for:
- Primary key lookups
- Foreign key relationships
- Common query patterns (supplier, date ranges)
- Unique constraints (codes, sync_ids)
- Composite indexes for complex queries

## Versioning and Concurrency

All mutable entities include:
- `version` field for optimistic locking
- `updated_at` timestamp for conflict detection
- Automatic timestamp management

## Immutability Guarantees

Product rates are immutable:
- Once created, rate records are never modified
- New rates create new records with new effective dates
- Historical collections always reference the exact rate used

## Sync Support

Collections and payments include:
- `sync_id` for tracking offline operations
- Unique constraints prevent duplicate syncs
- `sync_logs` table tracks synchronization history
