<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Rate;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::where('is_active', true)->get();

        if ($products->isEmpty()) {
            $this->command->warn('No active products found. Please run ProductSeeder first.');
            return;
        }

        $now = Carbon::now();
        
        // Pre-calculate date instances for efficiency
        $months9Ago = $now->copy()->subMonths(9);
        $months8Ago = $now->copy()->subMonths(8);
        $months6Ago = $now->copy()->subMonths(6);
        $months5Ago = $now->copy()->subMonths(5);
        $months4Ago = $now->copy()->subMonths(4);
        $months3Ago = $now->copy()->subMonths(3);
        
        // Define rate data for each product with historical rates
        $rateData = [
            'Coconuts' => [
                ['rate' => 25.50, 'unit' => 'kg', 'effective_from' => $months9Ago, 'effective_to' => $months6Ago->copy()->subDay()],
                ['rate' => 27.00, 'unit' => 'kg', 'effective_from' => $months6Ago, 'effective_to' => $months3Ago->copy()->subDay()],
                ['rate' => 28.50, 'unit' => 'kg', 'effective_from' => $months3Ago, 'effective_to' => null],
                ['rate' => 1.50, 'unit' => 'piece', 'effective_from' => clone $months9Ago, 'effective_to' => null],
            ],
            'Latex' => [
                ['rate' => 150.00, 'unit' => 'kg', 'effective_from' => clone $months9Ago, 'effective_to' => $months6Ago->copy()->subDay()],
                ['rate' => 155.00, 'unit' => 'kg', 'effective_from' => clone $months6Ago, 'effective_to' => $months3Ago->copy()->subDay()],
                ['rate' => 160.00, 'unit' => 'kg', 'effective_from' => clone $months3Ago, 'effective_to' => null],
            ],
            'Palm Oil' => [
                ['rate' => 85.00, 'unit' => 'liter', 'effective_from' => $months8Ago, 'effective_to' => $months4Ago->copy()->subDay()],
                ['rate' => 88.00, 'unit' => 'liter', 'effective_from' => $months4Ago, 'effective_to' => null],
            ],
            'Cocoa Beans' => [
                ['rate' => 250.00, 'unit' => 'kg', 'effective_from' => clone $months9Ago, 'effective_to' => $months5Ago->copy()->subDay()],
                ['rate' => 265.00, 'unit' => 'kg', 'effective_from' => $months5Ago, 'effective_to' => null],
            ],
            'Coffee Beans' => [
                ['rate' => 180.00, 'unit' => 'kg', 'effective_from' => clone $months8Ago, 'effective_to' => $months4Ago->copy()->subDay()],
                ['rate' => 190.00, 'unit' => 'kg', 'effective_from' => clone $months4Ago, 'effective_to' => null],
            ],
            'Tea Leaves' => [
                ['rate' => 45.00, 'unit' => 'kg', 'effective_from' => clone $months9Ago, 'effective_to' => $months6Ago->copy()->subDay()],
                ['rate' => 48.00, 'unit' => 'kg', 'effective_from' => clone $months6Ago, 'effective_to' => null],
            ],
            'Cashew Nuts' => [
                ['rate' => 320.00, 'unit' => 'kg', 'effective_from' => clone $months9Ago, 'effective_to' => $months5Ago->copy()->subDay()],
                ['rate' => 335.00, 'unit' => 'kg', 'effective_from' => clone $months5Ago, 'effective_to' => null],
            ],
        ];

        foreach ($products as $product) {
            if (isset($rateData[$product->name])) {
                foreach ($rateData[$product->name] as $index => $rate) {
                    Rate::create([
                        'product_id' => $product->id,
                        'rate' => $rate['rate'],
                        'unit' => $rate['unit'],
                        'effective_from' => $rate['effective_from'],
                        'effective_to' => $rate['effective_to'],
                        'is_active' => $rate['effective_to'] === null,
                        'version' => $index + 1,
                    ]);
                }
            }
        }

        $this->command->info('Rates seeded successfully!');
    }
}
