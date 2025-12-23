<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'Green Valley Farms',
                'contact_person' => 'John Smith',
                'phone' => '+1234567800',
                'email' => 'john@greenvalley.com',
                'address' => '123 Farm Road',
                'city' => 'Springfield',
                'state' => 'State A',
                'postal_code' => '12345',
                'latitude' => 40.7128,
                'longitude' => -74.0060,
                'status' => 'active',
            ],
            [
                'name' => 'Sunrise Dairy',
                'contact_person' => 'Mary Johnson',
                'phone' => '+1234567801',
                'email' => 'mary@sunrisedairy.com',
                'address' => '456 Dairy Lane',
                'city' => 'Riverside',
                'state' => 'State B',
                'postal_code' => '23456',
                'latitude' => 34.0522,
                'longitude' => -118.2437,
                'status' => 'active',
            ],
            [
                'name' => 'Highland Produce',
                'contact_person' => 'Robert Brown',
                'phone' => '+1234567802',
                'email' => 'robert@highland.com',
                'address' => '789 Hill Street',
                'city' => 'Mountain View',
                'state' => 'State C',
                'postal_code' => '34567',
                'latitude' => 37.7749,
                'longitude' => -122.4194,
                'status' => 'active',
            ],
        ];
        
        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}
