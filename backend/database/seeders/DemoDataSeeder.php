<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use Src\Infrastructure\Persistence\Eloquent\Models\CollectionModel;
use Src\Infrastructure\Persistence\Eloquent\Models\RateModel;
use Src\Infrastructure\Persistence\Eloquent\Models\PaymentModel;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo users
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $collector = User::create([
            'name' => 'John Collector',
            'email' => 'collector@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $payer = User::create([
            'name' => 'Jane Payer',
            'email' => 'payer@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create collections
        $collection1 = CollectionModel::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Q1 2024 Monthly Collections',
            'description' => 'Regular monthly collections for Q1 2024',
            'created_by' => $admin->id,
            'status' => 'active',
            'version' => 1,
            'metadata' => json_encode(['region' => 'North', 'category' => 'Monthly']),
        ]);

        $collection2 = CollectionModel::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Annual Membership Fees',
            'description' => 'Annual membership fee collections',
            'created_by' => $admin->id,
            'status' => 'active',
            'version' => 1,
            'metadata' => json_encode(['region' => 'All', 'category' => 'Annual']),
        ]);

        // Create rates
        $rate1 = RateModel::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Standard Monthly Rate',
            'description' => 'Default monthly collection rate',
            'amount' => 100.00,
            'currency' => 'USD',
            'rate_type' => 'monthly',
            'collection_id' => $collection1->id,
            'version' => 1,
            'effective_from' => now()->startOfYear(),
            'effective_until' => now()->endOfYear(),
            'is_active' => true,
            'created_by' => $admin->id,
            'metadata' => json_encode(['tier' => 'standard']),
        ]);

        $rate2 = RateModel::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Premium Monthly Rate',
            'description' => 'Premium monthly collection rate',
            'amount' => 150.00,
            'currency' => 'USD',
            'rate_type' => 'monthly',
            'collection_id' => $collection1->id,
            'version' => 1,
            'effective_from' => now()->startOfYear(),
            'effective_until' => now()->endOfYear(),
            'is_active' => true,
            'created_by' => $admin->id,
            'metadata' => json_encode(['tier' => 'premium']),
        ]);

        $rate3 = RateModel::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Annual Membership Fee',
            'description' => 'One-time annual membership fee',
            'amount' => 500.00,
            'currency' => 'USD',
            'rate_type' => 'annual',
            'collection_id' => $collection2->id,
            'version' => 1,
            'effective_from' => now()->startOfYear(),
            'effective_until' => now()->endOfYear(),
            'is_active' => true,
            'created_by' => $admin->id,
            'metadata' => json_encode(['membership_type' => 'standard']),
        ]);

        // Create payments
        PaymentModel::create([
            'uuid' => (string) Str::uuid(),
            'payment_reference' => 'PAY-' . strtoupper(Str::random(10)),
            'collection_id' => $collection1->id,
            'rate_id' => $rate1->id,
            'payer_id' => $payer->id,
            'amount' => 100.00,
            'currency' => 'USD',
            'status' => 'completed',
            'payment_method' => 'cash',
            'notes' => 'January 2024 monthly payment',
            'payment_date' => now()->subDays(30),
            'processed_at' => now()->subDays(30),
            'is_automated' => false,
            'version' => 1,
            'created_by' => $collector->id,
            'idempotency_key' => 'demo_payment_1_' . Str::random(10),
            'metadata' => json_encode(['location' => 'Office A', 'collected_by' => 'John Collector']),
        ]);

        PaymentModel::create([
            'uuid' => (string) Str::uuid(),
            'payment_reference' => 'PAY-' . strtoupper(Str::random(10)),
            'collection_id' => $collection1->id,
            'rate_id' => $rate1->id,
            'payer_id' => $payer->id,
            'amount' => 100.00,
            'currency' => 'USD',
            'status' => 'completed',
            'payment_method' => 'card',
            'notes' => 'February 2024 monthly payment',
            'payment_date' => now()->subDays(15),
            'processed_at' => now()->subDays(15),
            'is_automated' => false,
            'version' => 1,
            'created_by' => $collector->id,
            'idempotency_key' => 'demo_payment_2_' . Str::random(10),
            'metadata' => json_encode(['location' => 'Office B', 'collected_by' => 'John Collector']),
        ]);

        PaymentModel::create([
            'uuid' => (string) Str::uuid(),
            'payment_reference' => 'PAY-' . strtoupper(Str::random(10)),
            'collection_id' => $collection1->id,
            'rate_id' => $rate2->id,
            'payer_id' => $payer->id,
            'amount' => 150.00,
            'currency' => 'USD',
            'status' => 'pending',
            'payment_method' => 'bank_transfer',
            'notes' => 'March 2024 premium monthly payment',
            'payment_date' => now(),
            'is_automated' => false,
            'version' => 1,
            'created_by' => $collector->id,
            'idempotency_key' => 'demo_payment_3_' . Str::random(10),
            'metadata' => json_encode(['location' => 'Office A', 'collected_by' => 'John Collector']),
        ]);

        PaymentModel::create([
            'uuid' => (string) Str::uuid(),
            'payment_reference' => 'PAY-' . strtoupper(Str::random(10)),
            'collection_id' => $collection2->id,
            'rate_id' => $rate3->id,
            'payer_id' => $payer->id,
            'amount' => 500.00,
            'currency' => 'USD',
            'status' => 'completed',
            'payment_method' => 'card',
            'notes' => 'Annual membership fee 2024',
            'payment_date' => now()->startOfYear(),
            'processed_at' => now()->startOfYear(),
            'is_automated' => true,
            'version' => 1,
            'created_by' => $admin->id,
            'idempotency_key' => 'demo_payment_4_' . Str::random(10),
            'metadata' => json_encode(['membership_year' => 2024, 'auto_generated' => true]),
        ]);

        $this->command->info('Demo data created successfully!');
        $this->command->info('');
        $this->command->info('Demo Users:');
        $this->command->info('- Admin: admin@example.com / password');
        $this->command->info('- Collector: collector@example.com / password');
        $this->command->info('- Payer: payer@example.com / password');
    }
}
