<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Fresh Milk',
                'description' => 'Organic whole milk',
                'unit' => 'l',
                'status' => 'active',
            ],
            [
                'name' => 'Raw Honey',
                'description' => 'Pure natural honey',
                'unit' => 'kg',
                'status' => 'active',
            ],
            [
                'name' => 'Coconut Oil',
                'description' => 'Virgin coconut oil',
                'unit' => 'ml',
                'status' => 'active',
            ],
            [
                'name' => 'Fresh Eggs',
                'description' => 'Free-range chicken eggs',
                'unit' => 'g',
                'status' => 'active',
            ],
        ];
        
        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
