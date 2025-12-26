-- Migration: Create collections table
-- Created: 2025-01-01 00:00:04

CREATE TABLE IF NOT EXISTS collections (
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
