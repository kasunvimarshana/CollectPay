<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'code' => 'SUP-' . fake()->unique()->numberBetween(1000, 9999),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'metadata' => null,
            'is_active' => true,
            'version' => 1,
        ];
    }
}
