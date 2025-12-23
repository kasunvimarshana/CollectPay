<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductRate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@transactrack.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create manager user
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@transactrack.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'is_active' => true,
        ]);

        // Create collector user
        User::create([
            'name' => 'Collector User',
            'email' => 'collector@transactrack.com',
            'password' => Hash::make('password'),
            'role' => 'collector',
            'is_active' => true,
        ]);

        // Create sample products
        $milkProduct = Product::create([
            'name' => 'Milk',
            'description' => 'Fresh cow milk',
            'unit_type' => 'volume',
            'primary_unit' => 'liter',
            'allowed_units' => ['liter', 'milliliter'],
            'is_active' => true,
        ]);

        $riceProduct = Product::create([
            'name' => 'Rice',
            'description' => 'White rice',
            'unit_type' => 'weight',
            'primary_unit' => 'kilogram',
            'allowed_units' => ['kilogram', 'gram'],
            'is_active' => true,
        ]);

        // Create sample rates
        ProductRate::create([
            'product_id' => $milkProduct->id,
            'rate' => 50.00,
            'unit' => 'liter',
            'effective_from' => now()->subDays(30),
            'is_current' => true,
            'created_by' => 1,
        ]);

        ProductRate::create([
            'product_id' => $riceProduct->id,
            'rate' => 80.00,
            'unit' => 'kilogram',
            'effective_from' => now()->subDays(30),
            'is_current' => true,
            'created_by' => 1,
        ]);
    }
}
