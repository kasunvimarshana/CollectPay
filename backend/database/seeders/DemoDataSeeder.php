<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\ProductRate;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@synccollect.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create regular user
        $user = User::create([
            'name' => 'Test User',
            'email' => 'user@synccollect.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'is_active' => true,
        ]);

        // Create suppliers
        $supplier1 = Supplier::create([
            'name' => 'Fresh Farm Supplies',
            'contact_person' => 'John Doe',
            'phone' => '+1234567890',
            'email' => 'contact@freshfarm.com',
            'address' => '123 Farm Road, Agriculture City',
            'status' => 'active',
            'created_by' => $admin->id,
            'version' => 1,
        ]);

        $supplier2 = Supplier::create([
            'name' => 'Dairy Products Ltd',
            'contact_person' => 'Jane Smith',
            'phone' => '+1234567891',
            'email' => 'info@dairyproducts.com',
            'address' => '456 Milk Street, Dairy Town',
            'status' => 'active',
            'created_by' => $admin->id,
            'version' => 1,
        ]);

        // Create products
        $product1 = Product::create([
            'supplier_id' => $supplier1->id,
            'name' => 'Fresh Milk',
            'description' => 'High quality fresh milk',
            'sku' => 'FM001',
            'units' => ['liter', 'gallon'],
            'default_unit' => 'liter',
            'status' => 'active',
            'created_by' => $admin->id,
            'version' => 1,
        ]);

        $product2 = Product::create([
            'supplier_id' => $supplier1->id,
            'name' => 'Organic Vegetables',
            'description' => 'Fresh organic vegetables',
            'sku' => 'OV001',
            'units' => ['kg', 'pound'],
            'default_unit' => 'kg',
            'status' => 'active',
            'created_by' => $admin->id,
            'version' => 1,
        ]);

        $product3 = Product::create([
            'supplier_id' => $supplier2->id,
            'name' => 'Cheese',
            'description' => 'Premium quality cheese',
            'sku' => 'CH001',
            'units' => ['kg', 'pound'],
            'default_unit' => 'kg',
            'status' => 'active',
            'created_by' => $admin->id,
            'version' => 1,
        ]);

        // Create product rates
        ProductRate::create([
            'product_id' => $product1->id,
            'rate' => 2.50,
            'unit' => 'liter',
            'effective_from' => now()->subDays(30),
            'effective_to' => null,
            'is_active' => true,
            'created_by' => $admin->id,
            'version' => 1,
        ]);

        ProductRate::create([
            'product_id' => $product2->id,
            'rate' => 3.00,
            'unit' => 'kg',
            'effective_from' => now()->subDays(30),
            'effective_to' => null,
            'is_active' => true,
            'created_by' => $admin->id,
            'version' => 1,
        ]);

        ProductRate::create([
            'product_id' => $product3->id,
            'rate' => 8.50,
            'unit' => 'kg',
            'effective_from' => now()->subDays(30),
            'effective_to' => null,
            'is_active' => true,
            'created_by' => $admin->id,
            'version' => 1,
        ]);

        // Create payments
        Payment::create([
            'supplier_id' => $supplier1->id,
            'product_id' => $product1->id,
            'amount' => 500.00,
            'payment_type' => 'advance',
            'payment_method' => 'bank_transfer',
            'reference_number' => 'PAY001',
            'payment_date' => now()->subDays(10),
            'created_by' => $admin->id,
            'version' => 1,
        ]);

        Payment::create([
            'supplier_id' => $supplier2->id,
            'product_id' => $product3->id,
            'amount' => 1000.00,
            'payment_type' => 'partial',
            'payment_method' => 'cash',
            'reference_number' => 'PAY002',
            'payment_date' => now()->subDays(5),
            'created_by' => $admin->id,
            'version' => 1,
        ]);
    }
}
