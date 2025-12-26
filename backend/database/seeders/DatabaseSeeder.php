<?php

namespace Database\Seeders;

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
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@collectix.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'permissions' => ['*'],
            'is_active' => true,
        ]);

        // Create collector user
        User::create([
            'name' => 'Collector User',
            'email' => 'collector@collectix.test',
            'password' => Hash::make('password'),
            'role' => 'collector',
            'permissions' => ['collections.create', 'collections.read', 'collections.update'],
            'is_active' => true,
        ]);

        // Create finance user
        User::create([
            'name' => 'Finance User',
            'email' => 'finance@collectix.test',
            'password' => Hash::make('password'),
            'role' => 'finance',
            'permissions' => ['payments.*', 'collections.read', 'suppliers.read'],
            'is_active' => true,
        ]);

        // Create manager user
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@collectix.test',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'permissions' => ['*.read', 'reports.*'],
            'is_active' => true,
        ]);

        $this->command->info('Sample users created successfully!');
        $this->command->info('Admin: admin@collectix.test / password');
        $this->command->info('Collector: collector@collectix.test / password');
        $this->command->info('Finance: finance@collectix.test / password');
        $this->command->info('Manager: manager@collectix.test / password');
    }
}
