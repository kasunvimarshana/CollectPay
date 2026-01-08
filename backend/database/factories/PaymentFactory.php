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
            'payment_date' => now()->subDays(rand(0, 30)),
            'amount' => fake()->randomFloat(2, 1000, 10000),
            'type' => fake()->randomElement(['advance', 'partial', 'full']),
            'reference_number' => 'PAY'.fake()->unique()->numberBetween(10000, 99999),
            'payment_method' => fake()->randomElement(['cash', 'bank_transfer', 'check']),
            'notes' => fake()->optional()->sentence(),
            'version' => 1,
        ];
    }
}
