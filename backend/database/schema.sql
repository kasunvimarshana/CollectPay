-- LedgerFlow Platform Database Schema
-- Clean Architecture: Database Layer
-- Version: 1.0

-- Users table with RBAC support
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'collector',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'collector', 'viewer'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    notes TEXT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_deleted_at ON suppliers(deleted_at);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(50) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT products_unit_check CHECK (unit IN ('kg', 'g', 'l', 'ml', 'units', 'pieces'))
);

CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

-- Product rates table (versioned rates)
CREATE TABLE IF NOT EXISTS product_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    effective_from DATETIME NOT NULL,
    effective_to DATETIME NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT product_rates_rate_check CHECK (rate >= 0)
);

CREATE INDEX idx_product_rates_product_id ON product_rates(product_id);
CREATE INDEX idx_product_rates_effective_dates ON product_rates(effective_from, effective_to);
CREATE INDEX idx_product_rates_is_active ON product_rates(is_active);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_rate_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    collection_date DATETIME NOT NULL,
    notes TEXT NULL,
    sync_status VARCHAR(50) DEFAULT 'synced',
    device_id VARCHAR(255) NULL,
    version INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_rate_id) REFERENCES product_rates(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT collections_quantity_check CHECK (quantity > 0),
    CONSTRAINT collections_rate_check CHECK (rate >= 0),
    CONSTRAINT collections_sync_check CHECK (sync_status IN ('synced', 'pending', 'conflict'))
);

CREATE INDEX idx_collections_supplier_id ON collections(supplier_id);
CREATE INDEX idx_collections_product_id ON collections(product_id);
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_collection_date ON collections(collection_date);
CREATE INDEX idx_collections_sync_status ON collections(sync_status);
CREATE INDEX idx_collections_deleted_at ON collections(deleted_at);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    payment_date DATETIME NOT NULL,
    reference_number VARCHAR(255) NULL,
    notes TEXT NULL,
    sync_status VARCHAR(50) DEFAULT 'synced',
    device_id VARCHAR(255) NULL,
    version INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT payments_amount_check CHECK (amount > 0),
    CONSTRAINT payments_type_check CHECK (payment_type IN ('advance', 'partial', 'full')),
    CONSTRAINT payments_sync_check CHECK (sync_status IN ('synced', 'pending', 'conflict'))
);

CREATE INDEX idx_payments_supplier_id ON payments(supplier_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_sync_status ON payments(sync_status);
CREATE INDEX idx_payments_deleted_at ON payments(deleted_at);

-- Audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values TEXT NULL,
    new_values TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT audit_logs_action_check CHECK (action IN ('create', 'update', 'delete', 'login', 'logout'))
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Sync conflicts table for multi-device conflict resolution
CREATE TABLE IF NOT EXISTS sync_conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    local_version INTEGER NOT NULL,
    server_version INTEGER NOT NULL,
    local_data TEXT NOT NULL,
    server_data TEXT NOT NULL,
    resolved BOOLEAN DEFAULT 0,
    resolution_strategy VARCHAR(50) NULL,
    resolved_at DATETIME NULL,
    resolved_by INTEGER NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sync_conflicts_entity ON sync_conflicts(entity_type, entity_id);
CREATE INDEX idx_sync_conflicts_resolved ON sync_conflicts(resolved);
CREATE INDEX idx_sync_conflicts_device_id ON sync_conflicts(device_id);
