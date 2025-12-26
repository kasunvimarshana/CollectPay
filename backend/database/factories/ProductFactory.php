<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'code' => 'PROD-' . fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->sentence(),
            'default_unit' => 'kg',
            'supported_units' => ['kg', 'g'],
            'metadata' => null,
            'is_active' => true,
            'version' => 1,
        ];
    }
}
