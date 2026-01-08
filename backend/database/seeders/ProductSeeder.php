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
                'name' => 'Coconuts',
                'code' => 'PROD001',
                'description' => 'Fresh coconuts for various uses',
                'base_unit' => 'kg',
                'supported_units' => ['kg', 'g', 'ton', 'piece'],
                'is_active' => true,
            ],
            [
                'name' => 'Latex',
                'code' => 'PROD002',
                'description' => 'Raw latex collected from rubber trees',
                'base_unit' => 'kg',
                'supported_units' => ['kg', 'g', 'ton', 'liter'],
                'is_active' => true,
            ],
            [
                'name' => 'Palm Oil',
                'code' => 'PROD003',
                'description' => 'Crude palm oil from fresh fruit bunches',
                'base_unit' => 'liter',
                'supported_units' => ['liter', 'ml', 'gallon'],
                'is_active' => true,
            ],
            [
                'name' => 'Cocoa Beans',
                'code' => 'PROD004',
                'description' => 'Dried fermented cocoa beans',
                'base_unit' => 'kg',
                'supported_units' => ['kg', 'g', 'ton', 'lb'],
                'is_active' => true,
            ],
            [
                'name' => 'Coffee Beans',
                'code' => 'PROD005',
                'description' => 'Green coffee beans for roasting',
                'base_unit' => 'kg',
                'supported_units' => ['kg', 'g', 'ton', 'lb'],
                'is_active' => true,
            ],
            [
                'name' => 'Tea Leaves',
                'code' => 'PROD006',
                'description' => 'Fresh tea leaves for processing',
                'base_unit' => 'kg',
                'supported_units' => ['kg', 'g', 'ton'],
                'is_active' => true,
            ],
            [
                'name' => 'Cashew Nuts',
                'code' => 'PROD007',
                'description' => 'Raw cashew nuts in shell',
                'base_unit' => 'kg',
                'supported_units' => ['kg', 'g', 'ton', 'lb'],
                'is_active' => true,
            ],
            [
                'name' => 'Bananas',
                'code' => 'PROD008',
                'description' => 'Fresh bananas',
                'base_unit' => 'kg',
                'supported_units' => ['kg', 'g', 'ton', 'bunch'],
                'is_active' => false,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        $this->command->info('Products seeded successfully!');
    }
}
