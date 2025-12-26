<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Get password from environment or use strong default
        $defaultPassword = env('SEED_DEFAULT_PASSWORD', 'PaywiseSecure2025!');

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@paywise.com',
            'password' => bcrypt($defaultPassword),
            'role' => 'admin',
            'is_active' => true
        ]);

        // Create manager user
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@paywise.com',
            'password' => bcrypt($defaultPassword),
            'role' => 'manager',
            'is_active' => true
        ]);

        // Create collector user
        User::create([
            'name' => 'Collector User',
            'email' => 'collector@paywise.com',
            'password' => bcrypt($defaultPassword),
            'role' => 'collector',
            'is_active' => true
        ]);

        // Log the default password for development environments
        if (app()->environment('local', 'development')) {
            \Log::info("Default user password: {$defaultPassword}");
        }
    }
}
