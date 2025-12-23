<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductRate;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ProductRateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        
        foreach ($products as $product) {
            // Create historical rate (30 days ago)
            ProductRate::create([
                'product_id' => $product->id,
                'rate' => $this->getBaseRate($product->name),
                'effective_date' => Carbon::now()->subDays(30)->toDateString(),
                'status' => 'active',
            ]);
            
            // Create current rate
            ProductRate::create([
                'product_id' => $product->id,
                'rate' => $this->getCurrentRate($product->name),
                'effective_date' => Carbon::now()->toDateString(),
                'status' => 'active',
            ]);
        }
    }
    
    private function getBaseRate(string $productName): float
    {
        return match($productName) {
            'Fresh Milk' => 2.50,
            'Raw Honey' => 15.00,
            'Coconut Oil' => 0.50,
            'Fresh Eggs' => 0.30,
            default => 5.00,
        };
    }
    
    private function getCurrentRate(string $productName): float
    {
        return match($productName) {
            'Fresh Milk' => 2.75,
            'Raw Honey' => 16.50,
            'Coconut Oil' => 0.55,
            'Fresh Eggs' => 0.35,
            default => 5.50,
        };
    }
}
