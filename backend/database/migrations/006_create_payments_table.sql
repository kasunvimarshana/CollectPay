-- Migration: Create payments table
-- Created: 2025-01-01 00:00:05

CREATE TABLE IF NOT EXISTS payments (
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
