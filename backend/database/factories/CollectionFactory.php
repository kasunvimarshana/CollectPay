<?php

namespace Database\Factories;

use App\Models\Collection;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\ProductRate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CollectionFactory extends Factory
{
    protected $model = Collection::class;

    public function definition(): array
    {
        $quantity = fake()->randomFloat(2, 10, 100);
        $rate = fake()->randomFloat(2, 50, 200);

        return [
            'supplier_id' => Supplier::factory(),
            'product_id' => Product::factory(),
            'user_id' => User::factory(),
            'product_rate_id' => ProductRate::factory(),
            'collection_date' => now()->subDays(rand(1, 30)),
            'quantity' => $quantity,
            'unit' => 'kg',
            'rate_applied' => $rate,
            'total_amount' => $quantity * $rate,
            'notes' => fake()->optional()->sentence(),
            'metadata' => null,
            'version' => 1,
        ];
    }
}
