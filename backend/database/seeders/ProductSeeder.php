<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\User;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@fieldsyncledger.com')->first();

        if (!$admin) {
            return;
        }

        $products = [
            ['name' => 'Tea Leaves', 'code' => 'PRD001', 'unit' => 'kg', 'description' => 'Fresh tea leaves'],
            ['name' => 'Green Tea Leaves', 'code' => 'PRD002', 'unit' => 'kg', 'description' => 'Green tea leaves'],
            ['name' => 'Black Tea Leaves', 'code' => 'PRD003', 'unit' => 'kg', 'description' => 'Black tea leaves'],
            ['name' => 'White Tea Leaves', 'code' => 'PRD004', 'unit' => 'kg', 'description' => 'White tea leaves'],
            ['name' => 'Oolong Tea Leaves', 'code' => 'PRD005', 'unit' => 'kg', 'description' => 'Oolong tea leaves'],
        ];

        foreach ($products as $product) {
            Product::create([
                'id' => (string) Str::uuid(),
                'name' => $product['name'],
                'code' => $product['code'],
                'unit' => $product['unit'],
                'description' => $product['description'],
                'user_id' => $admin->id,
                'version' => 1,
            ]);
        }
    }
}
