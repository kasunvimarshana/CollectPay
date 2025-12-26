<?php

namespace Database\Factories;

use App\Models\ProductRate;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductRateFactory extends Factory
{
    protected $model = ProductRate::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'unit' => 'kg',
            'rate' => fake()->randomFloat(2, 50, 500),
            'effective_date' => now()->subDays(rand(1, 30)),
            'end_date' => null,
            'is_active' => true,
            'metadata' => null,
            'version' => 1,
        ];
    }
}
