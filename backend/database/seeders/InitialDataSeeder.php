<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Rate;
use Illuminate\Support\Facades\Hash;

class InitialDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'permissions' => ['*'],
            'is_active' => true,
        ]);

        // Create collector user
        $collector = User::create([
            'name' => 'John Collector',
            'email' => 'collector@example.com',
            'password' => Hash::make('password'),
            'role' => 'collector',
            'permissions' => ['create_collection', 'create_payment', 'view_supplier'],
            'is_active' => true,
        ]);

        // Create products
        $teaLeaves = Product::create([
            'name' => 'Tea Leaves',
            'code' => 'TEA001',
            'description' => 'Premium quality tea leaves',
            'default_unit' => 'kg',
            'available_units' => ['kg', 'g', 'lb'],
            'category' => 'Agricultural',
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        $coffee = Product::create([
            'name' => 'Coffee Beans',
            'code' => 'COF001',
            'description' => 'Arabica coffee beans',
            'default_unit' => 'kg',
            'available_units' => ['kg', 'g', 'lb'],
            'category' => 'Agricultural',
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        // Create suppliers
        $supplier1 = Supplier::create([
            'name' => 'Green Valley Farm',
            'code' => 'SUP001',
            'phone' => '+1234567890',
            'email' => 'greenvalley@example.com',
            'address' => '123 Farm Road, Green Valley',
            'region' => 'Central',
            'id_number' => 'ID123456',
            'credit_limit' => 5000.00,
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        $supplier2 = Supplier::create([
            'name' => 'Sunrise Plantation',
            'code' => 'SUP002',
            'phone' => '+1234567891',
            'email' => 'sunrise@example.com',
            'address' => '456 Hill Road, Northern Region',
            'region' => 'Northern',
            'id_number' => 'ID789012',
            'credit_limit' => 3000.00,
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        // Create global rates
        Rate::create([
            'product_id' => $teaLeaves->id,
            'supplier_id' => null, // Global rate
            'rate_value' => 5.50,
            'unit' => 'kg',
            'effective_from' => now()->subDays(30),
            'effective_to' => null,
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        Rate::create([
            'product_id' => $coffee->id,
            'supplier_id' => null, // Global rate
            'rate_value' => 12.00,
            'unit' => 'kg',
            'effective_from' => now()->subDays(30),
            'effective_to' => null,
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        // Create supplier-specific rate (override global)
        Rate::create([
            'product_id' => $teaLeaves->id,
            'supplier_id' => $supplier1->id,
            'rate_value' => 6.00, // Premium rate for this supplier
            'unit' => 'kg',
            'effective_from' => now()->subDays(15),
            'effective_to' => null,
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        $this->command->info('Initial data seeded successfully!');
        $this->command->info('Admin: admin@example.com / password');
        $this->command->info('Collector: collector@example.com / password');
    }
}
