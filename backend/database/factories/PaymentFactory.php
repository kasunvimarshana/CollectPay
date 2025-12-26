<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'user_id' => User::factory(),
            'payment_date' => now()->subDays(rand(1, 30)),
            'amount' => fake()->randomFloat(2, 100, 10000),
            'payment_type' => fake()->randomElement(['advance', 'partial', 'full']),
            'payment_method' => fake()->randomElement(['Cash', 'Bank Transfer', 'Check']),
            'reference_number' => 'PAY-' . fake()->unique()->numberBetween(1000, 9999),
            'notes' => fake()->optional()->sentence(),
            'metadata' => null,
            'version' => 1,
        ];
    }
}
