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
            'amount' => $this->faker->randomFloat(2, 10, 10000),
            'payment_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'payment_type' => $this->faker->randomElement(['advance', 'partial', 'full']),
            'reference_number' => $this->faker->optional()->numerify('PAY-####'),
            'notes' => $this->faker->optional()->sentence(),
            'version' => 0,
        ];
    }

    public function advance()
    {
        return $this->state(fn (array $attributes) => [
            'payment_type' => 'advance',
        ]);
    }

    public function partial()
    {
        return $this->state(fn (array $attributes) => [
            'payment_type' => 'partial',
        ]);
    }

    public function full()
    {
        return $this->state(fn (array $attributes) => [
            'payment_type' => 'full',
        ]);
    }
}
