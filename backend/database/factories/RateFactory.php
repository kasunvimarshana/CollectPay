<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Rate;
use Illuminate\Database\Eloquent\Factories\Factory;

class RateFactory extends Factory
{
    protected $model = Rate::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'rate' => fake()->randomFloat(2, 100, 500),
            'unit' => 'kg',
            'effective_from' => now()->subDays(rand(1, 30)),
            'effective_to' => null,
            'is_active' => true,
            'version' => 1,
        ];
    }
}
