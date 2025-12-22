<?php

namespace Database\Factories;

use App\Models\Rate;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class RateFactory extends Factory
{
    protected $model = Rate::class;

    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'product_id' => Product::factory(),
            'price_per_unit' => $this->faker->randomFloat(2, 0.5, 50),
            'currency' => 'USD',
            'effective_from' => now()->subDay(),
            'effective_to' => null,
        ];
    }
}
