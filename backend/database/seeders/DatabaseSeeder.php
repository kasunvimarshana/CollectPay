<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\ProductRate;
use App\Models\Collection;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * ⚠️  SECURITY WARNING ⚠️
     * 
     * These demo users use WEAK PASSWORDS and are intended for DEVELOPMENT/TESTING ONLY.
     * 
     * For PRODUCTION environments:
     * 1. DO NOT run this seeder, OR
     * 2. Change all passwords to strong, unique values, AND
     * 3. Implement password complexity requirements, AND
     * 4. Require password change on first login
     * 
     * Strong password requirements:
     * - Minimum 12 characters
     * - Mix of uppercase, lowercase, numbers, and symbols
     * - No common words or patterns
     * - Unique per user
     */
    public function run(): void
    {
        // Create users
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@trackvault.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $collector = User::create([
            'name' => 'Collector User',
            'email' => 'collector@trackvault.com',
            'password' => Hash::make('password'),
            'role' => 'collector',
            'is_active' => true,
        ]);

        $finance = User::create([
            'name' => 'Finance User',
            'email' => 'finance@trackvault.com',
            'password' => Hash::make('password'),
            'role' => 'finance',
            'is_active' => true,
        ]);

        // Create suppliers
        $supplier1 = Supplier::create([
            'name' => 'Green Valley Farms',
            'code' => 'SUP-001',
            'address' => '123 Valley Road, Kandy',
            'phone' => '+94771234567',
            'email' => 'greenvalley@example.com',
            'is_active' => true,
            'version' => 1,
        ]);

        $supplier2 = Supplier::create([
            'name' => 'Hill Country Estates',
            'code' => 'SUP-002',
            'address' => '456 Hill Top, Nuwara Eliya',
            'phone' => '+94772345678',
            'email' => 'hillcountry@example.com',
            'is_active' => true,
            'version' => 1,
        ]);

        $supplier3 = Supplier::create([
            'name' => 'Mountain View Plantations',
            'code' => 'SUP-003',
            'address' => '789 Mountain Road, Badulla',
            'phone' => '+94773456789',
            'email' => 'mountainview@example.com',
            'is_active' => true,
            'version' => 1,
        ]);

        // Create products
        $teaLeaves = Product::create([
            'name' => 'Tea Leaves',
            'code' => 'PROD-001',
            'description' => 'Fresh tea leaves for processing',
            'default_unit' => 'kg',
            'supported_units' => ['kg', 'g'],
            'is_active' => true,
            'version' => 1,
        ]);

        $rubber = Product::create([
            'name' => 'Rubber Latex',
            'code' => 'PROD-002',
            'description' => 'Natural rubber latex',
            'default_unit' => 'liters',
            'supported_units' => ['liters', 'ml'],
            'is_active' => true,
            'version' => 1,
        ]);

        $coconut = Product::create([
            'name' => 'Coconuts',
            'code' => 'PROD-003',
            'description' => 'Fresh coconuts',
            'default_unit' => 'units',
            'supported_units' => ['units'],
            'is_active' => true,
            'version' => 1,
        ]);

        // Create product rates
        // Tea leaves rates - current
        $teaRateKg = ProductRate::create([
            'product_id' => $teaLeaves->id,
            'unit' => 'kg',
            'rate' => 120.00,
            'effective_date' => now()->subDays(30)->format('Y-m-d'),
            'is_active' => true,
            'version' => 1,
        ]);

        $teaRateG = ProductRate::create([
            'product_id' => $teaLeaves->id,
            'unit' => 'g',
            'rate' => 0.12,
            'effective_date' => now()->subDays(30)->format('Y-m-d'),
            'is_active' => true,
            'version' => 1,
        ]);

        // Old tea rate (for historical preservation demonstration)
        ProductRate::create([
            'product_id' => $teaLeaves->id,
            'unit' => 'kg',
            'rate' => 100.00,
            'effective_date' => now()->subDays(90)->format('Y-m-d'),
            'end_date' => now()->subDays(31)->format('Y-m-d'),
            'is_active' => false,
            'version' => 1,
        ]);

        // Rubber rates
        ProductRate::create([
            'product_id' => $rubber->id,
            'unit' => 'liters',
            'rate' => 200.00,
            'effective_date' => now()->subDays(30)->format('Y-m-d'),
            'is_active' => true,
            'version' => 1,
        ]);

        // Coconut rates
        ProductRate::create([
            'product_id' => $coconut->id,
            'unit' => 'units',
            'rate' => 50.00,
            'effective_date' => now()->subDays(30)->format('Y-m-d'),
            'is_active' => true,
            'version' => 1,
        ]);

        // Create collections
        // Week 1 collections
        Collection::create([
            'supplier_id' => $supplier1->id,
            'product_id' => $teaLeaves->id,
            'user_id' => $collector->id,
            'product_rate_id' => $teaRateKg->id,
            'collection_date' => now()->subDays(20)->format('Y-m-d'),
            'quantity' => 45.5,
            'unit' => 'kg',
            'rate_applied' => 120.00,
            'total_amount' => 45.5 * 120.00,
            'notes' => 'Morning collection',
            'version' => 1,
        ]);

        Collection::create([
            'supplier_id' => $supplier2->id,
            'product_id' => $teaLeaves->id,
            'user_id' => $collector->id,
            'product_rate_id' => $teaRateKg->id,
            'collection_date' => now()->subDays(20)->format('Y-m-d'),
            'quantity' => 38.2,
            'unit' => 'kg',
            'rate_applied' => 120.00,
            'total_amount' => 38.2 * 120.00,
            'notes' => 'Morning collection',
            'version' => 1,
        ]);

        // Week 2 collections
        Collection::create([
            'supplier_id' => $supplier1->id,
            'product_id' => $teaLeaves->id,
            'user_id' => $collector->id,
            'product_rate_id' => $teaRateKg->id,
            'collection_date' => now()->subDays(13)->format('Y-m-d'),
            'quantity' => 52.3,
            'unit' => 'kg',
            'rate_applied' => 120.00,
            'total_amount' => 52.3 * 120.00,
            'notes' => 'Afternoon collection',
            'version' => 1,
        ]);

        Collection::create([
            'supplier_id' => $supplier3->id,
            'product_id' => $teaLeaves->id,
            'user_id' => $collector->id,
            'product_rate_id' => $teaRateKg->id,
            'collection_date' => now()->subDays(13)->format('Y-m-d'),
            'quantity' => 41.8,
            'unit' => 'kg',
            'rate_applied' => 120.00,
            'total_amount' => 41.8 * 120.00,
            'notes' => 'Morning collection',
            'version' => 1,
        ]);

        // Recent collections
        Collection::create([
            'supplier_id' => $supplier1->id,
            'product_id' => $teaLeaves->id,
            'user_id' => $collector->id,
            'product_rate_id' => $teaRateKg->id,
            'collection_date' => now()->subDays(6)->format('Y-m-d'),
            'quantity' => 48.7,
            'unit' => 'kg',
            'rate_applied' => 120.00,
            'total_amount' => 48.7 * 120.00,
            'version' => 1,
        ]);

        Collection::create([
            'supplier_id' => $supplier2->id,
            'product_id' => $teaLeaves->id,
            'user_id' => $collector->id,
            'product_rate_id' => $teaRateKg->id,
            'collection_date' => now()->subDays(5)->format('Y-m-d'),
            'quantity' => 55.2,
            'unit' => 'kg',
            'rate_applied' => 120.00,
            'total_amount' => 55.2 * 120.00,
            'version' => 1,
        ]);

        // Create payments
        // Advance payment for supplier 1
        Payment::create([
            'supplier_id' => $supplier1->id,
            'user_id' => $finance->id,
            'payment_date' => now()->subDays(15)->format('Y-m-d'),
            'amount' => 5000.00,
            'payment_type' => 'advance',
            'payment_method' => 'Cash',
            'reference_number' => 'PAY-001',
            'notes' => 'Advance payment for month',
            'version' => 1,
        ]);

        // Partial payment for supplier 2
        Payment::create([
            'supplier_id' => $supplier2->id,
            'user_id' => $finance->id,
            'payment_date' => now()->subDays(10)->format('Y-m-d'),
            'amount' => 3000.00,
            'payment_type' => 'partial',
            'payment_method' => 'Bank Transfer',
            'reference_number' => 'PAY-002',
            'notes' => 'Partial payment',
            'version' => 1,
        ]);

        // Full payment for supplier 3
        Payment::create([
            'supplier_id' => $supplier3->id,
            'user_id' => $finance->id,
            'payment_date' => now()->subDays(7)->format('Y-m-d'),
            'amount' => 5016.00,
            'payment_type' => 'full',
            'payment_method' => 'Check',
            'reference_number' => 'PAY-003',
            'notes' => 'Full settlement',
            'version' => 1,
        ]);

        $this->command->info('Sample data seeded successfully!');
        $this->command->info('');
        $this->command->info('Demo Users:');
        $this->command->info('  Admin: admin@trackvault.com / password');
        $this->command->info('  Collector: collector@trackvault.com / password');
        $this->command->info('  Finance: finance@trackvault.com / password');
    }
}
