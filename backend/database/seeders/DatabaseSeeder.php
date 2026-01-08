<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles first (required for users)
        $this->call(RoleSeeder::class);

        // Create admin user
        $adminRole = Role::where('name', 'admin')->first();

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@ledger.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        // Create a collector user
        $collectorRole = Role::where('name', 'collector')->first();

        User::create([
            'name' => 'Collector User',
            'email' => 'collector@ledger.com',
            'password' => Hash::make('password'),
            'role_id' => $collectorRole->id,
            'is_active' => true,
        ]);

        // Seed core entities
        $this->call([
            SupplierSeeder::class,
            ProductSeeder::class,
            RateSeeder::class,
            CollectionSeeder::class,
            PaymentSeeder::class,
        ]);

        $this->command->info('All seeders completed successfully!');
    }
}
