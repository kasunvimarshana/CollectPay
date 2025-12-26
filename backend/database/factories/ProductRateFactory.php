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
            'rate' => $this->faker->randomFloat(2, 1, 100),
            'unit' => 'kg',
            'effective_from' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'effective_to' => null,
            'is_active' => true,
        ];
    }

    public function inactive()
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
            'effective_to' => now(),
        ]);
    }
}
