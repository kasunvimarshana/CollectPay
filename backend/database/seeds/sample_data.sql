-- Seed Data for Development and Testing
-- Insert sample users

INSERT INTO users (name, email, password_hash, roles, permissions, is_active, version) VALUES
('Admin User', 'admin@paymaster.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eZpq8JvZvJKe', '["admin"]', '["manage_users","manage_rates","make_payments","view_reports"]', TRUE, 1),
('Manager User', 'manager@paymaster.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eZpq8JvZvJKe', '["manager"]', '["manage_rates","make_payments","view_reports"]', TRUE, 1),
('Collector User', 'collector@paymaster.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eZpq8JvZvJKe', '["collector"]', '[]', TRUE, 1);

-- Note: Password for all test users is 'password123'

-- Insert sample suppliers
INSERT INTO suppliers (name, code, phone, address, region, is_active, version) VALUES
('Supplier A', 'SUP001', '+94771234567', '123 Main St, Kandy', 'Central', TRUE, 1),
('Supplier B', 'SUP002', '+94779876543', '456 Hill Rd, Nuwara Eliya', 'Central', TRUE, 1),
('Supplier C', 'SUP003', '+94765432100', '789 Valley View, Badulla', 'Uva', TRUE, 1),
('Supplier D', 'SUP004', '+94712345678', '321 Mountain Rd, Matale', 'Central', TRUE, 1);

-- Insert sample products
INSERT INTO products (name, code, unit, description, is_active, version) VALUES
('Tea Leaves', 'PROD001', 'kg', 'Fresh tea leaves', TRUE, 1),
('Green Tea Leaves', 'PROD002', 'kg', 'Premium green tea leaves', TRUE, 1),
('Cinnamon Bark', 'PROD003', 'kg', 'Ceylon cinnamon bark', TRUE, 1);

-- Insert sample product rates
-- Assuming user ID 1 (Admin) created these rates
INSERT INTO product_rates (product_id, rate, effective_from, effective_to, is_active, version, created_by) VALUES
-- Tea Leaves rates
(1, 50.00, '2025-01-01 00:00:00', '2025-01-31 23:59:59', FALSE, 1, 1),
(1, 55.00, '2025-02-01 00:00:00', NULL, TRUE, 1, 1),
-- Green Tea Leaves rates
(2, 75.00, '2025-01-01 00:00:00', NULL, TRUE, 1, 1),
-- Cinnamon Bark rates
(3, 150.00, '2025-01-01 00:00:00', NULL, TRUE, 1, 1);

-- Insert sample collections
-- Assuming user ID 3 (Collector) created these
INSERT INTO collections (supplier_id, product_id, product_rate_id, quantity, rate, amount, collection_date, collected_by, notes, version, sync_id) VALUES
(1, 1, 2, 25.500, 55.00, 1402.50, '2025-02-15 10:00:00', 3, 'Morning collection', 1, 'coll_65f9a1b2c3d4e1'),
(1, 1, 2, 30.250, 55.00, 1663.75, '2025-02-16 09:30:00', 3, 'Good quality', 1, 'coll_65f9a1b2c3d4e2'),
(2, 1, 2, 18.750, 55.00, 1031.25, '2025-02-15 11:00:00', 3, NULL, 1, 'coll_65f9a1b2c3d4e3'),
(3, 2, 3, 12.500, 75.00, 937.50, '2025-02-15 14:00:00', 3, 'Premium quality', 1, 'coll_65f9a1b2c3d4e4');

-- Insert sample payments
-- Assuming user ID 2 (Manager) made these payments
INSERT INTO payments (supplier_id, amount, type, payment_date, paid_by, notes, reference, version, sync_id) VALUES
(1, 1000.00, 'advance', '2025-02-10 10:00:00', 2, 'Advance payment for February', 'PAY-20250210-ABC123', 1, 'pay_65f9a1b2c3d4f1'),
(2, 500.00, 'advance', '2025-02-12 11:00:00', 2, 'Advance payment', 'PAY-20250212-DEF456', 1, 'pay_65f9a1b2c3d4f2'),
(3, 400.00, 'advance', '2025-02-14 09:00:00', 2, 'Advance payment', 'PAY-20250214-GHI789', 1, 'pay_65f9a1b2c3d4f3');

-- Summary of sample data:
-- Supplier A: Collected 3066.25 (25.5+30.25 kg @ 55), Paid 1000.00, Balance 2066.25
-- Supplier B: Collected 1031.25 (18.75 kg @ 55), Paid 500.00, Balance 531.25
-- Supplier C: Collected 937.50 (12.5 kg @ 75), Paid 400.00, Balance 537.50
