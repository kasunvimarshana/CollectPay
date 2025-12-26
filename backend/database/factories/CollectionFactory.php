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
        $quantity = $this->faker->randomFloat(3, 1, 1000);
        $rate = $this->faker->randomFloat(2, 1, 100);

        return [
            'supplier_id' => Supplier::factory(),
            'product_id' => Product::factory(),
            'user_id' => User::factory(),
            'product_rate_id' => ProductRate::factory(),
            'collection_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'quantity' => $quantity,
            'unit' => 'kg',
            'rate_applied' => $rate,
            'total_amount' => $quantity * $rate,
            'notes' => $this->faker->optional()->sentence(),
            'version' => 0,
        ];
    }
}
