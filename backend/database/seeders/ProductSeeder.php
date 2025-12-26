<?php

namespace Database\Seeders;

use App\Domain\Product\Models\Product;
use App\Domain\Product\Models\ProductRate;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Green Tea Leaves',
                'code' => 'GTL-001',
                'category' => 'tea',
                'base_unit' => 'kg',
                'unit_conversions' => [
                    'g' => 0.001,
                    'lb' => 0.453592,
                ],
                'rate' => 150.00,
                'description' => 'Fresh green tea leaves, unwithered',
            ],
            [
                'name' => 'Black Tea Leaves',
                'code' => 'BTL-001',
                'category' => 'tea',
                'base_unit' => 'kg',
                'unit_conversions' => [
                    'g' => 0.001,
                    'lb' => 0.453592,
                ],
                'rate' => 180.00,
                'description' => 'Oxidized tea leaves for black tea',
            ],
            [
                'name' => 'White Tea Buds',
                'code' => 'WTB-001',
                'category' => 'tea',
                'base_unit' => 'kg',
                'unit_conversions' => [
                    'g' => 0.001,
                ],
                'rate' => 350.00,
                'description' => 'Premium white tea buds, minimally processed',
            ],
            [
                'name' => 'Ceylon Cinnamon',
                'code' => 'CCN-001',
                'category' => 'spice',
                'base_unit' => 'kg',
                'unit_conversions' => [
                    'g' => 0.001,
                    'lb' => 0.453592,
                ],
                'rate' => 2500.00,
                'description' => 'True Ceylon cinnamon bark',
            ],
            [
                'name' => 'Black Pepper',
                'code' => 'BPP-001',
                'category' => 'spice',
                'base_unit' => 'kg',
                'unit_conversions' => [
                    'g' => 0.001,
                    'lb' => 0.453592,
                ],
                'rate' => 1800.00,
                'description' => 'Dried black pepper corns',
            ],
            [
                'name' => 'Coconut',
                'code' => 'CCT-001',
                'category' => 'fruit',
                'base_unit' => 'piece',
                'unit_conversions' => [],
                'rate' => 120.00,
                'description' => 'Fresh mature coconuts',
            ],
            [
                'name' => 'Rubber Latex',
                'code' => 'RLX-001',
                'category' => 'rubber',
                'base_unit' => 'kg',
                'unit_conversions' => [
                    'g' => 0.001,
                    'l' => 0.93, // Approximate conversion
                ],
                'rate' => 450.00,
                'description' => 'Fresh rubber tree latex',
            ],
        ];

        foreach ($products as $productData) {
            $product = Product::create([
                'name' => $productData['name'],
                'code' => $productData['code'],
                'category' => $productData['category'],
                'description' => $productData['description'],
                'base_unit' => $productData['base_unit'],
                'unit_conversions' => $productData['unit_conversions'],
                'status' => 'active',
                'sync_status' => 'synced',
            ]);

            // Create current rate
            ProductRate::create([
                'product_id' => $product->id,
                'rate' => $productData['rate'],
                'effective_from' => now()->subMonths(3),
                'effective_to' => null,
                'is_current' => true,
                'notes' => 'Initial rate',
                'sync_status' => 'synced',
            ]);

            // Create historical rate (previous)
            ProductRate::create([
                'product_id' => $product->id,
                'rate' => $productData['rate'] * 0.9, // 10% lower
                'effective_from' => now()->subMonths(6),
                'effective_to' => now()->subMonths(3)->subDay(),
                'is_current' => false,
                'notes' => 'Previous rate period',
                'sync_status' => 'synced',
            ]);
        }
    }
}
