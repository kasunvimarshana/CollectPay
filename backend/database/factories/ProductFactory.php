<?php

namespace Database\Factories;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'sku' => strtoupper(fake()->bothify('??###')),
            'units' => ['kg', 'liter', 'piece'],
            'default_unit' => 'kg',
            'status' => fake()->randomElement(['active', 'inactive']),
            'created_by' => User::factory(),
            'version' => 1,
        ];
    }

    /**
     * Indicate that the product is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }
}
