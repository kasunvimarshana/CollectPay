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
                'code' => 'SUP001',
                'contact_person' => 'John Smith',
                'phone' => '+1-555-0101',
                'email' => 'john@greenvalleyfarms.com',
                'address' => '123 Farm Road, Green Valley, CA 95001',
                'region' => 'California',
                'is_active' => true,
            ],
            [
                'name' => 'Mountain Fresh Produce',
                'code' => 'SUP002',
                'contact_person' => 'Sarah Johnson',
                'phone' => '+1-555-0102',
                'email' => 'sarah@mountainfresh.com',
                'address' => '456 Mountain View Drive, Denver, CO 80201',
                'region' => 'Colorado',
                'is_active' => true,
            ],
            [
                'name' => 'Coastal Growers Co.',
                'code' => 'SUP003',
                'contact_person' => 'Michael Chen',
                'phone' => '+1-555-0103',
                'email' => 'michael@coastalgrowers.com',
                'address' => '789 Ocean Boulevard, Seattle, WA 98101',
                'region' => 'Washington',
                'is_active' => true,
            ],
            [
                'name' => 'Sunrise Agriculture',
                'code' => 'SUP004',
                'contact_person' => 'Emily Davis',
                'phone' => '+1-555-0104',
                'email' => 'emily@sunriseag.com',
                'address' => '321 Sunrise Lane, Phoenix, AZ 85001',
                'region' => 'Arizona',
                'is_active' => true,
            ],
            [
                'name' => 'Valley Harvest Inc.',
                'code' => 'SUP005',
                'contact_person' => 'Robert Martinez',
                'phone' => '+1-555-0105',
                'email' => 'robert@valleyharvest.com',
                'address' => '654 Valley Street, Austin, TX 78701',
                'region' => 'Texas',
                'is_active' => true,
            ],
            [
                'name' => 'Plains Produce Group',
                'code' => 'SUP006',
                'contact_person' => 'Jennifer Wilson',
                'phone' => '+1-555-0106',
                'email' => 'jennifer@plainsproduce.com',
                'address' => '987 Plains Avenue, Omaha, NE 68102',
                'region' => 'Nebraska',
                'is_active' => false,
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }

        $this->command->info('Suppliers seeded successfully!');
    }
}
