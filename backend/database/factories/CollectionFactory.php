<?php

namespace Database\Factories;

use App\Models\Collection;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class CollectionFactory extends Factory
{
    protected $model = Collection::class;

    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'product_id' => Product::factory(),
            'quantity' => $this->faker->randomFloat(2, 1, 100),
            'unit' => 'kg',
            'collected_at' => now(),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
