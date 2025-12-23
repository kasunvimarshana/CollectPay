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
        // Create default users for testing and development
        
        // Admin user
        User::firstOrCreate(
            ['email' => 'admin@synccollect.test'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
                'attributes' => null,
            ]
        );

        // Manager user
        User::firstOrCreate(
            ['email' => 'manager@synccollect.test'],
            [
                'name' => 'Manager User',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'is_active' => true,
                'attributes' => null,
            ]
        );

        // Collector user
        User::firstOrCreate(
            ['email' => 'collector@synccollect.test'],
            [
                'name' => 'Collector User',
                'password' => Hash::make('password'),
                'role' => 'collector',
                'is_active' => true,
                'attributes' => [
                    'allowed_suppliers' => [], // Will be populated with supplier IDs
                ],
            ]
        );

        // Viewer user (read-only)
        User::firstOrCreate(
            ['email' => 'viewer@synccollect.test'],
            [
                'name' => 'Viewer User',
                'password' => Hash::make('password'),
                'role' => 'viewer',
                'is_active' => true,
                'attributes' => [
                    'allowed_suppliers' => [], // Will be populated with supplier IDs
                ],
            ]
        );
    }
}

