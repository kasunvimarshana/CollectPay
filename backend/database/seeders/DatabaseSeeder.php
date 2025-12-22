<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Rate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@collectpay.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create supervisor user
        User::create([
            'name' => 'Supervisor User',
            'email' => 'supervisor@collectpay.com',
            'password' => Hash::make('password'),
            'role' => 'supervisor',
            'is_active' => true,
        ]);

        // Create collector user
        User::create([
            'name' => 'Collector User',
            'email' => 'collector@collectpay.com',
            'password' => Hash::make('password'),
            'role' => 'collector',
            'is_active' => true,
        ]);

        // Create sample suppliers
        $supplier1 = Supplier::create([
            'name' => 'Green Valley Tea Estate',
            'code' => 'SUP001',
            'phone' => '+94771234567',
            'address' => 'Hatton Road',
            'area' => 'Nuwara Eliya',
            'is_active' => true,
        ]);

        $supplier2 = Supplier::create([
            'name' => 'Mountain View Plantation',
            'code' => 'SUP002',
            'phone' => '+94777654321',
            'address' => 'Hill Street',
            'area' => 'Kandy',
            'is_active' => true,
        ]);

        $supplier3 = Supplier::create([
            'name' => 'Sunrise Dairy Farm',
            'code' => 'SUP003',
            'phone' => '+94763456789',
            'address' => 'Farm Road',
            'area' => 'Kurunegala',
            'is_active' => true,
        ]);

        // Create sample products
        $teaLeaves = Product::create([
            'name' => 'Tea Leaves',
            'code' => 'PROD001',
            'unit' => 'kilogram',
            'description' => 'Fresh tea leaves',
            'is_active' => true,
        ]);

        $greenTea = Product::create([
            'name' => 'Green Tea',
            'code' => 'PROD002',
            'unit' => 'kilogram',
            'description' => 'Premium green tea',
            'is_active' => true,
        ]);

        $milk = Product::create([
            'name' => 'Fresh Milk',
            'code' => 'PROD003',
            'unit' => 'liter',
            'description' => 'Farm fresh milk',
            'is_active' => true,
        ]);

        // Create sample rates
        Rate::create([
            'product_id' => $teaLeaves->id,
            'supplier_id' => $supplier1->id,
            'rate' => 150.00,
            'effective_from' => '2024-01-01',
            'effective_to' => '2024-12-31',
            'is_active' => true,
        ]);

        Rate::create([
            'product_id' => $teaLeaves->id,
            'supplier_id' => $supplier2->id,
            'rate' => 145.00,
            'effective_from' => '2024-01-01',
            'effective_to' => '2024-12-31',
            'is_active' => true,
        ]);

        Rate::create([
            'product_id' => $greenTea->id,
            'supplier_id' => $supplier1->id,
            'rate' => 200.00,
            'effective_from' => '2024-01-01',
            'effective_to' => '2024-12-31',
            'is_active' => true,
        ]);

        Rate::create([
            'product_id' => $milk->id,
            'supplier_id' => $supplier3->id,
            'rate' => 100.00,
            'effective_from' => '2024-01-01',
            'effective_to' => '2024-12-31',
            'is_active' => true,
        ]);
    }
}
