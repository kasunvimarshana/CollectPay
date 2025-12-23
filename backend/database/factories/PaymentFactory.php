<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
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
            'product_id' => Product::factory(),
            'amount' => fake()->randomFloat(2, 100, 10000),
            'payment_type' => fake()->randomElement(['advance', 'partial', 'full']),
            'payment_method' => fake()->randomElement(['cash', 'bank_transfer', 'check', 'mobile_payment']),
            'reference_number' => fake()->optional()->uuid(),
            'notes' => fake()->optional()->sentence(),
            'payment_date' => fake()->date(),
            'created_by' => User::factory(),
            'version' => 1,
        ];
    }

    /**
     * Indicate that this is an advance payment.
     */
    public function advance(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_type' => 'advance',
        ]);
    }

    /**
     * Indicate that this is a cash payment.
     */
    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'cash',
        ]);
    }
}
