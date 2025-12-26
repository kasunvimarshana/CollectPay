<?php

namespace Database\Seeders;

use App\Domain\Supplier\Models\Supplier;
use App\Domain\User\Models\User;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $collectors = User::where('role', 'collector')->get();
        
        $suppliers = [
            ['name' => 'Ranjith Perera', 'region' => 'Central', 'address' => '123 Kandy Road, Kandy'],
            ['name' => 'Sunil Fernando', 'region' => 'Central', 'address' => '45 Hill Street, Nuwara Eliya'],
            ['name' => 'Kumari Silva', 'region' => 'Southern', 'address' => '78 Galle Road, Galle'],
            ['name' => 'Nimal Jayasinghe', 'region' => 'Southern', 'address' => '12 Beach Road, Matara'],
            ['name' => 'Kamal Bandara', 'region' => 'Western', 'address' => '56 Main Street, Colombo'],
            ['name' => 'Saman Kumara', 'region' => 'Western', 'address' => '89 Station Road, Negombo'],
            ['name' => 'Priya Mendis', 'region' => 'Central', 'address' => '34 Temple Road, Kandy'],
            ['name' => 'Lakmal Wijesinghe', 'region' => 'Southern', 'address' => '67 Fort Road, Galle'],
        ];

        foreach ($suppliers as $supplierData) {
            // Find appropriate collector for region
            $collector = $collectors->filter(function($c) use ($supplierData) {
                $metadata = json_decode($c->metadata ?? '{}', true);
                return ($metadata['region'] ?? '') === $supplierData['region'];
            })->first();

            Supplier::create([
                'name' => $supplierData['name'],
                'code' => null, // Auto-generated
                'phone' => '+9477' . rand(1000000, 9999999),
                'address' => $supplierData['address'],
                'region' => $supplierData['region'],
                'bank_name' => 'Bank of Ceylon',
                'bank_account' => rand(100000000, 999999999),
                'bank_branch' => $supplierData['region'] . ' Branch',
                'payment_method' => rand(0, 1) ? 'bank_transfer' : 'cash',
                'credit_limit' => rand(10, 50) * 10000,
                'opening_balance' => rand(0, 5) * 1000,
                'status' => 'active',
                'collector_id' => $collector?->id,
                'sync_status' => 'synced',
            ]);
        }
    }
}
