<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Payment;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $collector = User::where('email', 'john@fieldsyncledger.com')->first();

        if (!$collector) {
            return;
        }

        $suppliers = Supplier::all();

        foreach ($suppliers->take(5) as $supplier) {
            // Create an advance payment at the beginning of the month
            Payment::create([
                'id' => (string) Str::uuid(),
                'supplier_id' => $supplier->id,
                'amount' => 5000.00,
                'type' => 'advance',
                'payment_date' => Carbon::now()->startOfMonth(),
                'notes' => 'Advance payment for the month',
                'reference_number' => 'ADV-' . date('Ym') . '-' . rand(1000, 9999),
                'user_id' => $collector->id,
                'idempotency_key' => (string) Str::uuid(),
                'version' => 1,
            ]);

            // Create a partial payment mid-month
            Payment::create([
                'id' => (string) Str::uuid(),
                'supplier_id' => $supplier->id,
                'amount' => 3000.00,
                'type' => 'partial',
                'payment_date' => Carbon::now()->subDays(15),
                'notes' => 'Partial payment',
                'reference_number' => 'PAR-' . date('Ym') . '-' . rand(1000, 9999),
                'user_id' => $collector->id,
                'idempotency_key' => (string) Str::uuid(),
                'version' => 1,
            ]);
        }
    }
}
