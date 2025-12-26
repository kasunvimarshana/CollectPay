<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Supplier;
use App\Models\User;

class SupplierSeeder extends Seeder
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

        $suppliers = [
            ['name' => 'Rajapaksa Tea Estate', 'code' => 'SUP001', 'address' => 'Nuwara Eliya District', 'phone' => '+94771234567'],
            ['name' => 'Silva Plantations', 'code' => 'SUP002', 'address' => 'Kandy District', 'phone' => '+94771234568'],
            ['name' => 'Fernando Tea Gardens', 'code' => 'SUP003', 'address' => 'Badulla District', 'phone' => '+94771234569'],
            ['name' => 'Perera Highlands', 'code' => 'SUP004', 'address' => 'Ratnapura District', 'phone' => '+94771234570'],
            ['name' => 'Wickramasinghe Estate', 'code' => 'SUP005', 'address' => 'Matale District', 'phone' => '+94771234571'],
            ['name' => 'Jayawardena Farms', 'code' => 'SUP006', 'address' => 'Kegalle District', 'phone' => '+94771234572'],
            ['name' => 'Gunawardena Tea Co', 'code' => 'SUP007', 'address' => 'Nuwara Eliya District', 'phone' => '+94771234573'],
            ['name' => 'Dissanayake Plantation', 'code' => 'SUP008', 'address' => 'Kandy District', 'phone' => '+94771234574'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create([
                'id' => (string) Str::uuid(),
                'name' => $supplier['name'],
                'code' => $supplier['code'],
                'address' => $supplier['address'],
                'phone' => $supplier['phone'],
                'email' => strtolower(str_replace(' ', '', $supplier['code'])) . '@example.com',
                'notes' => 'Regular supplier',
                'user_id' => $collector->id,
                'version' => 1,
            ]);
        }
    }
}
